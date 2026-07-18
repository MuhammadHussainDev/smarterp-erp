import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UsePipes, ValidationPipe, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PayrollService } from "./payroll.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreatePayrollDto } from "./dto/create-payroll.dto";
import { UpdatePayrollStatusDto } from "./dto/update-payroll-status.dto";
import { UpdatePayrollItemDto } from "./dto/update-payroll-item.dto";
import { CreateBenefitDto } from "./dto/create-benefit.dto";
import { UpdateBenefitDto } from "./dto/update-benefit.dto";
import { CreateEmployeeBenefitDto } from "./dto/create-employee-benefit.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { CreateTrainingDto } from "./dto/create-training.dto";
import { CreateEmployeeTrainingDto } from "./dto/create-employee-training.dto";

@ApiTags("payroll")
@Controller("payroll")
export class PayrollController {
  constructor(private service: PayrollService) {}

  // ─── Payroll ───────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: "List payrolls" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query("month") month?: number,
    @Query("year") year?: number
  ) {
    return this.service.findAll(tenantId, month ? +month : undefined, year ? +year : undefined);
  }

  @Post()
  @ApiOperation({ summary: "Create payroll" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreatePayrollDto) {
    return this.service.create(tenantId, dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get payroll" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update payroll status" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  updateStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePayrollStatusDto
  ) {
    return this.service.updateStatus(tenantId, id, dto.status);
  }

  // ─── PayrollItem ───────────────────────────────────────────────────

  @Patch("items/:id")
  @ApiOperation({ summary: "Update payroll item" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  updateItem(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePayrollItemDto
  ) {
    return this.service.updateItem(tenantId, id, dto);
  }

  // ─── Benefit ───────────────────────────────────────────────────────

  @Get("benefits")
  @ApiOperation({ summary: "List benefits" })
  findAllBenefits(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAllBenefits(tenantId);
  }

  @Post("benefits")
  @ApiOperation({ summary: "Create benefit" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createBenefit(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateBenefitDto) {
    return this.service.createBenefit(tenantId, dto);
  }

  @Get("benefits/:id")
  @ApiOperation({ summary: "Get benefit" })
  findOneBenefit(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOneBenefit(tenantId, id);
  }

  @Patch("benefits/:id")
  @ApiOperation({ summary: "Update benefit" })
  updateBenefit(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBenefitDto
  ) {
    return this.service.updateBenefit(tenantId, id, dto);
  }

  @Delete("benefits/:id")
  @ApiOperation({ summary: "Delete benefit" })
  removeBenefit(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.removeBenefit(tenantId, id);
  }

  // ─── EmployeeBenefit ───────────────────────────────────────────────

  @Get("employee-benefits")
  @ApiOperation({ summary: "List employee benefits" })
  findAllEmployeeBenefits(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAllEmployeeBenefits(tenantId);
  }

  @Post("employee-benefits")
  @ApiOperation({ summary: "Assign benefit to employee" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createEmployeeBenefit(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateEmployeeBenefitDto) {
    return this.service.createEmployeeBenefit(tenantId, dto);
  }

  @Patch("employee-benefits/:id")
  @ApiOperation({ summary: "Update employee benefit" })
  updateEmployeeBenefit(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateBenefitDto
  ) {
    return this.service.updateEmployeeBenefit(tenantId, id, dto);
  }

  @Delete("employee-benefits/:id")
  @ApiOperation({ summary: "Remove employee benefit" })
  removeEmployeeBenefit(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.removeEmployeeBenefit(tenantId, id);
  }

  // ─── PerformanceReview ─────────────────────────────────────────────

  @Get("reviews")
  @ApiOperation({ summary: "List performance reviews" })
  findAllReviews(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAllReviews(tenantId);
  }

  @Post("reviews")
  @ApiOperation({ summary: "Create performance review" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createReview(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateReviewDto) {
    return this.service.createReview(tenantId, dto);
  }

  @Patch("reviews/:id")
  @ApiOperation({ summary: "Update performance review" })
  updateReview(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateReviewDto
  ) {
    return this.service.updateReview(tenantId, id, dto);
  }

  // ─── Training ──────────────────────────────────────────────────────

  @Get("training")
  @ApiOperation({ summary: "List trainings" })
  findAllTrainings(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAllTrainings(tenantId);
  }

  @Post("training")
  @ApiOperation({ summary: "Create training" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createTraining(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateTrainingDto) {
    return this.service.createTraining(tenantId, dto);
  }

  @Get("training/:id")
  @ApiOperation({ summary: "Get training" })
  findOneTraining(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOneTraining(tenantId, id);
  }

  @Patch("training/:id")
  @ApiOperation({ summary: "Update training" })
  updateTraining(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateTrainingDto
  ) {
    return this.service.updateTraining(tenantId, id, dto);
  }

  @Delete("training/:id")
  @ApiOperation({ summary: "Delete training" })
  removeTraining(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.removeTraining(tenantId, id);
  }

  // ─── EmployeeTraining ──────────────────────────────────────────────

  @Get("employee-training")
  @ApiOperation({ summary: "List employee trainings" })
  findAllEmployeeTrainings(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAllEmployeeTrainings(tenantId);
  }

  @Post("employee-training")
  @ApiOperation({ summary: "Enroll employee in training" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createEmployeeTraining(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateEmployeeTrainingDto) {
    return this.service.createEmployeeTraining(tenantId, dto);
  }

  @Patch("employee-training/:id/complete")
  @ApiOperation({ summary: "Complete employee training" })
  completeEmployeeTraining(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.completeEmployeeTraining(tenantId, id);
  }
}
