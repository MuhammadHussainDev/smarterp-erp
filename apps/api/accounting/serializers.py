from rest_framework import serializers
from tenant_serializer_mixin import TenantSerializerMixin
from .models import Account, JournalEntry, JournalEntryLine, Budget, TaxRate


class AccountSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Account
        fields = '__all__'


class JournalEntryLineSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = JournalEntryLine
        fields = '__all__'


class JournalEntrySerializer(TenantSerializerMixin, serializers.ModelSerializer):
    lines = JournalEntryLineSerializer(many=True, read_only=True)

    class Meta:
        model = JournalEntry
        fields = '__all__'


class BudgetSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = Budget
        fields = '__all__'
        extra_kwargs = {
            'account': {'required': False},
        }

    def to_internal_value(self, data):
        mapped = dict(data)
        if 'accountId' in data:
            mapped['account'] = mapped.pop('accountId')
        if 'fiscalYear' in data:
            mapped['fiscal_year'] = mapped.pop('fiscalYear')
        return super().to_internal_value(mapped)


class TaxRateSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = TaxRate
        fields = '__all__'
