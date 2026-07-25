from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, F
from tenant_mixin import TenantViewSetMixin
from .models import Account, JournalEntry, JournalEntryLine, Budget, TaxRate
from .serializers import (AccountSerializer, JournalEntrySerializer,
                          JournalEntryLineSerializer, BudgetSerializer, TaxRateSerializer)


class AccountViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer


class JournalEntryViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer

    def create(self, request, *args, **kwargs):
        tenant = request.user.tenant
        line_items = request.data.get('lineItems', [])

        last_entry = JournalEntry.objects.filter(tenant=tenant).order_by('-created_at').first()
        if last_entry and last_entry.number and last_entry.number.startswith('JE-'):
            try:
                num = int(last_entry.number.split('-')[1]) + 1
            except (ValueError, IndexError):
                num = JournalEntry.objects.filter(tenant=tenant).count() + 1
        else:
            num = JournalEntry.objects.filter(tenant=tenant).count() + 1
        number = f"JE-{num:05d}"

        entry = JournalEntry.objects.create(
            tenant=tenant,
            number=number,
            description=request.data.get('description', ''),
            reference=request.data.get('reference', ''),
            status='DRAFT',
        )

        for li in line_items:
            account_id = li.get('accountId')
            if not account_id:
                continue
            try:
                account = Account.objects.get(id=account_id, tenant=tenant)
            except Account.DoesNotExist:
                continue
            JournalEntryLine.objects.create(
                journal_entry=entry,
                account=account,
                description=li.get('description', ''),
                debit=float(li.get('debit', 0) or 0),
                credit=float(li.get('credit', 0) or 0),
            )

        serializer = self.get_serializer(entry)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class JournalEntryLineViewSet(viewsets.ModelViewSet):
    queryset = JournalEntryLine.objects.all()
    serializer_class = JournalEntryLineSerializer
    filterset_fields = ['journal_entry', 'account']


class BudgetViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer


class TaxRateViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = TaxRate.objects.all()
    serializer_class = TaxRateSerializer


class ReportViewSet(viewsets.ViewSet):
    def get_queryset(self):
        return Account.objects.filter(tenant=self.request.user.tenant)

    def _account_balances(self, tenant):
        lines = JournalEntryLine.objects.filter(
            journal_entry__tenant=tenant,
            journal_entry__status='POSTED'
        ).values('account_id', 'account__type', 'account__code', 'account__name').annotate(
            total_debit=Sum('debit'), total_credit=Sum('credit')
        )
        result = {}
        for entry in lines:
            result[entry['account_id']] = {
                'id': entry['account_id'],
                'code': entry['account__code'],
                'name': entry['account__name'],
                'type': entry['account__type'],
                'balance': (entry['total_debit'] or 0) - (entry['total_credit'] or 0),
            }
        return result

    @action(detail=False, methods=['get'], url_path='balance-sheet')
    def balance_sheet(self, request):
        balances = self._account_balances(request.user.tenant)
        accounts = Account.objects.filter(tenant=request.user.tenant)
        asset_types = ['ASSET', 'CURRENT_ASSET', 'FIXED_ASSET']
        liability_types = ['LIABILITY', 'CURRENT_LIABILITY', 'LONG_TERM_LIABILITY']
        groups = []
        for label, types in [('Assets', asset_types), ('Liabilities', liability_types), ('Equity', ['EQUITY'])]:
            items = []
            for acct in accounts.filter(type__in=types):
                bal = balances.get(str(acct.id), {}).get('balance', 0)
                items.append({'id': str(acct.id), 'code': acct.code, 'name': acct.name, 'balance': bal})
            total = sum(i['balance'] for i in items)
            groups.append({'type': label, 'accounts': items, 'total': total})
        return Response(groups)

    @action(detail=False, methods=['get'], url_path='income-statement')
    def income_statement(self, request):
        balances = self._account_balances(request.user.tenant)
        accounts = Account.objects.filter(tenant=request.user.tenant)
        revenue_accts = accounts.filter(type='REVENUE')
        expense_accts = accounts.filter(type='EXPENSE')
        revenue_items = []
        for acct in revenue_accts:
            bal = balances.get(str(acct.id), {}).get('balance', 0)
            revenue_items.append({'id': str(acct.id), 'name': acct.name, 'amount': bal})
        expense_items = []
        for acct in expense_accts:
            bal = balances.get(str(acct.id), {}).get('balance', 0)
            expense_items.append({'id': str(acct.id), 'name': acct.name, 'amount': bal})
        total_revenue = sum(i['amount'] for i in revenue_items)
        total_expenses = sum(i['amount'] for i in expense_items)
        return Response({
            'revenue': {'items': revenue_items, 'total': total_revenue},
            'expenses': {'items': expense_items, 'total': total_expenses},
            'netIncome': total_revenue - total_expenses,
        })

    @action(detail=False, methods=['get'], url_path='trial-balance')
    def trial_balance(self, request):
        balances = self._account_balances(request.user.tenant)
        items = []
        for acct_id, info in balances.items():
            bal = info['balance']
            items.append({
                'id': info['id'],
                'code': info['code'],
                'name': info['name'],
                'debit': bal if bal > 0 else 0,
                'credit': abs(bal) if bal < 0 else 0,
            })
        return Response(items)


class FrontendReportViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'], url_path='sales-summary')
    def sales_summary(self, request):
        from sales.models import SalesOrder
        qs = SalesOrder.objects.filter(tenant=request.user.tenant)
        total = qs.aggregate(total=Sum('grand_total'))['total'] or 0
        return Response({'total_sales': total, 'order_count': qs.count()})

    @action(detail=False, methods=['get'], url_path='purchase-summary')
    def purchase_summary(self, request):
        from purchasing.models import PurchaseOrder
        qs = PurchaseOrder.objects.filter(tenant=request.user.tenant)
        total = qs.aggregate(total=Sum('grand_total'))['total'] or 0
        return Response({'total_purchases': total, 'order_count': qs.count()})

    @action(detail=False, methods=['get'], url_path='inventory-valuation')
    def inventory_valuation(self, request):
        from inventory.models import Product
        products = Product.objects.filter(tenant=request.user.tenant)
        return Response({'product_count': products.count()})

    @action(detail=False, methods=['get'], url_path='customer-analysis')
    def customer_analysis(self, request):
        from crm.models import Customer
        return Response({'customer_count': Customer.objects.filter(tenant=request.user.tenant).count()})

    @action(detail=False, methods=['get'], url_path='employee-summary')
    def employee_summary(self, request):
        from hr.models import Employee
        return Response({'employee_count': Employee.objects.filter(tenant=request.user.tenant).count()})

    @action(detail=False, methods=['get'], url_path='financial-summary')
    def financial_summary(self, request):
        accounts = Account.objects.filter(tenant=request.user.tenant)
        revenue = accounts.filter(type='REVENUE').aggregate(total=Sum('balance'))['total'] or 0
        expenses = accounts.filter(type='EXPENSE').aggregate(total=Sum('balance'))['total'] or 0
        return Response({'revenue': revenue, 'expenses': expenses, 'profit': revenue - expenses})
