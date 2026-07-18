import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { OpportunitiesService } from "./opportunities.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("crm")
@Controller("crm/opportunities")
export class OpportunitiesController {
  constructor(private service: OpportunitiesService) {}

  @Get()
  @ApiOperation({ summary: "List opportunities" })
  findAll(@CurrentUser("tenantId") tenantId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get("pipeline")
  @ApiOperation({ summary: "Get sales pipeline" })
  getPipeline(@CurrentUser("tenantId") tenantId: string) {
    return this.service.getPipeline(tenantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get opportunity" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: "Create opportunity" })
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update opportunity" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete opportunity" })
  remove(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.remove(tenantId, id);
  }
}
