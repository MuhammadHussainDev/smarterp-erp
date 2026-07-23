from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from tenant_mixin import TenantViewSetMixin
from .models import User, Role, UserRole
from .serializers import UserSerializer, RoleSerializer, UserRoleSerializer


PERMISSIONS_CATALOG = [
    {'id': 'crm_view', 'name': 'View CRM', 'module': 'crm'},
    {'id': 'crm_create', 'name': 'Create CRM', 'module': 'crm'},
    {'id': 'crm_edit', 'name': 'Edit CRM', 'module': 'crm'},
    {'id': 'crm_delete', 'name': 'Delete CRM', 'module': 'crm'},
    {'id': 'sales_view', 'name': 'View Sales', 'module': 'sales'},
    {'id': 'sales_create', 'name': 'Create Sales', 'module': 'sales'},
    {'id': 'sales_edit', 'name': 'Edit Sales', 'module': 'sales'},
    {'id': 'sales_delete', 'name': 'Delete Sales', 'module': 'sales'},
    {'id': 'purchasing_view', 'name': 'View Purchasing', 'module': 'purchasing'},
    {'id': 'purchasing_create', 'name': 'Create Purchasing', 'module': 'purchasing'},
    {'id': 'purchasing_edit', 'name': 'Edit Purchasing', 'module': 'purchasing'},
    {'id': 'purchasing_delete', 'name': 'Delete Purchasing', 'module': 'purchasing'},
    {'id': 'inventory_view', 'name': 'View Inventory', 'module': 'inventory'},
    {'id': 'inventory_create', 'name': 'Create Inventory', 'module': 'inventory'},
    {'id': 'inventory_edit', 'name': 'Edit Inventory', 'module': 'inventory'},
    {'id': 'inventory_delete', 'name': 'Delete Inventory', 'module': 'inventory'},
    {'id': 'warehouse_view', 'name': 'View Warehouse', 'module': 'warehouse'},
    {'id': 'warehouse_create', 'name': 'Create Warehouse', 'module': 'warehouse'},
    {'id': 'warehouse_edit', 'name': 'Edit Warehouse', 'module': 'warehouse'},
    {'id': 'warehouse_delete', 'name': 'Delete Warehouse', 'module': 'warehouse'},
    {'id': 'accounting_view', 'name': 'View Accounting', 'module': 'accounting'},
    {'id': 'accounting_create', 'name': 'Create Accounting', 'module': 'accounting'},
    {'id': 'accounting_edit', 'name': 'Edit Accounting', 'module': 'accounting'},
    {'id': 'accounting_delete', 'name': 'Delete Accounting', 'module': 'accounting'},
    {'id': 'hr_view', 'name': 'View HR', 'module': 'hr'},
    {'id': 'hr_create', 'name': 'Create HR', 'module': 'hr'},
    {'id': 'hr_edit', 'name': 'Edit HR', 'module': 'hr'},
    {'id': 'hr_delete', 'name': 'Delete HR', 'module': 'hr'},
    {'id': 'payroll_view', 'name': 'View Payroll', 'module': 'payroll'},
    {'id': 'payroll_create', 'name': 'Create Payroll', 'module': 'payroll'},
    {'id': 'payroll_edit', 'name': 'Edit Payroll', 'module': 'payroll'},
    {'id': 'payroll_delete', 'name': 'Delete Payroll', 'module': 'payroll'},
    {'id': 'settings_view', 'name': 'View Settings', 'module': 'settings'},
    {'id': 'settings_create', 'name': 'Create Settings', 'module': 'settings'},
    {'id': 'settings_edit', 'name': 'Edit Settings', 'module': 'settings'},
    {'id': 'settings_delete', 'name': 'Delete Settings', 'module': 'settings'},
    {'id': 'reports_view', 'name': 'View Reports', 'module': 'reports'},
]


class UserViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        for src, dst in [('firstName', 'first_name'), ('lastName', 'last_name')]:
            if src in data and dst not in data:
                data[dst] = data.pop(src)

        role_ids = data.pop('roleIds', [])

        email = data.get('email', '')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')

        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password='smarterp123',
            first_name=first_name,
            last_name=last_name,
            phone=data.get('phone', ''),
            tenant=request.user.tenant,
        )

        for rid in role_ids:
            try:
                role = Role.objects.get(id=rid, tenant=request.user.tenant)
                UserRole.objects.create(user=user, role=role)
            except Role.DoesNotExist:
                pass

        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoleViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    @action(detail=False, methods=['get'], url_path='permissions/all')
    def permissions_all(self, request):
        return Response(PERMISSIONS_CATALOG)


class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    filterset_fields = ['user', 'role']
