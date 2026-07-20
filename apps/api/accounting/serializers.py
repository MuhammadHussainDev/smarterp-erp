from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import Account, JournalEntry, JournalEntryLine, Budget, TaxRate


class AccountSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Account
        fields = '__all__'


class JournalEntryLineSerializer(TenantAwareModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = JournalEntryLine
        fields = '__all__'


class JournalEntrySerializer(TenantAwareModelSerializer):
    lines = JournalEntryLineSerializer(many=True, read_only=True)

    class Meta:
        model = JournalEntry
        fields = '__all__'


class BudgetSerializer(TenantAwareModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = Budget
        fields = '__all__'


class TaxRateSerializer(TenantAwareModelSerializer):
    class Meta:
        model = TaxRate
        fields = '__all__'


