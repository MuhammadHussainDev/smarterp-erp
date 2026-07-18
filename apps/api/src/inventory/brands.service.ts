import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.brand.findMany({
      where: { tenantId },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  }

  async create(tenantId: string, dto: any) {
    const existing = await this.prisma.brand.findFirst({ where: { tenantId, name: dto.name } });
    if (existing) throw new ConflictException("Brand name already exists");
    return this.prisma.brand.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: any) {
    const brand = await this.prisma.brand.findFirst({ where: { id, tenantId } });
    if (!brand) throw new NotFoundException("Brand not found");
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const brand = await this.prisma.brand.findFirst({ where: { id, tenantId } });
    if (!brand) throw new NotFoundException("Brand not found");
    await this.prisma.product.updateMany({ where: { brandId: id }, data: { brandId: null } });
    return this.prisma.brand.delete({ where: { id } });
  }
}
