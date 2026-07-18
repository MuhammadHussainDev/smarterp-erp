import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  // ─── Payroll ────────────────────────────────────────────────────────

  async create(tenantId: string, dto: { month: number; year: number; status?: string }) {
    const payroll = await this.prisma.payroll.create({
      data: { tenantId, month: dto.month, year: dto.year, status: dto.status ?? "DRAFT" },
    });

    const employees = await this.prisma.employee.findMany({
      where: { tenantId, status: "ACTIVE" },
    });

    const items = employees.map((emp) => ({
      payrollId: payroll.id,
      employeeId: emp.id,
      basicSalary: emp.salary,
      allowances: 0,
      deductions: 0,
      tax: 0,
      netSalary: emp.salary,
    }));

    if (items.length > 0) {
      await this.prisma.payrollItem.createMany({ data: items });
    }

    return this.findOne(tenantId, payroll.id);
  }

  async findAll(tenantId: string, month?: number, year?: number) {
    const where: any = { tenantId };
    if (month) where.month = month;
    if (year) where.year = year;
    return this.prisma.payroll.findMany({
      where,
      include: { items: { include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  }

  async findOne(tenantId: string, id: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, tenantId },
      include: { items: { include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } } } },
    });
    if (!payroll) throw new NotFoundException("Payroll not found");
    return payroll;
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    await this.findOne(tenantId, id);
    return this.prisma.payroll.update({ where: { id }, data: { status } });
  }

  // ─── PayrollItem ───────────────────────────────────────────────────

  async updateItem(tenantId: string, id: string, dto: { allowances?: number; deductions?: number; tax?: number }) {
    const item = await this.prisma.payrollItem.findFirst({
      where: { id, payroll: { tenantId } },
      include: { payroll: true },
    });
    if (!item) throw new NotFoundException("Payroll item not found");

    const allowances = dto.allowances ?? item.allowances;
    const deductions = dto.deductions ?? item.deductions;
    const tax = dto.tax ?? item.tax;
    const netSalary = item.basicSalary + allowances - deductions - tax;

    return this.prisma.payrollItem.update({
      where: { id },
      data: { allowances, deductions, tax, netSalary },
    });
  }

  // ─── Benefit ───────────────────────────────────────────────────────

  async findAllBenefits(tenantId: string) {
    return this.prisma.benefit.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }

  async findOneBenefit(tenantId: string, id: string) {
    const benefit = await this.prisma.benefit.findFirst({ where: { id, tenantId } });
    if (!benefit) throw new NotFoundException("Benefit not found");
    return benefit;
  }

  async createBenefit(tenantId: string, dto: { name: string; description?: string; type: string; amount: number }) {
    return this.prisma.benefit.create({ data: { ...dto, tenantId } });
  }

  async updateBenefit(tenantId: string, id: string, dto: any) {
    await this.findOneBenefit(tenantId, id);
    return this.prisma.benefit.update({ where: { id }, data: dto });
  }

  async removeBenefit(tenantId: string, id: string) {
    await this.findOneBenefit(tenantId, id);
    return this.prisma.benefit.delete({ where: { id } });
  }

  // ─── EmployeeBenefit ───────────────────────────────────────────────

  async findAllEmployeeBenefits(tenantId: string) {
    return this.prisma.employeeBenefit.findMany({
      where: { tenantId },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } }, benefit: { select: { name: true, type: true, amount: true } } },
    });
  }

  async findOneEmployeeBenefit(tenantId: string, id: string) {
    const eb = await this.prisma.employeeBenefit.findFirst({
      where: { id, tenantId },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } }, benefit: { select: { name: true, type: true, amount: true } } },
    });
    if (!eb) throw new NotFoundException("Employee benefit not found");
    return eb;
  }

  async createEmployeeBenefit(tenantId: string, dto: { employeeId: string; benefitId: string; amount?: number }) {
    return this.prisma.employeeBenefit.create({ data: { ...dto, tenantId } });
  }

  async updateEmployeeBenefit(tenantId: string, id: string, dto: any) {
    await this.findOneEmployeeBenefit(tenantId, id);
    return this.prisma.employeeBenefit.update({ where: { id }, data: dto });
  }

  async removeEmployeeBenefit(tenantId: string, id: string) {
    await this.findOneEmployeeBenefit(tenantId, id);
    return this.prisma.employeeBenefit.delete({ where: { id } });
  }

  // ─── PerformanceReview ─────────────────────────────────────────────

  async findAllReviews(tenantId: string) {
    return this.prisma.performanceReview.findMany({
      where: { tenantId },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async createReview(
    tenantId: string,
    dto: { employeeId: string; reviewerId?: string; reviewDate?: string; rating?: number; comments?: string }
  ) {
    return this.prisma.performanceReview.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        reviewerId: dto.reviewerId,
        reviewDate: dto.reviewDate ? new Date(dto.reviewDate) : undefined,
        rating: dto.rating,
        comments: dto.comments,
      },
    });
  }

  async updateReview(tenantId: string, id: string, dto: any) {
    const review = await this.prisma.performanceReview.findFirst({ where: { id, tenantId } });
    if (!review) throw new NotFoundException("Performance review not found");
    return this.prisma.performanceReview.update({ where: { id }, data: dto });
  }

  // ─── Training ──────────────────────────────────────────────────────

  async findAllTrainings(tenantId: string) {
    return this.prisma.training.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  }

  async findOneTraining(tenantId: string, id: string) {
    const training = await this.prisma.training.findFirst({
      where: { id, tenantId },
      include: { employeeTrainings: { include: { employee: { select: { firstName: true, lastName: true } } } } },
    });
    if (!training) throw new NotFoundException("Training not found");
    return training;
  }

  async createTraining(tenantId: string, dto: { title: string; description?: string; startDate?: string; endDate?: string; status?: string }) {
    return this.prisma.training.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status ?? "PLANNED",
      },
    });
  }

  async updateTraining(tenantId: string, id: string, dto: any) {
    await this.findOneTraining(tenantId, id);
    return this.prisma.training.update({ where: { id }, data: dto });
  }

  async removeTraining(tenantId: string, id: string) {
    await this.findOneTraining(tenantId, id);
    return this.prisma.training.delete({ where: { id } });
  }

  // ─── EmployeeTraining ──────────────────────────────────────────────

  async findAllEmployeeTrainings(tenantId: string) {
    return this.prisma.employeeTraining.findMany({
      where: { tenantId },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeCode: true } },
        training: { select: { title: true } },
      },
    });
  }

  async createEmployeeTraining(tenantId: string, dto: { employeeId: string; trainingId: string }) {
    return this.prisma.employeeTraining.create({ data: { ...dto, tenantId } });
  }

  async completeEmployeeTraining(tenantId: string, id: string) {
    const et = await this.prisma.employeeTraining.findFirst({ where: { id, tenantId } });
    if (!et) throw new NotFoundException("Employee training not found");
    return this.prisma.employeeTraining.update({
      where: { id },
      data: { status: "COMPLETED", completedDate: new Date() },
    });
  }
}
