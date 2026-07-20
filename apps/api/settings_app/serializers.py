from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import Company, Branch, Department


class CompanySerializer(TenantAwareModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class BranchSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Branch
        fields = '__all__'


class DepartmentSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Department
        fields = '__all__'


