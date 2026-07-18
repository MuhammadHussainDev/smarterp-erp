import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { LeadsService } from "./leads.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("crm")
@Controller("crm/leads")
export class LeadsController {
  constructor(private service: LeadsService) {}

  @Get()
  @ApiOperation({ summary: "List leads" })
  findAll(@CurrentUser("tenantId") tenantId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get lead" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: "Create lead" })
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update lead" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete lead" })
  remove(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.remove(tenantId, id);
  }

  @Post(":id/convert")
  @ApiOperation({ summary: "Convert lead to customer" })
  convert(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.convert(tenantId, id);
  }
}
