import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where: { tenantId }, skip, take: limit,
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { orderDate: "desc" },
      }),
      this.prisma.salesOrder.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.salesOrder.findFirst({
      where: { id, tenantId },
      include: { customer: true, items: { orderBy: { sortOrder: "asc" } }, invoices: true },
    });
    if (!order) throw new NotFoundException("Sales order not found");
    return order;
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.salesOrder.update({ where: { id }, data: dto });
  }

  async invoice(tenantId: string, id: string) {
    const order = await this.findOne(tenantId, id);
    const count = await this.prisma.invoice.count({ where: { tenantId } });
    const invNumber = `INV-${String(count + 1).padStart(6, "0")}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        number: invNumber,
        salesOrderId: id,
        customerId: order.customerId,
        subtotal: order.subtotal,
        taxTotal: order.taxTotal,
        discountTotal: order.discountTotal,
        grandTotal: order.grandTotal,
      },
    });

    await this.prisma.salesOrder.update({ where: { id }, data: { status: "DELIVERED" } });
    return invoice;
  }
}
