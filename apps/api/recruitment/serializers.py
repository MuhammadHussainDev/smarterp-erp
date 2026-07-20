from rest_framework import serializers
from .models import Recruitment


class RecruitmentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Recruitment
        fields = '__all__'
