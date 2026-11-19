import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { apiError } from '../common/api-error';
import { AuthenticatedRequest, PUBLIC_ROUTE } from './auth.decorators';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (!header) throw apiError.missingToken();
    const match = /^Bearer ([^\s]+)$/i.exec(header);
    if (!match) throw apiError.invalidToken();
    let claims: { sub?: unknown; exp?: unknown; email?: unknown };
    try {
      claims = await this.jwt.verifyAsync(match[1], { algorithms: ['HS256'] });
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') throw apiError.expiredToken();
      throw apiError.invalidToken();
    }
    if (!claims || typeof claims.sub !== 'string' || !/^[1-9]\d*$/.test(claims.sub)
      || !Number.isSafeInteger(Number(claims.sub)) || typeof claims.exp !== 'number'
      || !Number.isFinite(claims.exp) || typeof claims.email !== 'string') throw apiError.invalidToken();
    request.authMemberId = claims.sub;
    return true;
  }
}
