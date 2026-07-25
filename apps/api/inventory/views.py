from rest_framework import viewsets
from tenant_mixin import TenantViewSetMixin
from .models import (Category, Brand, Unit, Product, Warehouse,
                     Stock, StockTransfer, StockTransferItem)
from .serializers import (CategorySerializer, BrandSerializer, UnitSerializer,
                          ProductSerializer, WarehouseSerializer, StockSerializer,
                          StockTransferSerializer, StockTransferItemSerializer)


class CategoryViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class BrandViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer


class UnitViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer


class ProductViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class WarehouseViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer


class StockViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer


class StockTransferViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer

    def perform_create(self, serializer):
        tenant = self.request.user.tenant
        last = StockTransfer.objects.filter(tenant=tenant).order_by('-created_at').first()
        if last and last.number and last.number.startswith('ST-'):
            try:
                num = int(last.number.split('-')[1]) + 1
            except (ValueError, IndexError):
                num = StockTransfer.objects.filter(tenant=tenant).count() + 1
        else:
            num = StockTransfer.objects.filter(tenant=tenant).count() + 1
        serializer.save(tenant=tenant, number=f"ST-{num:05d}")


class StockTransferItemViewSet(viewsets.ModelViewSet):
    queryset = StockTransferItem.objects.all()
    serializer_class = StockTransferItemSerializer
    filterset_fields = ['stock_transfer', 'product']
