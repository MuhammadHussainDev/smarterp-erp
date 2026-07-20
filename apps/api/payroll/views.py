from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from tenant_mixin import TenantViewSetMixin
from .models import (Payroll, PayrollItem, Benefit, EmployeeBenefit,
                     PerformanceReview, Training, EmployeeTraining)
from .serializers import (PayrollSerializer, PayrollItemSerializer,
                          BenefitSerializer, EmployeeBenefitSerializer,
                          PerformanceReviewSerializer, TrainingSerializer,
                          EmployeeTrainingSerializer)


class PayrollViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        payroll = self.get_object()
        serializer = PayrollSerializer(payroll, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PayrollItemViewSet(viewsets.ModelViewSet):
    queryset = PayrollItem.objects.all()
    serializer_class = PayrollItemSerializer
    filterset_fields = ['payroll', 'employee']


class BenefitViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Benefit.objects.all()
    serializer_class = BenefitSerializer

    @action(detail=False, methods=['post'])
    def assign(self, request):
        data = {
            'employee': request.data.get('employeeId'),
            'benefit': request.data.get('benefitId'),
            'amount': request.data.get('amount'),
        }
        serializer = EmployeeBenefitSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(tenant=request.user.tenant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EmployeeBenefitViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = EmployeeBenefit.objects.all()
    serializer_class = EmployeeBenefitSerializer


class PerformanceReviewViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer


class TrainingViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer

    @action(detail=False, methods=['get'])
    def enrollments(self, request):
        enrollments = EmployeeTraining.objects.filter(tenant=request.user.tenant)
        serializer = EmployeeTrainingSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def enroll(self, request):
        data = {
            'employee': request.data.get('employeeId'),
            'training': request.data.get('trainingId'),
        }
        serializer = EmployeeTrainingSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(tenant=request.user.tenant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EmployeeTrainingViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = EmployeeTraining.objects.all()
    serializer_class = EmployeeTrainingSerializer

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        enrollment = self.get_object()
        enrollment.status = 'COMPLETED'
        enrollment.completed_date = timezone.now()
        enrollment.save()
        return Response(EmployeeTrainingSerializer(enrollment).data)
