from rest_framework import viewsets
from accounts.mixins import TenantAwareViewSet
from .models import (Quotation, QuotationItem, SalesOrder, SalesOrderItem,
                     Invoice, Payment, DeliveryNote, CreditNote)
from .serializers import (QuotationSerializer, QuotationItemSerializer,
                          SalesOrderSerializer, SalesOrderItemSerializer,
                          InvoiceSerializer, PaymentSerializer,
                          DeliveryNoteSerializer, CreditNoteSerializer)


class QuotationViewSet(TenantAwareViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer
    filterset_fields = ['tenant', 'status', 'customer']
    search_fields = ['number']


class QuotationItemViewSet(TenantAwareViewSet):
    queryset = QuotationItem.objects.all()
    serializer_class = QuotationItemSerializer
    filterset_fields = ['quotation']


class SalesOrderViewSet(TenantAwareViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer
    filterset_fields = ['tenant', 'status', 'customer']
    search_fields = ['number']


class SalesOrderItemViewSet(TenantAwareViewSet):
    queryset = SalesOrderItem.objects.all()
    serializer_class = SalesOrderItemSerializer
    filterset_fields = ['sales_order']


class InvoiceViewSet(TenantAwareViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    filterset_fields = ['tenant', 'status', 'customer']
    search_fields = ['number']


class PaymentViewSet(TenantAwareViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filterset_fields = ['tenant', 'method', 'customer', 'invoice']


class DeliveryNoteViewSet(TenantAwareViewSet):
    queryset = DeliveryNote.objects.all()
    serializer_class = DeliveryNoteSerializer
    filterset_fields = ['tenant', 'status', 'customer']


class CreditNoteViewSet(TenantAwareViewSet):
    queryset = CreditNote.objects.all()
    serializer_class = CreditNoteSerializer
    filterset_fields = ['tenant', 'status', 'customer', 'invoice']
