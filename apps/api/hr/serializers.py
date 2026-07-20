from rest_framework import serializers
from tenant_serializer_mixin import TenantSerializerMixin
from .models import Employee, Attendance, LeaveType, LeaveRequest


class EmployeeSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            for src, dst in [('employee_id', 'employee_code'), ('firstName', 'first_name'),
                              ('lastName', 'last_name'), ('hireDate', 'hire_date')]:
                if src in data and dst not in data:
                    data[dst] = data.pop(src)
        return super().to_internal_value(data)


class AttendanceSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class LeaveTypeSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'


class LeaveRequestSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"
