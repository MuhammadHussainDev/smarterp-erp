from rest_framework import viewsets
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
