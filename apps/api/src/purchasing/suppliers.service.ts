import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({ where: { tenantId }, skip, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.supplier.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({ where: { id, tenantId }, include: { purchaseOrders: true } });
    if (!supplier) throw new NotFoundException("Supplier not found");
    return supplier;
  }

  async create(tenantId: string, dto: any) {
    return this.prisma.supplier.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.supplier.update({ where: { id }, data: { status: "INACTIVE" } });
  }
}
