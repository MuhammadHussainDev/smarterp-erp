import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.unit.findMany({
      where: { tenantId },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  }

  async create(tenantId: string, dto: any) {
    const existing = await this.prisma.unit.findFirst({ where: { tenantId, name: dto.name } });
    if (existing) throw new ConflictException("Unit name already exists");
    return this.prisma.unit.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: any) {
    const unit = await this.prisma.unit.findFirst({ where: { id, tenantId } });
    if (!unit) throw new NotFoundException("Unit not found");
    return this.prisma.unit.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const unit = await this.prisma.unit.findFirst({ where: { id, tenantId } });
    if (!unit) throw new NotFoundException("Unit not found");
    await this.prisma.product.updateMany({ where: { unitId: id }, data: { unitId: null } });
    return this.prisma.unit.delete({ where: { id } });
  }
}
