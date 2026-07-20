from rest_framework import serializers
from tenant_serializer_mixin import TenantSerializerMixin
from .models import Recruitment


class RecruitmentSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Recruitment
        fields = '__all__'
