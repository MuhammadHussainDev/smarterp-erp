from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import (Quotation, QuotationItem, SalesOrder, SalesOrderItem,
                     Invoice, Payment, DeliveryNote, CreditNote)


class QuotationItemSerializer(TenantAwareModelSerializer):
    class Meta:
        model = QuotationItem
        fields = '__all__'


class QuotationSerializer(TenantAwareModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Quotation
        fields = '__all__'


class SalesOrderItemSerializer(TenantAwareModelSerializer):
    class Meta:
        model = SalesOrderItem
        fields = '__all__'


class SalesOrderSerializer(TenantAwareModelSerializer):
    items = SalesOrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = SalesOrder
        fields = '__all__'


class InvoiceSerializer(TenantAwareModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    balance_due = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = '__all__'

    def get_balance_due(self, obj):
        return obj.grand_total - obj.paid_amount


class PaymentSerializer(TenantAwareModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    invoice_number = serializers.CharField(source='invoice.number', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'


class DeliveryNoteSerializer(TenantAwareModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = DeliveryNote
        fields = '__all__'


class CreditNoteSerializer(TenantAwareModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = CreditNote
        fields = '__all__'


