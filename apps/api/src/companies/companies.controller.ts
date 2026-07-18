import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CompaniesService } from "./companies.service";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("companies")
@Controller("companies")
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get("current")
  @ApiOperation({ summary: "Get current company profile" })
  getProfile(@CurrentUser("tenantId") tenantId: string) {
    return this.companiesService.getProfile(tenantId);
  }

  @Patch("current")
  @ApiOperation({ summary: "Update company profile" })
  updateProfile(
    @CurrentUser("tenantId") tenantId: string,
    @Body() dto: UpdateCompanyDto
  ) {
    return this.companiesService.updateProfile(tenantId, dto);
  }

  @Get("branches")
  @ApiOperation({ summary: "List all branches" })
  getBranches(@CurrentUser("tenantId") tenantId: string) {
    return this.companiesService.getBranches(tenantId);
  }

  @Post("branches")
  @ApiOperation({ summary: "Create a branch" })
  createBranch(
    @CurrentUser("tenantId") tenantId: string,
    @Body() dto: CreateBranchDto
  ) {
    return this.companiesService.createBranch(tenantId, dto);
  }

  @Get("branches/:id")
  @ApiOperation({ summary: "Get branch by ID" })
  getBranch(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    return this.companiesService.getBranch(tenantId, id);
  }

  @Patch("branches/:id")
  @ApiOperation({ summary: "Update branch" })
  updateBranch(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() dto: UpdateBranchDto
  ) {
    return this.companiesService.updateBranch(tenantId, id, dto);
  }

  @Delete("branches/:id")
  @ApiOperation({ summary: "Delete branch" })
  deleteBranch(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    return this.companiesService.deleteBranch(tenantId, id);
  }

  @Get("departments")
  @ApiOperation({ summary: "List all departments" })
  getDepartments(@CurrentUser("tenantId") tenantId: string) {
    return this.companiesService.getDepartments(tenantId);
  }

  @Post("departments")
  @ApiOperation({ summary: "Create a department" })
  createDepartment(
    @CurrentUser("tenantId") tenantId: string,
    @Body() dto: CreateDepartmentDto
  ) {
    return this.companiesService.createDepartment(tenantId, dto);
  }

  @Get("departments/:id")
  @ApiOperation({ summary: "Get department by ID" })
  getDepartment(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    return this.companiesService.getDepartment(tenantId, id);
  }

  @Patch("departments/:id")
  @ApiOperation({ summary: "Update department" })
  updateDepartment(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() dto: UpdateDepartmentDto
  ) {
    return this.companiesService.updateDepartment(tenantId, id, dto);
  }

  @Delete("departments/:id")
  @ApiOperation({ summary: "Delete department" })
  deleteDepartment(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    return this.companiesService.deleteDepartment(tenantId, id);
  }
}
