from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import (Payroll, PayrollItem, Benefit, EmployeeBenefit,
                     PerformanceReview, Training, EmployeeTraining)


class PayrollItemSerializer(TenantAwareModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = PayrollItem
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class PayrollSerializer(TenantAwareModelSerializer):
    items = PayrollItemSerializer(many=True, read_only=True)

    class Meta:
        model = Payroll
        fields = '__all__'


class BenefitSerializer(TenantAwareModelSerializer):
    class Meta:
        model = Benefit
        fields = '__all__'


class EmployeeBenefitSerializer(TenantAwareModelSerializer):
    employee_name = serializers.SerializerMethodField()
    benefit_name = serializers.CharField(source='benefit.name', read_only=True)

    class Meta:
        model = EmployeeBenefit
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class PerformanceReviewSerializer(TenantAwareModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = PerformanceReview
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class TrainingSerializer(TenantAwareModelSerializer):
    class Meta:
        model = Training
        fields = '__all__'


class EmployeeTrainingSerializer(TenantAwareModelSerializer):
    employee_name = serializers.SerializerMethodField()
    training_title = serializers.CharField(source='training.title', read_only=True)

    class Meta:
        model = EmployeeTraining
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


