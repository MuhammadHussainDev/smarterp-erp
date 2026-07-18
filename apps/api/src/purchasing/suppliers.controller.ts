import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SuppliersService } from "./suppliers.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("purchasing")
@Controller("purchasing/suppliers")
export class SuppliersController {
  constructor(private service: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: "List suppliers" })
  findAll(@CurrentUser("tenantId") tenantId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get supplier" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: "Create supplier" })
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update supplier" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deactivate supplier" })
  remove(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.remove(tenantId, id);
  }
}
