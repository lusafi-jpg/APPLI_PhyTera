import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    // Seules les requêtes de mutation (POST, PUT, PATCH, DELETE) sont auditées
    const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap((responseData) => {
        if (isMutatingMethod && !url.includes('/audit-logs')) {
          const action = `${method} ${url}`;
          const entity = url.split('/')[3] || 'GENERAL';

          this.auditService.logAction({
            userId: user?.id,
            action,
            entity,
            entityId: request.params?.id,
            details: {
              body: request.body,
              params: request.params,
              query: request.query,
            },
            ipAddress: ip || headers['x-forwarded-for'],
            userAgent: headers['user-agent'],
          });
        }
      }),
    );
  }
}
