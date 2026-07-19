from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'suppliers', views.SupplierViewSet)
router.register(r'purchase-requests', views.PurchaseRequestViewSet)
router.register(r'purchase-request-items', views.PurchaseRequestItemViewSet)
router.register(r'purchase-orders', views.PurchaseOrderViewSet)
router.register(r'purchase-order-items', views.PurchaseOrderItemViewSet)
router.register(r'goods-receipts', views.GoodsReceiptViewSet)
router.register(r'supplier-invoices', views.SupplierInvoiceViewSet)
router.register(r'supplier-payments', views.SupplierPaymentViewSet)

urlpatterns = router.urls
