import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "List all users in the company" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.usersService.findAll(tenantId, page, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    return this.usersService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @Body() dto: CreateUserDto
  ) {
    return this.usersService.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() dto: UpdateUserDto
  ) {
    return this.usersService.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deactivate user" })
  remove(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    return this.usersService.remove(tenantId, id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update user status" })
  updateStatus(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body("status") status: string
  ) {
    return this.usersService.updateStatus(tenantId, id, status);
  }
}
