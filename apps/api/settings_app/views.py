from rest_framework import viewsets
from tenant_mixin import TenantViewSetMixin
from .models import Company, Branch, Department
from .serializers import CompanySerializer, BranchSerializer, DepartmentSerializer


class CompanyViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class BranchViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


class DepartmentViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
