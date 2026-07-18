import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { StockService } from "./stock.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("warehouse")
@Controller("warehouse/stock")
export class StockController {
  constructor(private service: StockService) {}

  @Get()
  @ApiOperation({ summary: "List stock levels" })
  findAll(@CurrentUser("tenantId") tenantId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get("warehouse/:warehouseId")
  @ApiOperation({ summary: "Get stock by warehouse" })
  getByWarehouse(@CurrentUser("tenantId") tenantId: string, @Param("warehouseId") warehouseId: string) {
    return this.service.getByWarehouse(tenantId, warehouseId);
  }

  @Post("adjust")
  @ApiOperation({ summary: "Adjust stock quantity" })
  adjust(@CurrentUser("tenantId") tenantId: string, @Body() dto: { productId: string; warehouseId: string; quantity: number }) {
    return this.service.adjust(tenantId, dto.productId, dto.warehouseId, dto.quantity);
  }
}
