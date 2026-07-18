import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { HrService } from "./hr.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { CreateLeaveTypeDto } from "./dto/create-leave-type.dto";
import { UpdateLeaveTypeDto } from "./dto/update-leave-type.dto";
import { CreateLeaveRequestDto } from "./dto/create-leave-request.dto";
import { UpdateLeaveStatusDto } from "./dto/update-leave-status.dto";
import { CreateRecruitmentDto } from "./dto/create-recruitment.dto";
import { UpdateRecruitmentDto } from "./dto/update-recruitment.dto";
import { ParseUUIDPipe } from "@nestjs/common";

@ApiTags("hr")
@Controller("hr")
export class HrController {
  constructor(private service: HrService) {}

  @Get("employees")
  @ApiOperation({ summary: "List employees" })
  findAllEmployees(@CurrentUser("tenantId") tenantId: string, @Query("search") search?: string) {
    return this.service.findAllEmployees(tenantId, search);
  }

  @Get("employees/:id")
  @ApiOperation({ summary: "Get employee" })
  findOneEmployee(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOneEmployee(tenantId, id);
  }

  @Post("employees")
  @ApiOperation({ summary: "Create employee" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createEmployee(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateEmployeeDto) {
    return this.service.createEmployee(tenantId, dto);
  }

  @Patch("employees/:id")
  @ApiOperation({ summary: "Update employee" })
  updateEmployee(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateEmployeeDto) {
    return this.service.updateEmployee(tenantId, id, dto);
  }

  @Delete("employees/:id")
  @ApiOperation({ summary: "Delete employee" })
  removeEmployee(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.removeEmployee(tenantId, id);
  }

  @Get("attendance")
  @ApiOperation({ summary: "List attendance" })
  findAllAttendance(
    @CurrentUser("tenantId") tenantId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.service.findAllAttendance(tenantId, startDate, endDate);
  }

  @Post("attendance")
  @ApiOperation({ summary: "Create attendance" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createAttendance(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateAttendanceDto) {
    return this.service.createAttendance(tenantId, dto);
  }

  @Patch("attendance/:id")
  @ApiOperation({ summary: "Update attendance" })
  updateAttendance(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string, @Body() dto: Partial<CreateAttendanceDto>) {
    return this.service.updateAttendance(tenantId, id, dto);
  }

  @Get("leave-types")
  @ApiOperation({ summary: "List leave types" })
  findAllLeaveTypes(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAllLeaveTypes(tenantId);
  }

  @Get("leave-types/:id")
  @ApiOperation({ summary: "Get leave type" })
  findOneLeaveType(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOneLeaveType(tenantId, id);
  }

  @Post("leave-types")
  @ApiOperation({ summary: "Create leave type" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createLeaveType(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateLeaveTypeDto) {
    return this.service.createLeaveType(tenantId, dto);
  }

  @Patch("leave-types/:id")
  @ApiOperation({ summary: "Update leave type" })
  updateLeaveType(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateLeaveTypeDto) {
    return this.service.updateLeaveType(tenantId, id, dto);
  }

  @Delete("leave-types/:id")
  @ApiOperation({ summary: "Delete leave type" })
  removeLeaveType(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.removeLeaveType(tenantId, id);
  }

  @Get("leave-requests")
  @ApiOperation({ summary: "List leave requests" })
  findAllLeaveRequests(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAllLeaveRequests(tenantId);
  }

  @Post("leave-requests")
  @ApiOperation({ summary: "Create leave request" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createLeaveRequest(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateLeaveRequestDto) {
    return this.service.createLeaveRequest(tenantId, dto);
  }

  @Patch("leave-requests/:id/status")
  @ApiOperation({ summary: "Update leave request status" })
  updateLeaveStatus(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateLeaveStatusDto) {
    return this.service.updateLeaveStatus(tenantId, id, dto);
  }

  @Get("recruitment")
  @ApiOperation({ summary: "List recruitment" })
  findAllRecruitment(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAllRecruitment(tenantId);
  }

  @Get("recruitment/:id")
  @ApiOperation({ summary: "Get recruitment" })
  findOneRecruitment(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOneRecruitment(tenantId, id);
  }

  @Post("recruitment")
  @ApiOperation({ summary: "Create recruitment" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createRecruitment(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateRecruitmentDto) {
    return this.service.createRecruitment(tenantId, dto);
  }

  @Patch("recruitment/:id")
  @ApiOperation({ summary: "Update recruitment" })
  updateRecruitment(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateRecruitmentDto) {
    return this.service.updateRecruitment(tenantId, id, dto);
  }

  @Delete("recruitment/:id")
  @ApiOperation({ summary: "Delete recruitment" })
  removeRecruitment(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.removeRecruitment(tenantId, id);
  }
}
