from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import (Supplier, PurchaseRequest, PurchaseRequestItem,
                     PurchaseOrder, PurchaseOrderItem, GoodsReceipt,
                     SupplierInvoice, SupplierPayment)


class SupplierSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Supplier
        fields = '__all__'


class PurchaseRequestItemSerializer(TenantAwareModelSerializer):
    class Meta:
        model = PurchaseRequestItem
        fields = '__all__'


class PurchaseRequestSerializer(TenantAwareModelSerializer):
    items = PurchaseRequestItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = PurchaseRequest
        fields = '__all__'


class PurchaseOrderItemSerializer(TenantAwareModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'


class PurchaseOrderSerializer(TenantAwareModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'


class GoodsReceiptSerializer(TenantAwareModelSerializer):
    class Meta:
        model = GoodsReceipt
        fields = '__all__'


class SupplierInvoiceSerializer(TenantAwareModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = SupplierInvoice
        fields = '__all__'


class SupplierPaymentSerializer(TenantAwareModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = SupplierPayment
        fields = '__all__'


