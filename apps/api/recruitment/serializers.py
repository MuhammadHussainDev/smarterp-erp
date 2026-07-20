from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import Recruitment


class RecruitmentSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Recruitment
        fields = '__all__'


