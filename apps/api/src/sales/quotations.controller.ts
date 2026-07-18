import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { QuotationsService } from "./quotations.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("sales")
@Controller("sales/quotations")
export class QuotationsController {
  constructor(private service: QuotationsService) {}

  @Get()
  @ApiOperation({ summary: "List quotations" })
  findAll(@CurrentUser("tenantId") tenantId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get quotation" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: "Create quotation" })
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update quotation" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete quotation" })
  remove(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.remove(tenantId, id);
  }

  @Post(":id/convert")
  @ApiOperation({ summary: "Convert quotation to sales order" })
  convertToOrder(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.convertToOrder(tenantId, id);
  }
}
