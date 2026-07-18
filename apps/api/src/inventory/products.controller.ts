import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("inventory")
@Controller("inventory/products")
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "List products" })
  findAll(@CurrentUser("tenantId") tenantId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.service.findAll(tenantId, page, limit);
  }

  @Get("barcode/:barcode")
  @ApiOperation({ summary: "Find product by barcode" })
  findByBarcode(@CurrentUser("tenantId") tenantId: string, @Param("barcode") barcode: string) {
    return this.service.findByBarcode(tenantId, barcode);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: "Create product" })
  create(@CurrentUser("tenantId") tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update product" })
  update(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deactivate product" })
  remove(@CurrentUser("tenantId") tenantId: string, @Param("id") id: string) {
    return this.service.remove(tenantId, id);
  }
}
