from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'brands', views.BrandViewSet)
router.register(r'units', views.UnitViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'warehouses', views.WarehouseViewSet)
router.register(r'stock', views.StockViewSet)
router.register(r'stock-transfers', views.StockTransferViewSet)
router.register(r'stock-transfer-items', views.StockTransferItemViewSet)

urlpatterns = router.urls
