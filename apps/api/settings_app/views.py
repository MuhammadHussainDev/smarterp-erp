from rest_framework import viewsets
from accounts.mixins import TenantAwareViewSet
from .models import Company, Branch, Department
from .serializers import CompanySerializer, BranchSerializer, DepartmentSerializer


class CompanyViewSet(TenantAwareViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filterset_fields = ['tenant']


class BranchViewSet(TenantAwareViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    filterset_fields = ['tenant', 'is_active']


class DepartmentViewSet(TenantAwareViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filterset_fields = ['tenant', 'is_active']
