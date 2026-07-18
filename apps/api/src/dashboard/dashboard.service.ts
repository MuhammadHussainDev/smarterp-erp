import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, totalBranches, totalDepartments, recentActivity, userActivity] =
      await Promise.all([
        this.prisma.user.count({ where: { tenantId, status: "ACTIVE" } }),
        this.prisma.branch.count({ where: { tenantId } }),
        this.prisma.department.count({ where: { tenantId } }),
        this.prisma.auditLog.findMany({
          where: { tenantId },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { firstName: true, lastName: true } } },
        }),
        this.prisma.user.findMany({
          where: { tenantId, status: "ACTIVE" },
          select: { id: true, firstName: true, lastName: true, email: true, lastLogin: true },
          take: 5,
          orderBy: { lastLogin: "desc" },
        }),
      ]);

    return {
      overview: {
        totalUsers,
        totalBranches,
        totalDepartments,
      },
      recentActivity,
      recentUsers: userActivity,
    };
  }
}
