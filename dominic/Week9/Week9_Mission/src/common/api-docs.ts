import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { apiError, ErrorBody, success } from './api-error';

export function ApiSuccess(status: number, message: string, result: unknown) {
  return ApiResponse({ status, description: message, content: { 'application/json': { example: success(`COMMON${status}`, message, result) } } });
}

export function ApiFailure(status: number, errors: ErrorBody[]) {
  return ApiResponse({ status, description: errors.map(e => `${e.code}: ${e.message}`).join(' / '), content: {
    'application/json': { examples: Object.fromEntries(errors.map(e => [e.code, { value: { isSuccess: false, ...e, result: null } }])) },
  } });
}

export function ApiProtectedErrors() {
  const auth = [apiError.missingToken(), apiError.invalidToken(), apiError.expiredToken()].map(e => e.getResponse() as ErrorBody);
  return applyDecorators(
    ApiFailure(401, auth),
    ApiFailure(400, [{ code: 'COMMON400', message: '입력값이 올바르지 않습니다.' }]),
  );
}

export const favoriteExample = { favoriteId: 1, movieId: 550, createdAt: '2026-11-20T03:00:00.000Z' };
