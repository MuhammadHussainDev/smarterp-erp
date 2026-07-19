from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'quotations', views.QuotationViewSet)
router.register(r'quotation-items', views.QuotationItemViewSet)
router.register(r'orders', views.SalesOrderViewSet)
router.register(r'order-items', views.SalesOrderItemViewSet)
router.register(r'invoices', views.InvoiceViewSet)
router.register(r'payments', views.PaymentViewSet)
router.register(r'delivery-notes', views.DeliveryNoteViewSet)
router.register(r'credit-notes', views.CreditNoteViewSet)

urlpatterns = router.urls
