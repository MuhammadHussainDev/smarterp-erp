import json
from rest_framework import serializers
from .models import User, Role, UserRole


class UserSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'tenant', 'tenant_name', 'email', 'first_name', 'last_name',
                  'phone', 'avatar', 'status', 'email_verified', 'last_login',
                  'created_at', 'updated_at', 'roles']
        read_only_fields = ['password_hash']

    def get_roles(self, obj):
        return [{'id': ur.role.id, 'name': ur.role.name} for ur in obj.user_roles.all()]


def _parse_permissions(role):
    perms = role.permissions
    if isinstance(perms, str):
        try:
            return json.loads(perms)
        except (json.JSONDecodeError, TypeError):
            return []
    return perms if isinstance(perms, list) else []


class RoleSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    rolePermissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ['id', 'tenant', 'tenant_name', 'name', 'description', 'is_system',
                  'permissions', 'rolePermissions', 'created_at', 'updated_at']
        read_only_fields = ['is_system']

    def get_rolePermissions(self, obj):
        return [{'permissionId': pid} for pid in _parse_permissions(obj)]

    def to_internal_value(self, data):
        if 'permissionIds' in data:
            data = data.copy()
            data['permissions'] = json.dumps(data.pop('permissionIds'))
        return super().to_internal_value(data)


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'
