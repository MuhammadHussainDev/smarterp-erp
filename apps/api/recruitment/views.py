from rest_framework import viewsets
from accounts.mixins import TenantAwareViewSet
from .models import Recruitment
from .serializers import RecruitmentSerializer


class RecruitmentViewSet(TenantAwareViewSet):
    queryset = Recruitment.objects.all()
    serializer_class = RecruitmentSerializer
    filterset_fields = ['tenant', 'status', 'department']
    search_fields = ['position']
