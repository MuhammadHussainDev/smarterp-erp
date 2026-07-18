import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("dashboard")
@Controller("dashboard")
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get("stats")
  @ApiOperation({ summary: "Get dashboard statistics" })
  getStats(@CurrentUser("tenantId") tenantId: string) {
    return this.dashboardService.getStats(tenantId);
  }
}
