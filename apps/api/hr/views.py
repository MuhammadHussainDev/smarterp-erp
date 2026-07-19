from rest_framework import viewsets
from .models import Employee, Attendance, LeaveType, LeaveRequest
from .serializers import (EmployeeSerializer, AttendanceSerializer,
                          LeaveTypeSerializer, LeaveRequestSerializer)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filterset_fields = ['tenant', 'status', 'department']
    search_fields = ['first_name', 'last_name', 'employee_code', 'email']


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    filterset_fields = ['tenant', 'status', 'employee', 'date']


class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    filterset_fields = ['tenant']


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    filterset_fields = ['tenant', 'status', 'employee', 'leave_type']
