import { Module } from "@nestjs/common";
import { QuotationsController } from "./quotations.controller";
import { QuotationsService } from "./quotations.service";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";

@Module({
  controllers: [QuotationsController, OrdersController, InvoicesController],
  providers: [QuotationsService, OrdersService, InvoicesService],
})
export class SalesModule {}
