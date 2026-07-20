from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import Tenant, SubscriptionPlan, TenantSubscription

class TenantSerializer(TenantAwareModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'


class SubscriptionPlanSerializer(TenantAwareModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'


class TenantSubscriptionSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)

    class Meta:
        model = TenantSubscription
        fields = '__all__'


