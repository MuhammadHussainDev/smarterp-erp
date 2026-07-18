import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.stock.findMany({
        where: { tenantId, quantity: { gt: 0 } },
        skip, take: limit,
        include: {
          product: { select: { id: true, name: true, sku: true, barcode: true, sellingPrice: true, minStockLevel: true } },
          warehouse: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.stock.count({ where: { tenantId, quantity: { gt: 0 } } }),
    ]);

    const alerts = await this.prisma.stock.findMany({
      where: { tenantId, quantity: { gt: 0 } },
      include: { product: { select: { name: true, sku: true, minStockLevel: true } } },
    });
    const lowStock = alerts.filter(
      (s) => s.product.minStockLevel > 0 && s.quantity <= s.product.minStockLevel
    ).length;

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit), lowStock } };
  }

  async getByWarehouse(tenantId: string, warehouseId: string) {
    return this.prisma.stock.findMany({
      where: { tenantId, warehouseId, quantity: { gt: 0 } },
      include: { product: { select: { id: true, name: true, sku: true, barcode: true, sellingPrice: true } } },
      orderBy: { updatedAt: "desc" },
    });
  }

  async adjust(tenantId: string, productId: string, warehouseId: string, quantity: number) {
    const wh = await this.prisma.warehouse.findFirst({ where: { id: warehouseId, tenantId } });
    if (!wh) throw new NotFoundException("Warehouse not found");

    const existing = await this.prisma.stock.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } },
    });

    if (existing) {
      return this.prisma.stock.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return this.prisma.stock.create({
      data: { tenantId, warehouseId, productId, quantity: Math.max(0, quantity) },
    });
  }
}
