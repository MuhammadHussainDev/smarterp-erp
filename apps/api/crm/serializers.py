from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import Customer, Contact, Lead, Opportunity, Meeting, Note


class CustomerSerializer(TenantAwareModelSerializer):
    tenant = serializers.PrimaryKeyRelatedField(read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'


class ContactSerializer(TenantAwareModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Contact
        fields = '__all__'


class LeadSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Lead
        fields = '__all__'


class OpportunitySerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Opportunity
        fields = '__all__'


class MeetingSerializer(TenantAwareModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Meeting
        fields = '__all__'


class NoteSerializer(TenantAwareModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'
