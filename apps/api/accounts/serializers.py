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


class RoleSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Role
        fields = '__all__'


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'
