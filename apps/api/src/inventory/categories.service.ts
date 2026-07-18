import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
      include: { _count: { select: { products: true } }, children: { include: { _count: { select: { products: true } } } } },
      orderBy: { name: "asc" },
    });
  }

  async create(tenantId: string, dto: any) {
    const existing = await this.prisma.category.findFirst({ where: { tenantId, name: dto.name } });
    if (existing) throw new ConflictException("Category name already exists");
    return this.prisma.category.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: any) {
    const cat = await this.prisma.category.findFirst({ where: { id, tenantId } });
    if (!cat) throw new NotFoundException("Category not found");
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const cat = await this.prisma.category.findFirst({ where: { id, tenantId } });
    if (!cat) throw new NotFoundException("Category not found");
    await this.prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    await this.prisma.category.updateMany({ where: { parentId: id }, data: { parentId: null } });
    return this.prisma.category.delete({ where: { id } });
  }
}
