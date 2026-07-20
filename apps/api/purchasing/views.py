from rest_framework import viewsets
from tenant_mixin import TenantViewSetMixin
from .models import (Supplier, PurchaseRequest, PurchaseRequestItem,
                     PurchaseOrder, PurchaseOrderItem, GoodsReceipt,
                     SupplierInvoice, SupplierPayment)
from .serializers import (SupplierSerializer, PurchaseRequestSerializer,
                          PurchaseRequestItemSerializer, PurchaseOrderSerializer,
                          PurchaseOrderItemSerializer, GoodsReceiptSerializer,
                          SupplierInvoiceSerializer, SupplierPaymentSerializer)


class SupplierViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class PurchaseRequestViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = PurchaseRequest.objects.all()
    serializer_class = PurchaseRequestSerializer


class PurchaseRequestItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseRequestItem.objects.all()
    serializer_class = PurchaseRequestItemSerializer
    filterset_fields = ['purchase_request']


class PurchaseOrderViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer


class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer
    filterset_fields = ['purchase_order']


class GoodsReceiptViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = GoodsReceipt.objects.all()
    serializer_class = GoodsReceiptSerializer


class SupplierInvoiceViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = SupplierInvoice.objects.all()
    serializer_class = SupplierInvoiceSerializer


class SupplierPaymentViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = SupplierPayment.objects.all()
    serializer_class = SupplierPaymentSerializer
