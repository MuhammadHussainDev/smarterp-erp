import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("roles")
@Controller("roles")
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: "List all roles for the company" })
  findAll(@CurrentUser("tenantId") tenantId: string) {
    return this.rolesService.findAll(tenantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get role by ID with permissions" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    return this.rolesService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new role" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @Body() dto: CreateRoleDto
  ) {
    return this.rolesService.create(tenantId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update role" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto
  ) {
    return this.rolesService.update(tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete role" })
  remove(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id") id: string
  ) {
    return this.rolesService.remove(tenantId, id);
  }

  @Get("permissions/all")
  @ApiOperation({ summary: "List all available permissions" })
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }
}
