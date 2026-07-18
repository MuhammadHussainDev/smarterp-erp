import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        branches: true,
        departments: true,
        _count: { select: { users: true } },
      },
    });
    if (!tenant) throw new NotFoundException("Company not found");
    return tenant;
  }

  async updateProfile(tenantId: string, dto: UpdateCompanyDto) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: dto.name,
        logo: dto.logo,
        taxNumber: dto.taxNumber,
        currency: dto.currency,
        timezone: dto.timezone,
        fiscalYearStart: dto.fiscalYearStart ? new Date(dto.fiscalYearStart) : undefined,
      },
    });
  }

  async createBranch(tenantId: string, dto: CreateBranchDto) {
    if (dto.isDefault) {
      await this.prisma.branch.updateMany({
        where: { tenantId },
        data: { isDefault: false },
      });
    }

    return this.prisma.branch.create({
      data: { ...dto, tenantId },
    });
  }

  async getBranches(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId },
      include: { _count: { select: { departments: true } } },
    });
  }

  async getBranch(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId },
      include: { departments: true },
    });
    if (!branch) throw new NotFoundException("Branch not found");
    return branch;
  }

  async updateBranch(tenantId: string, id: string, dto: UpdateBranchDto) {
    if (dto.isDefault) {
      await this.prisma.branch.updateMany({
        where: { tenantId },
        data: { isDefault: false },
      });
    }

    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  async deleteBranch(tenantId: string, id: string) {
    const branch = await this.getBranch(tenantId, id);
    await this.prisma.department.updateMany({
      where: { branchId: id },
      data: { branchId: null },
    });
    await this.prisma.branch.delete({ where: { id } });
  }

  async createDepartment(tenantId: string, dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: { ...dto, tenantId },
    });
  }

  async getDepartments(tenantId: string) {
    return this.prisma.department.findMany({
      where: { tenantId },
      include: { branch: { select: { id: true, name: true } } },
    });
  }

  async getDepartment(tenantId: string, id: string) {
    const dept = await this.prisma.department.findFirst({
      where: { id, tenantId },
    });
    if (!dept) throw new NotFoundException("Department not found");
    return dept;
  }

  async updateDepartment(tenantId: string, id: string, dto: UpdateDepartmentDto) {
    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDepartment(tenantId: string, id: string) {
    await this.getDepartment(tenantId, id);
    await this.prisma.department.delete({ where: { id } });
  }
}
