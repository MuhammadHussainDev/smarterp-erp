from rest_framework import viewsets
from .models import (Payroll, PayrollItem, Benefit, EmployeeBenefit,
                     PerformanceReview, Training, EmployeeTraining)
from .serializers import (PayrollSerializer, PayrollItemSerializer,
                          BenefitSerializer, EmployeeBenefitSerializer,
                          PerformanceReviewSerializer, TrainingSerializer,
                          EmployeeTrainingSerializer)


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    filterset_fields = ['tenant', 'status', 'month', 'year']


class PayrollItemViewSet(viewsets.ModelViewSet):
    queryset = PayrollItem.objects.all()
    serializer_class = PayrollItemSerializer
    filterset_fields = ['payroll', 'employee']


class BenefitViewSet(viewsets.ModelViewSet):
    queryset = Benefit.objects.all()
    serializer_class = BenefitSerializer
    filterset_fields = ['tenant', 'type']


class EmployeeBenefitViewSet(viewsets.ModelViewSet):
    queryset = EmployeeBenefit.objects.all()
    serializer_class = EmployeeBenefitSerializer
    filterset_fields = ['tenant', 'employee', 'benefit']


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    filterset_fields = ['tenant', 'employee']


class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    filterset_fields = ['tenant', 'status']


class EmployeeTrainingViewSet(viewsets.ModelViewSet):
    queryset = EmployeeTraining.objects.all()
    serializer_class = EmployeeTrainingSerializer
    filterset_fields = ['tenant', 'employee', 'training', 'status']
