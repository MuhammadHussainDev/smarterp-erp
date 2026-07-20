from rest_framework import viewsets
from accounts.mixins import TenantAwareViewSet
from .models import (Supplier, PurchaseRequest, PurchaseRequestItem,
                     PurchaseOrder, PurchaseOrderItem, GoodsReceipt,
                     SupplierInvoice, SupplierPayment)
from .serializers import (SupplierSerializer, PurchaseRequestSerializer,
                          PurchaseRequestItemSerializer, PurchaseOrderSerializer,
                          PurchaseOrderItemSerializer, GoodsReceiptSerializer,
                          SupplierInvoiceSerializer, SupplierPaymentSerializer)


class SupplierViewSet(TenantAwareViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    filterset_fields = ['tenant', 'status']
    search_fields = ['name', 'contact_name', 'email']


class PurchaseRequestViewSet(TenantAwareViewSet):
    queryset = PurchaseRequest.objects.all()
    serializer_class = PurchaseRequestSerializer
    filterset_fields = ['tenant', 'status', 'supplier']
    search_fields = ['number']


class PurchaseRequestItemViewSet(TenantAwareViewSet):
    queryset = PurchaseRequestItem.objects.all()
    serializer_class = PurchaseRequestItemSerializer
    filterset_fields = ['purchase_request']


class PurchaseOrderViewSet(TenantAwareViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    filterset_fields = ['tenant', 'status', 'supplier']
    search_fields = ['number']


class PurchaseOrderItemViewSet(TenantAwareViewSet):
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer
    filterset_fields = ['purchase_order']


class GoodsReceiptViewSet(TenantAwareViewSet):
    queryset = GoodsReceipt.objects.all()
    serializer_class = GoodsReceiptSerializer
    filterset_fields = ['tenant', 'status', 'purchase_order']


class SupplierInvoiceViewSet(TenantAwareViewSet):
    queryset = SupplierInvoice.objects.all()
    serializer_class = SupplierInvoiceSerializer
    filterset_fields = ['tenant', 'status', 'supplier']


class SupplierPaymentViewSet(TenantAwareViewSet):
    queryset = SupplierPayment.objects.all()
    serializer_class = SupplierPaymentSerializer
    filterset_fields = ['tenant', 'supplier', 'supplier_invoice']
