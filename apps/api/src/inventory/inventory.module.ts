import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { BrandsController } from "./brands.controller";
import { BrandsService } from "./brands.service";
import { UnitsController } from "./units.controller";
import { UnitsService } from "./units.service";

@Module({
  controllers: [ProductsController, CategoriesController, BrandsController, UnitsController],
  providers: [ProductsService, CategoriesService, BrandsService, UnitsService],
})
export class InventoryModule {}
