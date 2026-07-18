import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.purchaseOrder.count({ where: { tenantId } });
    return `PO-${String(count + 1).padStart(6, "0")}`;
  }

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where: { tenantId }, skip, take: limit,
        include: { supplier: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.purchaseOrder.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: { supplier: true, items: { orderBy: { sortOrder: "asc" } } },
    });
    if (!po) throw new NotFoundException("Purchase order not found");
    return po;
  }

  async create(tenantId: string, dto: any) {
    const { items, ...data } = dto;
    const number = await this.generateNumber(tenantId);

    const po = await this.prisma.purchaseOrder.create({
      data: {
        ...data,
        tenantId,
        number,
        items: { create: items?.map((item: any, i: number) => ({ ...item, sortOrder: i })) || [] },
      },
      include: { items: true },
    });

    const totals = this.calculateTotals(po.items);
    return this.prisma.purchaseOrder.update({ where: { id: po.id }, data: totals, include: { items: true } });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    const { items, ...data } = dto;

    if (items) {
      await this.prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
      await this.prisma.purchaseOrderItem.createMany({
        data: items.map((item: any, i: number) => ({ ...item, purchaseOrderId: id, sortOrder: i })),
      });
    }

    const updated = await this.prisma.purchaseOrder.update({ where: { id }, data, include: { items: true } });
    const totals = this.calculateTotals(updated.items);
    return this.prisma.purchaseOrder.update({ where: { id }, data: totals, include: { items: true } });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }

  private calculateTotals(items: any[]) {
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const taxTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice * (i.taxRate || 0) / 100, 0);
    const grandTotal = subtotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  }
}
