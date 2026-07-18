import { Controller, Get, Patch, Delete, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List notifications" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("sub") userId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.service.findAll(tenantId, userId, page, limit);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count" })
  getUnreadCount(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("sub") userId: string,
  ) {
    return this.service.getUnreadCount(tenantId, userId);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  markAsRead(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("sub") userId: string,
    @Param("id") id: string,
  ) {
    return this.service.markAsRead(tenantId, userId, id);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  markAllAsRead(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("sub") userId: string,
  ) {
    return this.service.markAllAsRead(tenantId, userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete notification" })
  remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("sub") userId: string,
    @Param("id") id: string,
  ) {
    return this.service.remove(tenantId, userId, id);
  }

  @Delete()
  @ApiOperation({ summary: "Clear all read notifications" })
  clearAll(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("sub") userId: string,
  ) {
    return this.service.clearAll(tenantId, userId);
  }
}
