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


class QuotationItemViewSet(viewsets.ModelViewSet):
    queryset = QuotationItem.objects.all()
    serializer_class = QuotationItemSerializer
    filterset_fields = ['quotation']


class SalesOrderViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer


class SalesOrderItemViewSet(viewsets.ModelViewSet):
    queryset = SalesOrderItem.objects.all()
    serializer_class = SalesOrderItemSerializer
    filterset_fields = ['sales_order']


class InvoiceViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer


class PaymentViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer


class DeliveryNoteViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = DeliveryNote.objects.all()
    serializer_class = DeliveryNoteSerializer


class CreditNoteViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = CreditNote.objects.all()
    serializer_class = CreditNoteSerializer
