from rest_framework import viewsets
from accounts.mixins import TenantAwareViewSet
from .models import (Category, Brand, Unit, Product, Warehouse,
                     Stock, StockTransfer, StockTransferItem)
from .serializers import (CategorySerializer, BrandSerializer, UnitSerializer,
                          ProductSerializer, WarehouseSerializer, StockSerializer,
                          StockTransferSerializer, StockTransferItemSerializer)


class CategoryViewSet(TenantAwareViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filterset_fields = ['tenant', 'is_active', 'parent']
    search_fields = ['name']


class BrandViewSet(TenantAwareViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filterset_fields = ['tenant', 'is_active']
    search_fields = ['name']


class UnitViewSet(TenantAwareViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    filterset_fields = ['tenant']
    search_fields = ['name']


class ProductViewSet(TenantAwareViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filterset_fields = ['tenant', 'category', 'brand', 'unit', 'is_active']
    search_fields = ['name', 'sku', 'barcode']


class WarehouseViewSet(TenantAwareViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    filterset_fields = ['tenant', 'is_active', 'is_default']
    search_fields = ['name']


class StockViewSet(TenantAwareViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filterset_fields = ['tenant', 'warehouse', 'product']


class StockTransferViewSet(TenantAwareViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer
    filterset_fields = ['tenant', 'status', 'source_warehouse', 'destination_warehouse']


class StockTransferItemViewSet(TenantAwareViewSet):
    queryset = StockTransferItem.objects.all()
    serializer_class = StockTransferItemSerializer
    filterset_fields = ['stock_transfer', 'product']
