import { Controller, Get, Post, Patch, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { InvoicesService } from "./invoices.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("sales")
@Controller("sales/invoices")
export class InvoicesController {
  constructor(private service: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: "List invoices" })
  findAll(@CurrentUser("tenantId") tenantId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get invoice" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update invoice" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Post(":id/payments")
  @ApiOperation({ summary: "Record payment for invoice" })
  recordPayment(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() dto: any
  ) {
    return this.service.recordPayment(tenantId, id, dto);
  }
}
