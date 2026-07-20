from rest_framework import serializers
from accounts.mixins import TenantAwareModelSerializer
from .models import (Category, Brand, Unit, Product, Warehouse,
                     Stock, StockTransfer, StockTransferItem)


class CategorySerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Category
        fields = '__all__'


class BrandSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Brand
        fields = '__all__'


class UnitSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Unit
        fields = '__all__'


class ProductSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'


class WarehouseSerializer(TenantAwareModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Warehouse
        fields = '__all__'


class StockSerializer(TenantAwareModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = Stock
        fields = '__all__'


class StockTransferItemSerializer(TenantAwareModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = StockTransferItem
        fields = '__all__'


class StockTransferSerializer(TenantAwareModelSerializer):
    items = StockTransferItemSerializer(many=True, read_only=True)
    source_warehouse_name = serializers.CharField(source='source_warehouse.name', read_only=True)
    destination_warehouse_name = serializers.CharField(source='destination_warehouse.name', read_only=True)

    class Meta:
        model = StockTransfer
        fields = '__all__'


