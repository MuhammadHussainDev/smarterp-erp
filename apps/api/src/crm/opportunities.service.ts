import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where: { tenantId }, skip, take: limit,
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.opportunity.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const opp = await this.prisma.opportunity.findFirst({
      where: { id, tenantId },
      include: { customer: true },
    });
    if (!opp) throw new NotFoundException("Opportunity not found");
    return opp;
  }

  async create(tenantId: string, dto: any) {
    return this.prisma.opportunity.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.opportunity.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.opportunity.delete({ where: { id } });
  }

  async getPipeline(tenantId: string) {
    const stages = ["PROSPECTING", "QUALIFICATION", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];
    const pipeline = [];
    for (const stage of stages) {
      const opportunities = await this.prisma.opportunity.findMany({
        where: { tenantId, stage: stage as any },
        include: { customer: { select: { name: true } } },
      });
      const total = opportunities.reduce((sum, o) => sum + o.amount, 0);
      pipeline.push({ stage, opportunities, total });
    }
    return pipeline;
  }
}
