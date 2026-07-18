import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId },
        skip,
        take: limit,
        include: {
          userRoles: {
            include: { role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where: { tenantId } }),
    ]);

    return {
      data: data.map(({ passwordHash, ...user }) => ({
        ...user,
        roles: user.userRoles.map((ur) => ur.role),
        userRoles: undefined,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        userRoles: {
          include: { role: { include: { rolePermissions: true } } },
        },
      },
    });

    if (!user) throw new NotFoundException("User not found");

    const { passwordHash, ...rest } = user;
    return rest;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException("Email already in use");

    const passwordHash = await argon2.hash("Welcome123!");

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        status: "INVITED",
        userRoles: {
          create: dto.roleIds.map((roleId) => ({ roleId })),
        },
      },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);

    if (dto.roleIds) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      await this.prisma.userRole.createMany({
        data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
      });
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
      },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    await this.findOne(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
