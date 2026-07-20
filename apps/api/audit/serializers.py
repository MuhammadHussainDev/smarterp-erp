from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import AuditLog


class AuditLogSerializer(TenantAwareModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = '__all__'

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return None


