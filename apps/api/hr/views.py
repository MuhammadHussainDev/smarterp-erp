from rest_framework import viewsets
from tenant_mixin import TenantViewSetMixin
from .models import Employee, Attendance, LeaveType, LeaveRequest
from .serializers import (EmployeeSerializer, AttendanceSerializer,
                          LeaveTypeSerializer, LeaveRequestSerializer)


class EmployeeViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class AttendanceViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


class LeaveTypeViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer


class LeaveRequestViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
