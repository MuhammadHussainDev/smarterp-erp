from rest_framework import viewsets, serializers


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


class TenantAwareModelSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if hasattr(self.Meta.model, 'tenant') and 'tenant' in self.fields:
            self.fields['tenant'].read_only = True
            self.fields['tenant'].required = False
