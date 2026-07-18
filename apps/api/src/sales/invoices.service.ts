import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { tenantId }, skip, take: limit,
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { issueDate: "desc" },
      }),
      this.prisma.invoice.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const inv = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { customer: true, payments: true },
    });
    if (!inv) throw new NotFoundException("Invoice not found");
    return inv;
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.invoice.update({ where: { id }, data: dto });
  }

  async recordPayment(tenantId: string, invoiceId: string, dto: any) {
    await this.findOne(tenantId, invoiceId);

    const payment = await this.prisma.payment.create({
      data: { ...dto, tenantId, invoiceId, customerId: dto.customerId },
    });

    const totalPaid = await this.prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true },
    });

    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (invoice && totalPaid._sum.amount && totalPaid._sum.amount >= invoice.grandTotal) {
      await this.prisma.invoice.update({ where: { id: invoiceId }, data: { status: "PAID" } });
    }

    return payment;
  }
}
