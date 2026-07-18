import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.quotation.count({ where: { tenantId } });
    return `QT-${String(count + 1).padStart(6, "0")}`;
  }

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where: { tenantId }, skip, take: limit,
        include: { customer: { select: { id: true, name: true } }, items: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.quotation.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const q = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
      include: { customer: true, items: { orderBy: { sortOrder: "asc" } } },
    });
    if (!q) throw new NotFoundException("Quotation not found");
    return q;
  }

  async create(tenantId: string, dto: any) {
    const { items, ...data } = dto;
    const number = await this.generateNumber(tenantId);

    const quotation = await this.prisma.quotation.create({
      data: {
        ...data,
        tenantId,
        number,
        items: { create: items?.map((item: any, i: number) => ({ ...item, sortOrder: i })) || [] },
      },
      include: { items: true },
    });

    const totals = this.calculateTotals(quotation.items);
    return this.prisma.quotation.update({ where: { id: quotation.id }, data: totals, include: { items: true } });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    const { items, ...data } = dto;

    if (items) {
      await this.prisma.quotationItem.deleteMany({ where: { quotationId: id } });
      await this.prisma.quotationItem.createMany({
        data: items.map((item: any, i: number) => ({ ...item, quotationId: id, sortOrder: i })),
      });
    }

    const updated = await this.prisma.quotation.update({
      where: { id },
      data,
      include: { items: true },
    });

    const totals = this.calculateTotals(updated.items);
    return this.prisma.quotation.update({ where: { id }, data: totals, include: { items: true } });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.quotation.delete({ where: { id } });
  }

  async convertToOrder(tenantId: string, id: string) {
    const quotation = await this.findOne(tenantId, id);

    const orderCount = await this.prisma.salesOrder.count({ where: { tenantId } });
    const orderNumber = `SO-${String(orderCount + 1).padStart(6, "0")}`;

    const order = await this.prisma.salesOrder.create({
      data: {
        tenantId,
        number: orderNumber,
        quotationId: id,
        customerId: quotation.customerId,
        contactId: quotation.contactId,
        subtotal: quotation.subtotal,
        taxTotal: quotation.taxTotal,
        discountTotal: quotation.discountTotal,
        grandTotal: quotation.grandTotal,
        items: {
          create: quotation.items.map((item, i) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discount: item.discount,
            total: item.total,
            sortOrder: i,
          })),
        },
      },
      include: { items: true },
    });

    await this.prisma.quotation.update({ where: { id }, data: { status: "ACCEPTED" } });
    return order;
  }

  private calculateTotals(items: any[]) {
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const discountTotal = items.reduce((sum, i) => sum + (i.discount || 0), 0);
    const taxTotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice - (i.discount || 0)) * (i.taxRate || 0) / 100, 0);
    const grandTotal = subtotal - discountTotal + taxTotal;
    return { subtotal, discountTotal, taxTotal, grandTotal };
  }
}
