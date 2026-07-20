from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from tenant_mixin import TenantViewSetMixin
from .models import Company, Branch, Department
from .serializers import CompanySerializer, BranchSerializer, DepartmentSerializer


class CompanyViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    @action(detail=False, methods=['get', 'patch', 'post'])
    def current(self, request):
        company = Company.objects.filter(tenant=request.user.tenant).first()
        if not company:
            if request.method == 'GET':
                return Response({'detail': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
            serializer = CompanySerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save(tenant=request.user.tenant)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        if request.method == 'PATCH':
            serializer = CompanySerializer(company, data=request.data, partial=True, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        return Response(CompanySerializer(company).data)


class BranchViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


class DepartmentViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
