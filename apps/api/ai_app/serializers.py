from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField()
    context = serializers.CharField(required=False, allow_blank=True)


class InsightSerializer(serializers.Serializer):
    type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    data = serializers.JSONField(required=False)
