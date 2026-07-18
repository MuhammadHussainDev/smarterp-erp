import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { CreateLeaveTypeDto } from "./dto/create-leave-type.dto";
import { UpdateLeaveTypeDto } from "./dto/update-leave-type.dto";
import { CreateLeaveRequestDto } from "./dto/create-leave-request.dto";
import { UpdateLeaveStatusDto } from "./dto/update-leave-status.dto";
import { CreateRecruitmentDto } from "./dto/create-recruitment.dto";
import { UpdateRecruitmentDto } from "./dto/update-recruitment.dto";

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  private async generateEmployeeCode(tenantId: string): Promise<string> {
    const last = await this.prisma.employee.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: { employeeCode: true },
    });
    const num = last ? parseInt(last.employeeCode.replace("EMP-", ""), 10) + 1 : 1;
    return `EMP-${String(num).padStart(4, "0")}`;
  }

  async createEmployee(tenantId: string, dto: CreateEmployeeDto) {
    const employeeCode = await this.generateEmployeeCode(tenantId);
    return this.prisma.employee.create({
      data: { ...dto, employeeCode, tenantId, hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined },
    });
  }

  async findAllEmployees(tenantId: string, search?: string) {
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    return this.prisma.employee.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async findOneEmployee(tenantId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id, tenantId } });
    if (!employee) throw new NotFoundException("Employee not found");
    return employee;
  }

  async updateEmployee(tenantId: string, id: string, dto: UpdateEmployeeDto) {
    await this.findOneEmployee(tenantId, id);
    return this.prisma.employee.update({
      where: { id },
      data: { ...dto, hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined },
    });
  }

  async removeEmployee(tenantId: string, id: string) {
    await this.findOneEmployee(tenantId, id);
    return this.prisma.employee.update({ where: { id }, data: { status: "TERMINATED" } });
  }

  async createAttendance(tenantId: string, dto: CreateAttendanceDto) {
    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: dto.employeeId, date: new Date(dto.date) } },
    });
    if (existing) throw new ConflictException("Attendance already exists for this employee on this date");
    return this.prisma.attendance.create({
      data: {
        employeeId: dto.employeeId,
        date: new Date(dto.date),
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        status: dto.status,
        tenantId,
      },
    });
  }

  async findAllAttendance(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    return this.prisma.attendance.findMany({ where, orderBy: { date: "desc" } });
  }

  async updateAttendance(tenantId: string, id: string, dto: Partial<CreateAttendanceDto>) {
    const att = await this.prisma.attendance.findFirst({ where: { id, tenantId } });
    if (!att) throw new NotFoundException("Attendance not found");
    return this.prisma.attendance.update({
      where: { id },
      data: {
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        status: dto.status,
      },
    });
  }

  async createLeaveType(tenantId: string, dto: CreateLeaveTypeDto) {
    const existing = await this.prisma.leaveType.findFirst({ where: { tenantId, name: dto.name } });
    if (existing) throw new ConflictException("Leave type name already exists");
    return this.prisma.leaveType.create({ data: { ...dto, tenantId } });
  }

  async findAllLeaveTypes(tenantId: string) {
    return this.prisma.leaveType.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }

  async findOneLeaveType(tenantId: string, id: string) {
    const lt = await this.prisma.leaveType.findFirst({ where: { id, tenantId } });
    if (!lt) throw new NotFoundException("Leave type not found");
    return lt;
  }

  async updateLeaveType(tenantId: string, id: string, dto: UpdateLeaveTypeDto) {
    await this.findOneLeaveType(tenantId, id);
    return this.prisma.leaveType.update({ where: { id }, data: dto });
  }

  async removeLeaveType(tenantId: string, id: string) {
    await this.findOneLeaveType(tenantId, id);
    return this.prisma.leaveType.delete({ where: { id } });
  }

  async createLeaveRequest(tenantId: string, dto: CreateLeaveRequestDto) {
    return this.prisma.leaveRequest.create({
      data: {
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
        tenantId,
      },
    });
  }

  async findAllLeaveRequests(tenantId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { tenantId },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } }, leaveType: { select: { name: true, daysAllowed: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateLeaveStatus(tenantId: string, id: string, dto: UpdateLeaveStatusDto) {
    const lr = await this.prisma.leaveRequest.findFirst({
      where: { id, tenantId },
      include: { leaveType: true },
    });
    if (!lr) throw new NotFoundException("Leave request not found");

    if (dto.status === "APPROVED") {
      const start = new Date(lr.startDate);
      const end = new Date(lr.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (days > lr.leaveType.daysAllowed) {
        throw new BadRequestException(
          `Requested ${days} days exceeds the allowed ${lr.leaveType.daysAllowed} days for ${lr.leaveType.name}`,
        );
      }
    }

    return this.prisma.leaveRequest.update({ where: { id }, data: { status: dto.status } });
  }

  async createRecruitment(tenantId: string, dto: CreateRecruitmentDto) {
    return this.prisma.recruitment.create({ data: { ...dto, tenantId } });
  }

  async findAllRecruitment(tenantId: string) {
    return this.prisma.recruitment.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  }

  async findOneRecruitment(tenantId: string, id: string) {
    const rec = await this.prisma.recruitment.findFirst({ where: { id, tenantId } });
    if (!rec) throw new NotFoundException("Recruitment not found");
    return rec;
  }

  async updateRecruitment(tenantId: string, id: string, dto: UpdateRecruitmentDto) {
    await this.findOneRecruitment(tenantId, id);
    return this.prisma.recruitment.update({ where: { id }, data: dto });
  }

  async removeRecruitment(tenantId: string, id: string) {
    await this.findOneRecruitment(tenantId, id);
    return this.prisma.recruitment.delete({ where: { id } });
  }
}
