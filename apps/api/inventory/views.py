from rest_framework import viewsets
from .models import (Category, Brand, Unit, Product, Warehouse,
                     Stock, StockTransfer, StockTransferItem)
from .serializers import (CategorySerializer, BrandSerializer, UnitSerializer,
                          ProductSerializer, WarehouseSerializer, StockSerializer,
                          StockTransferSerializer, StockTransferItemSerializer)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filterset_fields = ['tenant', 'is_active', 'parent']
    search_fields = ['name']


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filterset_fields = ['tenant', 'is_active']
    search_fields = ['name']


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    filterset_fields = ['tenant']
    search_fields = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filterset_fields = ['tenant', 'category', 'brand', 'unit', 'is_active']
    search_fields = ['name', 'sku', 'barcode']


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    filterset_fields = ['tenant', 'is_active', 'is_default']
    search_fields = ['name']


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filterset_fields = ['tenant', 'warehouse', 'product']


class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer
    filterset_fields = ['tenant', 'status', 'source_warehouse', 'destination_warehouse']


class StockTransferItemViewSet(viewsets.ModelViewSet):
    queryset = StockTransferItem.objects.all()
    serializer_class = StockTransferItemSerializer
    filterset_fields = ['stock_transfer', 'product']
