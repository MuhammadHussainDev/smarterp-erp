import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("inventory")
@Controller("inventory/categories")
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: "List categories" })
  findAll(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: "Create category" })
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update category" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete category" })
  remove(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.remove(tenantId, id);
  }
}
