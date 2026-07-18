import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { tenantId },
        skip,
        take: limit,
        include: { _count: { select: { contacts: true, opportunities: true } } },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.customer.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: { contacts: true, opportunities: true, quotations: true, invoices: true },
    });
    if (!customer) throw new NotFoundException("Customer not found");
    return customer;
  }

  async create(tenantId: string, dto: any) {
    return this.prisma.customer.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.update({ where: { id }, data: { status: "INACTIVE" } });
  }
}
