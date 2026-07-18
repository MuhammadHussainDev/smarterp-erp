import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { UnitsService } from "./units.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("inventory")
@Controller("inventory/units")
export class UnitsController {
  constructor(private service: UnitsService) {}

  @Get()
  @ApiOperation({ summary: "List units" })
  findAll(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: "Create unit" })
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update unit" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete unit" })
  remove(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.remove(tenantId, id);
  }
}
