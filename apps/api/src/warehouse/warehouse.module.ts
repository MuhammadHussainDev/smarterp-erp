import { Module } from "@nestjs/common";
import { WarehousesController } from "./warehouses.controller";
import { WarehousesService } from "./warehouses.service";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { StockTransfersController } from "./stock-transfers.controller";
import { StockTransfersService } from "./stock-transfers.service";

@Module({
  controllers: [WarehousesController, StockController, StockTransfersController],
  providers: [WarehousesService, StockService, StockTransfersService],
})
export class WarehouseModule {}
