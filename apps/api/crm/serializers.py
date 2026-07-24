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
    contactName = serializers.SerializerMethodField()
    companyName = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = '__all__'

    def get_contactName(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_companyName(self, obj):
        return obj.company or ""

    def to_internal_value(self, data):
        contact = data.get('contactName', '')
        if contact:
            parts = contact.split(' ', 1)
            data = {**data, 'first_name': parts[0], 'last_name': parts[1] if len(parts) > 1 else ''}
        elif not data.get('first_name'):
            data = {**data, 'first_name': ''}
        if 'companyName' in data:
            data = {**data, 'company': data.pop('companyName', '')}
        return super().to_internal_value(data)


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
