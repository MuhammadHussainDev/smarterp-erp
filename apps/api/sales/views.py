from rest_framework import viewsets
from tenant_mixin import TenantViewSetMixin
from .models import (Quotation, QuotationItem, SalesOrder, SalesOrderItem,
                     Invoice, Payment, DeliveryNote, CreditNote)
from .serializers import (QuotationSerializer, QuotationItemSerializer,
                          SalesOrderSerializer, SalesOrderItemSerializer,
                          InvoiceSerializer, PaymentSerializer,
                          DeliveryNoteSerializer, CreditNoteSerializer)


class QuotationViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer

    def perform_create(self, serializer):
        tenant = self.request.user.tenant
        last = Quotation.objects.filter(tenant=tenant).order_by('-created_at').first()
        if last and last.number and last.number.startswith('QTN-'):
            try:
                num = int(last.number.split('-')[1]) + 1
            except (ValueError, IndexError):
                num = Quotation.objects.filter(tenant=tenant).count() + 1
        else:
            num = Quotation.objects.filter(tenant=tenant).count() + 1
        serializer.save(tenant=tenant, number=f"QTN-{num:05d}")


class QuotationItemViewSet(viewsets.ModelViewSet):
    queryset = QuotationItem.objects.all()
    serializer_class = QuotationItemSerializer
    filterset_fields = ['quotation']


class SalesOrderViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer

    def perform_create(self, serializer):
        tenant = self.request.user.tenant
        last = SalesOrder.objects.filter(tenant=tenant).order_by('-created_at').first()
        if last and last.number and last.number.startswith('SO-'):
            try:
                num = int(last.number.split('-')[1]) + 1
            except (ValueError, IndexError):
                num = SalesOrder.objects.filter(tenant=tenant).count() + 1
        else:
            num = SalesOrder.objects.filter(tenant=tenant).count() + 1
        serializer.save(tenant=tenant, number=f"SO-{num:05d}")


class SalesOrderItemViewSet(viewsets.ModelViewSet):
    queryset = SalesOrderItem.objects.all()
    serializer_class = SalesOrderItemSerializer
    filterset_fields = ['sales_order']


class InvoiceViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def perform_create(self, serializer):
        tenant = self.request.user.tenant
        last = Invoice.objects.filter(tenant=tenant).order_by('-created_at').first()
        if last and last.number and last.number.startswith('INV-'):
            try:
                num = int(last.number.split('-')[1]) + 1
            except (ValueError, IndexError):
                num = Invoice.objects.filter(tenant=tenant).count() + 1
        else:
            num = Invoice.objects.filter(tenant=tenant).count() + 1
        serializer.save(tenant=tenant, number=f"INV-{num:05d}")


class PaymentViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer


class DeliveryNoteViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = DeliveryNote.objects.all()
    serializer_class = DeliveryNoteSerializer


class CreditNoteViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = CreditNote.objects.all()
    serializer_class = CreditNoteSerializer
