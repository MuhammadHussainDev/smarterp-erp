from rest_framework import serializers
from tenant_serializer_mixin import TenantSerializerMixin
from .models import Company, Branch, Department


class CompanySerializer(TenantSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class BranchSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Branch
        fields = '__all__'


class DepartmentSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Department
        fields = '__all__'
