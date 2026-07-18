import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { RolesModule } from "./roles/roles.module";
import { CompaniesModule } from "./companies/companies.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { CrmModule } from "./crm/crm.module";
import { SalesModule } from "./sales/sales.module";
import { PurchasingModule } from "./purchasing/purchasing.module";
import { InventoryModule } from "./inventory/inventory.module";
import { WarehouseModule } from "./warehouse/warehouse.module";
import { AccountingModule } from "./accounting/accounting.module";
import { HrModule } from "./hr/hr.module";
import { PayrollModule } from "./payroll/payroll.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ExportModule } from "./export/export.module";
import { AuditModule } from "./audit/audit.module";
import { AiModule } from "./ai/ai.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { TenantInterceptor } from "./common/interceptors/tenant.interceptor";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CompaniesModule,
    DashboardModule,
    CrmModule,
    SalesModule,
    PurchasingModule,
    InventoryModule,
    WarehouseModule,
    AccountingModule,
    HrModule,
    PayrollModule,
    NotificationsModule,
    ExportModule,
    AuditModule,
    AiModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
  ],
})
export class AppModule {}
