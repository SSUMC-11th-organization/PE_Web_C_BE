import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Request } from 'express';
import { apiError } from '../common/api-error';

export interface AuthenticatedRequest extends Request { authMemberId?: string }
export const PUBLIC_ROUTE = 'publicRoute';
export const Public = () => SetMetadata(PUBLIC_ROUTE, true);

// 선택 미션: 컨트롤러가 요청 객체의 내부 저장 방식에 의존하지 않도록 합니다.
export const LoginMember = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const id = context.switchToHttp().getRequest<AuthenticatedRequest>().authMemberId;
  if (!id) throw apiError.missingToken();
  return id;
});
