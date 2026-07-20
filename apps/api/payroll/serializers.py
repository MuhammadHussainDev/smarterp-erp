from rest_framework import serializers
from .models import (Payroll, PayrollItem, Benefit, EmployeeBenefit,
                     PerformanceReview, Training, EmployeeTraining)


class PayrollItemSerializer(serializers.ModelSerializer):
    employeeName = serializers.SerializerMethodField()
    basicSalary = serializers.FloatField(source='basic_salary')
    netSalary = serializers.FloatField(source='net_salary')

    class Meta:
        model = PayrollItem
        fields = ['id', 'payroll', 'employee', 'employeeName', 'basicSalary',
                  'allowances', 'deductions', 'tax', 'netSalary']

    def get_employeeName(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class PayrollSerializer(serializers.ModelSerializer):
    items = PayrollItemSerializer(many=True, read_only=True)

    class Meta:
        model = Payroll
        fields = '__all__'


class BenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Benefit
        fields = '__all__'


class EmployeeBenefitSerializer(serializers.ModelSerializer):
    employeeName = serializers.SerializerMethodField()
    benefitName = serializers.CharField(source='benefit.name', read_only=True)
    benefit_type = serializers.CharField(source='benefit.type', read_only=True)

    class Meta:
        model = EmployeeBenefit
        fields = ['id', 'tenant', 'employee', 'benefit', 'employeeName',
                  'benefitName', 'benefit_type', 'amount']

    def get_employeeName(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employeeName = serializers.SerializerMethodField()

    class Meta:
        model = PerformanceReview
        fields = ['id', 'tenant', 'employee', 'employeeName', 'review_date',
                  'rating', 'comments']

    def get_employeeName(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = '__all__'


class EmployeeTrainingSerializer(serializers.ModelSerializer):
    employeeName = serializers.SerializerMethodField()
    programTitle = serializers.CharField(source='training.title', read_only=True)

    class Meta:
        model = EmployeeTraining
        fields = ['id', 'tenant', 'employee', 'training', 'employeeName',
                  'programTitle', 'status', 'completed_date']

    def get_employeeName(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"
