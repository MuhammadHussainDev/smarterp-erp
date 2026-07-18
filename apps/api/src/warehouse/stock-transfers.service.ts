import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StockTransfersService {
  constructor(private prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.stockTransfer.count({ where: { tenantId } });
    return `ST-${String(count + 1).padStart(6, "0")}`;
  }

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.stockTransfer.findMany({
        where: { tenantId }, skip, take: limit,
        include: {
          fromWarehouse: { select: { name: true } },
          toWarehouse: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.stockTransfer.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const st = await this.prisma.stockTransfer.findFirst({
      where: { id, tenantId },
      include: {
        fromWarehouse: true, toWarehouse: true,
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
    });
    if (!st) throw new NotFoundException("Stock transfer not found");
    return st;
  }

  async create(tenantId: string, dto: any) {
    const { items, ...data } = dto;
    const number = await this.generateNumber(tenantId);

    // Validate stock availability
    for (const item of items || []) {
      const stock = await this.prisma.stock.findUnique({
        where: { warehouseId_productId: { warehouseId: dto.fromWarehouseId, productId: item.productId } },
      });
      if (!stock || stock.quantity < item.quantity) {
        throw new ConflictException(`Insufficient stock for product ${item.productId}`);
      }
    }

    const transfer = await this.prisma.stockTransfer.create({
      data: {
        ...data, tenantId, number,
        items: { create: items?.map((item: any) => item) || [] },
      },
      include: { items: true },
    });

    // Execute the transfer
    if (dto.status === "COMPLETED") {
      await this.executeTransfer(tenantId, transfer);
    }

    return transfer;
  }

  async complete(tenantId: string, id: string) {
    const transfer = await this.findOne(tenantId, id);
    if (transfer.status === "COMPLETED") throw new ConflictException("Transfer already completed");
    await this.executeTransfer(tenantId, transfer);
    return this.prisma.stockTransfer.update({ where: { id }, data: { status: "COMPLETED" } });
  }

  private async executeTransfer(tenantId: string, transfer: any) {
    for (const item of transfer.items) {
      // Decrease from source
      const fromStock = await this.prisma.stock.findUnique({
        where: { warehouseId_productId: { warehouseId: transfer.fromWarehouseId, productId: item.productId } },
      });
      if (fromStock) {
        await this.prisma.stock.update({
          where: { id: fromStock.id },
          data: { quantity: fromStock.quantity - item.quantity },
        });
      }

      // Increase in destination
      const toStock = await this.prisma.stock.findUnique({
        where: { warehouseId_productId: { warehouseId: transfer.toWarehouseId, productId: item.productId } },
      });
      if (toStock) {
        await this.prisma.stock.update({
          where: { id: toStock.id },
          data: { quantity: toStock.quantity + item.quantity },
        });
      } else {
        await this.prisma.stock.create({
          data: { tenantId, warehouseId: transfer.toWarehouseId, productId: item.productId, quantity: item.quantity },
        });
      }
    }
  }

  async remove(tenantId: string, id: string) {
    const transfer = await this.findOne(tenantId, id);
    if (transfer.status === "COMPLETED") throw new ConflictException("Cannot delete completed transfer");
    return this.prisma.stockTransfer.delete({ where: { id } });
  }
}
