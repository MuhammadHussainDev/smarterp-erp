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

    def perform_create(self, serializer):
        tenant = self.request.user.tenant
        last = PurchaseRequest.objects.filter(tenant=tenant).order_by('-created_at').first()
        if last and last.number and last.number.startswith('PR-'):
            try:
                num = int(last.number.split('-')[1]) + 1
            except (ValueError, IndexError):
                num = PurchaseRequest.objects.filter(tenant=tenant).count() + 1
        else:
            num = PurchaseRequest.objects.filter(tenant=tenant).count() + 1
        serializer.save(tenant=tenant, number=f"PR-{num:05d}")


class PurchaseRequestItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseRequestItem.objects.all()
    serializer_class = PurchaseRequestItemSerializer
    filterset_fields = ['purchase_request']


class PurchaseOrderViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer

    def perform_create(self, serializer):
        tenant = self.request.user.tenant
        last = PurchaseOrder.objects.filter(tenant=tenant).order_by('-created_at').first()
        if last and last.number and last.number.startswith('PO-'):
            try:
                num = int(last.number.split('-')[1]) + 1
            except (ValueError, IndexError):
                num = PurchaseOrder.objects.filter(tenant=tenant).count() + 1
        else:
            num = PurchaseOrder.objects.filter(tenant=tenant).count() + 1
        serializer.save(tenant=tenant, number=f"PO-{num:05d}")


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
