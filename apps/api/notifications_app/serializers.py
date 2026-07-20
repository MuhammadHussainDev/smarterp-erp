from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import Notification


class NotificationSerializer(TenantAwareModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class NotificationReadSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    is_read = serializers.BooleanField(default=True)


