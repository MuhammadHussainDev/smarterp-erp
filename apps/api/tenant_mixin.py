from rest_framework.response import Response
from rest_framework import status
import traceback


class TenantViewSetMixin:
    def get_queryset(self):
        return super().get_queryset().filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e), 'traceback': traceback.format_exc()},
                status=status.HTTP_400_BAD_REQUEST
            )
