import { Controller, Get, Param, Query, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("audit")
@Controller("audit")
export class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  @ApiOperation({ summary: "List audit logs" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("action") action?: string,
    @Query("entity") entity?: string,
    @Query("userId") userId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.service.findAll(tenantId, { page, limit, action, entity, userId, startDate, endDate });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get audit log" })
  findOne(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }
}
