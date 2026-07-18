import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, type: string, title: string, message?: string, data?: any) {
    return this.prisma.notification.create({
      data: { tenantId, userId, type, title, message, data },
    });
  }

  async findAll(tenantId: string, userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { tenantId, userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.notification.count({ where: { tenantId, userId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async markAsRead(tenantId: string, userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, tenantId },
    });
    if (!notification) throw new NotFoundException("Notification not found");
    if (notification.userId !== userId) throw new ForbiddenException("Access denied");
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(tenantId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { tenantId, userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(tenantId: string, userId: string) {
    return this.prisma.notification.count({
      where: { tenantId, userId, isRead: false },
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, tenantId },
    });
    if (!notification) throw new NotFoundException("Notification not found");
    if (notification.userId !== userId) throw new ForbiddenException("Access denied");
    return this.prisma.notification.delete({ where: { id } });
  }

  async clearAll(tenantId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { tenantId, userId, isRead: true },
    });
  }
}
