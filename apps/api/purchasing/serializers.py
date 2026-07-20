from rest_framework import serializers
from tenant_serializer_mixin import TenantSerializerMixin
from .models import (Supplier, PurchaseRequest, PurchaseRequestItem,
                     PurchaseOrder, PurchaseOrderItem, GoodsReceipt,
                     SupplierInvoice, SupplierPayment)


class SupplierSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Supplier
        fields = '__all__'


class PurchaseRequestItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseRequestItem
        fields = '__all__'


class PurchaseRequestSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    items = PurchaseRequestItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = PurchaseRequest
        fields = '__all__'


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'


class PurchaseOrderSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'


class GoodsReceiptSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = GoodsReceipt
        fields = '__all__'


class SupplierInvoiceSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = SupplierInvoice
        fields = '__all__'


class SupplierPaymentSerializer(TenantSerializerMixin, serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = SupplierPayment
        fields = '__all__'
