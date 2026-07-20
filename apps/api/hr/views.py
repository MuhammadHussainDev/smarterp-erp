from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
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

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        leave = self.get_object()
        serializer = LeaveRequestSerializer(leave, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
