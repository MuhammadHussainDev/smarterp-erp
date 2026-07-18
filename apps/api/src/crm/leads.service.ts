import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({ where: { tenantId }, skip, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.lead.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException("Lead not found");
    return lead;
  }

  async create(tenantId: string, dto: any) {
    return this.prisma.lead.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.lead.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.lead.delete({ where: { id } });
  }

  async convert(tenantId: string, id: string) {
    const lead = await this.findOne(tenantId, id);
    const customer = await this.prisma.customer.create({
      data: { tenantId, name: lead.companyName || lead.contactName, email: lead.email, phone: lead.phone, notes: lead.notes },
    });
    await this.prisma.lead.update({ where: { id }, data: { status: "QUALIFIED" } });
    return customer;
  }
}
