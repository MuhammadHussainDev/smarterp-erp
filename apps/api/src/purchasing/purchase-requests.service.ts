import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PurchaseRequestsService {
  constructor(private prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.purchaseRequest.count({ where: { tenantId } });
    return `PR-${String(count + 1).padStart(6, "0")}`;
  }

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.purchaseRequest.findMany({ where: { tenantId }, skip, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.purchaseRequest.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const pr = await this.prisma.purchaseRequest.findFirst({
      where: { id, tenantId },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    if (!pr) throw new NotFoundException("Purchase request not found");
    return pr;
  }

  async create(tenantId: string, dto: any) {
    const { items, ...data } = dto;
    const number = await this.generateNumber(tenantId);
    return this.prisma.purchaseRequest.create({
      data: {
        ...data, tenantId, number,
        items: { create: items?.map((item: any, i: number) => ({ ...item, sortOrder: i })) || [] },
      },
      include: { items: true },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    const { items, ...data } = dto;
    if (items) {
      await this.prisma.purchaseRequestItem.deleteMany({ where: { purchaseRequestId: id } });
      await this.prisma.purchaseRequestItem.createMany({
        data: items.map((item: any, i: number) => ({ ...item, purchaseRequestId: id, sortOrder: i })),
      });
    }
    return this.prisma.purchaseRequest.update({ where: { id }, data, include: { items: true } });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.purchaseRequest.delete({ where: { id } });
  }
}
