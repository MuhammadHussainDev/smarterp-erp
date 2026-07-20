from rest_framework import viewsets


class TenantAwareViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(qs.model, 'tenant'):
            return qs.filter(tenant=self.request.user.tenant)
        return qs

    def perform_create(self, serializer):
        if hasattr(serializer.Meta.model, 'tenant'):
            serializer.save(tenant=self.request.user.tenant)
        else:
            serializer.save()
