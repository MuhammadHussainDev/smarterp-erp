from rest_framework import viewsets
from tenant_mixin import TenantViewSetMixin
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = AuditLog.objects.all().order_by('-created_at')
    serializer_class = AuditLogSerializer
