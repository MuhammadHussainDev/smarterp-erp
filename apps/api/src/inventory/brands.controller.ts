import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { BrandsService } from "./brands.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("inventory")
@Controller("inventory/brands")
export class BrandsController {
  constructor(private service: BrandsService) {}

  @Get()
  @ApiOperation({ summary: "List brands" })
  findAll(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: "Create brand" })
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update brand" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete brand" })
  remove(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.remove(tenantId, id);
  }
}
