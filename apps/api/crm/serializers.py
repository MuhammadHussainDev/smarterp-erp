from rest_framework import serializers
from tenant_serializer_mixin import TenantSerializerMixin
from .models import Customer, Contact, Lead, Opportunity, Meeting, Note


class CustomerSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'


class ContactSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Contact
        fields = '__all__'


class LeadSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Lead
        fields = '__all__'


class OpportunitySerializer(TenantSerializerMixin, serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Opportunity
        fields = '__all__'


class MeetingSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Meeting
        fields = '__all__'


class NoteSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'
