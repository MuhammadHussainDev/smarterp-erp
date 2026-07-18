import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { authenticator } from "otplib";
import { toDataURL } from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await argon2.hash(dto.password);
    const slug = dto.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.companyName,
        slug,
      },
    });

    const adminRole = await this.prisma.role.findFirst({
      where: { name: "Company Admin", isSystem: true },
    });

    if (!adminRole) throw new Error("System roles not seeded. Run prisma db seed first.");

    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        emailVerified: true,
        userRoles: {
          create: { roleId: adminRole.id },
        },
      },
    });

    const role = await this.prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "Company Admin",
        description: "Company administrator with full access",
        isSystem: false,
        permissions: JSON.stringify(["*"]),
      },
    });

    await this.prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    return { message: "Company created successfully" };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        twoFactorAuth: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    if (user.twoFactorAuth?.isEnabled) {
      return { requires2fa: true, userId: user.id };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return this.generateTokens(user);
  }

  async refreshToken(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokens(stored.user);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async enable2fa(userId: string, token: string) {
    const record = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });
    if (!record) throw new UnauthorizedException("2FA not initiated");

    const valid = authenticator.verify({ token, secret: record.secret });
    if (!valid) throw new UnauthorizedException("Invalid 2FA token");

    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: { isEnabled: true },
    });

    return { message: "2FA enabled" };
  }

  async generate2faSecret(userId: string, email: string) {
    const secret = authenticator.generateSecret();
    const existing = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (existing) {
      await this.prisma.twoFactorAuth.update({
        where: { userId },
        data: { secret, isEnabled: false },
      });
    } else {
      await this.prisma.twoFactorAuth.create({
        data: { userId, secret },
      });
    }

    const otpauth = authenticator.keyuri(email, "SmartERP AI", secret);
    const qrCode = await toDataURL(otpauth);

    return { secret, qrCode };
  }

  async verify2fa(userId: string, token: string) {
    const record = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });
    if (!record) throw new UnauthorizedException("2FA not set up");

    const valid = authenticator.verify({ token, secret: record.secret });
    if (!valid) throw new UnauthorizedException("Invalid 2FA token");

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("User not found");

    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4();
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
      },
    };
  }
}
