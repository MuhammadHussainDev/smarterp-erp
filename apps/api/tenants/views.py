from rest_framework import viewsets
from .models import Tenant, SubscriptionPlan, TenantSubscription
from .serializers import TenantSerializer, SubscriptionPlanSerializer, TenantSubscriptionSerializer

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    filterset_fields = ['status']

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    filterset_fields = ['is_active']

class TenantSubscriptionViewSet(viewsets.ModelViewSet):
    queryset = TenantSubscription.objects.all()
    serializer_class = TenantSubscriptionSerializer
    filterset_fields = ['status', 'tenant']
