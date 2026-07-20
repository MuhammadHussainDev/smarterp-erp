from rest_framework import viewsets
from accounts.mixins import TenantAwareViewSet
from .models import Account, JournalEntry, JournalEntryLine, Budget, TaxRate
from .serializers import (AccountSerializer, JournalEntrySerializer,
                          JournalEntryLineSerializer, BudgetSerializer, TaxRateSerializer)


class AccountViewSet(TenantAwareViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    filterset_fields = ['tenant', 'type', 'is_active', 'parent']
    search_fields = ['code', 'name']


class JournalEntryViewSet(TenantAwareViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    filterset_fields = ['tenant', 'status']
    search_fields = ['number', 'description']


class JournalEntryLineViewSet(TenantAwareViewSet):
    queryset = JournalEntryLine.objects.all()
    serializer_class = JournalEntryLineSerializer
    filterset_fields = ['journal_entry', 'account']


class BudgetViewSet(TenantAwareViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    filterset_fields = ['tenant', 'fiscal_year', 'account']


class TaxRateViewSet(TenantAwareViewSet):
    queryset = TaxRate.objects.all()
    serializer_class = TaxRateSerializer
    filterset_fields = ['tenant', 'type', 'is_active']
