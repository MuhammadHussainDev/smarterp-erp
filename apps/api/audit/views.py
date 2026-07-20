from rest_framework import viewsets
from accounts.mixins import TenantAwareViewSet
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(TenantAwareViewSet):
    queryset = AuditLog.objects.all().order_by('-created_at')
    serializer_class = AuditLogSerializer
    filterset_fields = ['tenant', 'user', 'action', 'entity']
    search_fields = ['action', 'entity', 'entity_id']
