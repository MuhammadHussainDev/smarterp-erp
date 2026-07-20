from rest_framework import viewsets
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


class PayrollItemViewSet(viewsets.ModelViewSet):
    queryset = PayrollItem.objects.all()
    serializer_class = PayrollItemSerializer
    filterset_fields = ['payroll', 'employee']


class BenefitViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Benefit.objects.all()
    serializer_class = BenefitSerializer


class EmployeeBenefitViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = EmployeeBenefit.objects.all()
    serializer_class = EmployeeBenefitSerializer


class PerformanceReviewViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer


class TrainingViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer


class EmployeeTrainingViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = EmployeeTraining.objects.all()
    serializer_class = EmployeeTrainingSerializer
