import { Controller, Get, Post, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { StockTransfersService } from "./stock-transfers.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("warehouse")
@Controller("warehouse/transfers")
export class StockTransfersController {
  constructor(private service: StockTransfersService) {}

  @Get()
  @ApiOperation({ summary: "List stock transfers" })
  findAll(@CurrentUser("tenantId") tenantId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get stock transfer" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: "Create stock transfer" })
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Post(":id/complete")
  @ApiOperation({ summary: "Complete stock transfer" })
  complete(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.complete(tenantId, id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete stock transfer" })
  remove(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.remove(tenantId, id);
  }
}
