import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { tenantId }, skip, take: limit,
        include: { category: { select: { name: true } }, brand: { select: { name: true } }, unit: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.product.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: { category: true, brand: true, unit: true, stock: { include: { warehouse: { select: { name: true } } } } },
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async findByBarcode(tenantId: string, barcode: string) {
    const product = await this.prisma.product.findFirst({
      where: { tenantId, barcode },
      include: { stock: { include: { warehouse: { select: { name: true } } } } },
    });
    if (!product) throw new NotFoundException("Product not found by barcode");
    return product;
  }

  async create(tenantId: string, dto: any) {
    return this.prisma.product.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }
}
