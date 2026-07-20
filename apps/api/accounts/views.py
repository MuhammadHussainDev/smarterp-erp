from rest_framework import viewsets
from accounts.mixins import TenantAwareViewSet
from .models import User, Role, UserRole
from .serializers import UserSerializer, RoleSerializer, UserRoleSerializer


class UserViewSet(TenantAwareViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filterset_fields = ['tenant', 'status']
    search_fields = ['first_name', 'last_name', 'email']


class RoleViewSet(TenantAwareViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    filterset_fields = ['tenant', 'is_system']
    search_fields = ['name']


class UserRoleViewSet(TenantAwareViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    filterset_fields = ['user', 'role']
