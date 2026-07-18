import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId },
      include: {
        _count: { select: { userRoles: true } },
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        userRoles: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });

    if (!role) throw new NotFoundException("Role not found");
    return role;
  }

  async create(tenantId: string, dto: CreateRoleDto) {
    const existing = await this.prisma.role.findFirst({
      where: { tenantId, name: dto.name },
    });
    if (existing) throw new ConflictException("Role name already exists");

    const role = await this.prisma.role.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        rolePermissions: {
          create: dto.permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });

    return role;
  }

  async update(tenantId: string, id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(tenantId, id);
    if (role.isSystem) throw new ConflictException("Cannot modify system roles");

    if (dto.permissionIds) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      await this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      });
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const role = await this.findOne(tenantId, id);
    if (role.isSystem) throw new ConflictException("Cannot delete system roles");

    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    await this.prisma.userRole.deleteMany({ where: { roleId: id } });
    await this.prisma.role.delete({ where: { id } });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: { module: "asc" } });
  }
}
