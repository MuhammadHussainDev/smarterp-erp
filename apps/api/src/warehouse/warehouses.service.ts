import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.warehouse.findMany({
      where: { tenantId },
      include: { _count: { select: { stock: true } } },
      orderBy: { name: "asc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const wh = await this.prisma.warehouse.findFirst({
      where: { id, tenantId },
      include: { stock: { include: { product: { select: { name: true, sku: true } } } } },
    });
    if (!wh) throw new NotFoundException("Warehouse not found");
    return wh;
  }

  async create(tenantId: string, dto: any) {
    const existing = await this.prisma.warehouse.findFirst({ where: { tenantId, name: dto.name } });
    if (existing) throw new ConflictException("Warehouse name already exists");

    if (dto.isDefault) {
      await this.prisma.warehouse.updateMany({ where: { tenantId }, data: { isDefault: false } });
    }
    return this.prisma.warehouse.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    if (dto.isDefault) {
      await this.prisma.warehouse.updateMany({ where: { tenantId }, data: { isDefault: false } });
    }
    return this.prisma.warehouse.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const wh = await this.findOne(tenantId, id);
    const stockCount = await this.prisma.stock.count({ where: { warehouseId: id, quantity: { gt: 0 } } });
    if (stockCount > 0) throw new ConflictException("Cannot delete warehouse with stock. Transfer stock first.");
    return this.prisma.warehouse.delete({ where: { id } });
  }
}
