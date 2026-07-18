import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, tenantId, body } = request;

    if (method === "GET") return next.handle();

    return next.handle().pipe(
      tap((response) => {
        const entity = url.split("/")[3] || url;
        this.prisma.auditLog
          .create({
            data: {
              tenantId,
              userId: user?.sub,
              action: method,
              entity,
              entityId: response?.id?.toString(),
              newData: body,
              ipAddress: request.ip,
            },
          })
          .catch(() => {});
      })
    );
  }
}
