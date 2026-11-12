import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import type { AuthenticatedRequest } from './authenticated-request.js';
import { ApiException } from '../exception/api.exception.js';

const BEARER_PREFIX = 'Bearer ';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  // 컨트롤러가 실행되기 "전"에 호출됩니다.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;

    if (!header || !header.startsWith(BEARER_PREFIX)) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_2',
        '로그인이 필요한 요청입니다.',
      );
    }

    const token = header.slice(BEARER_PREFIX.length);

    try {
      // 서명과 만료 시각을 함께 검증합니다. 실패하면 예외가 납니다.
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token);
      // 뒤이어 실행될 컨트롤러가 꺼내 쓸 수 있도록 요청 객체에 담아 둡니다.
      request.memberId = Number(payload.sub);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ApiException(
          HttpStatus.UNAUTHORIZED,
          'AUTH401_4',
          '토큰이 만료되었습니다. 다시 로그인해주세요.',
        );
      }
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'AUTH401_3',
        '유효하지 않은 토큰입니다.',
      );
    }

    return true;
  }
}
