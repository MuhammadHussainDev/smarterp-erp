import { Controller, Get, Post, Patch, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("sales")
@Controller("sales/orders")
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Get()
  @ApiOperation({ summary: "List sales orders" })
  findAll(@CurrentUser("tenantId") tenantId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get sales order" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update sales order" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Post(":id/invoice")
  @ApiOperation({ summary: "Create invoice from order" })
  invoice(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.invoice(tenantId, id);
  }
}
