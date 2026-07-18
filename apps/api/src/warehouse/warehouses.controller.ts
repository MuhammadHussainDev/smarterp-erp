import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { WarehousesService } from "./warehouses.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("warehouse")
@Controller("warehouse/stores")
export class WarehousesController {
  constructor(private service: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: "List warehouses" })
  findAll(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get warehouse" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: "Create warehouse" })
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update warehouse" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete warehouse" })
  remove(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.remove(tenantId, id);
  }
}
