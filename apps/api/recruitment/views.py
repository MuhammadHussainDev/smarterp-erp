from rest_framework import viewsets
from tenant_mixin import TenantViewSetMixin
from .models import Recruitment
from .serializers import RecruitmentSerializer


class RecruitmentViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Recruitment.objects.all()
    serializer_class = RecruitmentSerializer
