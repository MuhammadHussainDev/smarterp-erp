import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "dev-secret",
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException();
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions: string[] = [];
    for (const ur of user.userRoles) {
      try {
        const rolePerms = JSON.parse(ur.role.permissions || "[]");
        permissions.push(...rolePerms);
      } catch {}
    }

    return {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      permissions,
    };
  }
}
