from rest_framework.routers import DefaultRouter
from django.urls import path, include
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

urlpatterns = [
    path('stores/', views.WarehouseViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('stores/<uuid:pk>/', views.WarehouseViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'})),
    path('transfers/', views.StockTransferViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('transfers/<uuid:pk>/', views.StockTransferViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'})),
    path('', include(router.urls)),
]
