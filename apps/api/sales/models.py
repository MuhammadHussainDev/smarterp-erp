import uuid
from django.db import models
from tenants.models import Tenant
from crm.models import Customer


class Quotation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='quotations')
    number = models.CharField(max_length=50)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='quotations')
    quotation_date = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, default='DRAFT')
    subtotal = models.FloatField(default=0)
    tax_total = models.FloatField(default=0)
    discount_total = models.FloatField(default=0)
    grand_total = models.FloatField(default=0)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'quotations'
        unique_together = ['tenant', 'number']

    def __str__(self):
        return f"{self.number} - {self.customer.name}"


class QuotationItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=500)
    quantity = models.FloatField(default=1)
    unit_price = models.FloatField(default=0)
    tax_rate = models.FloatField(default=0)
    discount = models.FloatField(default=0)
    total = models.FloatField(default=0)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'quotation_items'


class SalesOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='sales_orders')
    number = models.CharField(max_length=50)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='sales_orders')
    quotation = models.ForeignKey(Quotation, on_delete=models.SET_NULL, blank=True, null=True, related_name='sales_orders')
    order_date = models.DateTimeField(auto_now_add=True)
    expected_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, default='PENDING')
    subtotal = models.FloatField(default=0)
    tax_total = models.FloatField(default=0)
    discount_total = models.FloatField(default=0)
    grand_total = models.FloatField(default=0)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sales_orders'
        unique_together = ['tenant', 'number']

    def __str__(self):
        return f"{self.number} - {self.customer.name}"


class SalesOrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=500)
    quantity = models.FloatField(default=1)
    unit_price = models.FloatField(default=0)
    tax_rate = models.FloatField(default=0)
    discount = models.FloatField(default=0)
    total = models.FloatField(default=0)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'sales_order_items'


class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='invoices')
    number = models.CharField(max_length=50)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.SET_NULL, blank=True, null=True)
    invoice_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, default='DRAFT')
    subtotal = models.FloatField(default=0)
    tax_total = models.FloatField(default=0)
    discount_total = models.FloatField(default=0)
    grand_total = models.FloatField(default=0)
    paid_amount = models.FloatField(default=0)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoices'
        unique_together = ['tenant', 'number']

    def __str__(self):
        return f"{self.number} - {self.customer.name}"


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, blank=True, null=True, related_name='payments')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='payments')
    amount = models.FloatField()
    method = models.CharField(max_length=50, default='BANK_TRANSFER')
    reference = models.CharField(max_length=255, blank=True, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'payments'


class DeliveryNote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='delivery_notes')
    number = models.CharField(max_length=50)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, blank=True, null=True, related_name='delivery_notes')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='delivery_notes')
    delivery_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='DRAFT')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'delivery_notes'
        unique_together = ['tenant', 'number']


class CreditNote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='credit_notes')
    number = models.CharField(max_length=50)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, blank=True, null=True, related_name='credit_notes')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='credit_notes')
    credit_date = models.DateTimeField(auto_now_add=True)
    amount = models.FloatField(default=0)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='DRAFT')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'credit_notes'
        unique_together = ['tenant', 'number']
