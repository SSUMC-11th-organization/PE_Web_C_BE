import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';
import { ApiError, apiError, ErrorBody } from './api-error';

export function mapDatabaseError(exception: unknown): ApiError | undefined {
 if (!(exception instanceof QueryFailedError)) return undefined;
 const driver = exception.driverError as { code?: string; sqlMessage?: string; message?: string };
 if (driver.code !== 'ER_DUP_ENTRY') return undefined;
 const detail = driver.sqlMessage ?? driver.message ?? '';
 const key = detail.match(/for key ['`"](?:[^'`"]+\.)?([^'`"]+)['`"]/)?.[1] ?? '';
 if (key === 'email') return apiError.email();
 if (key === 'nickname') return apiError.nickname();
 if (key === 'uk_rating_member_movie') return apiError.duplicateRating();
 return new ApiError(409, 'COMMON409', '이미 존재하는 데이터입니다.');
}
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
 private readonly logger = new Logger(ApiExceptionFilter.name);
 catch(exception: unknown, host: ArgumentsHost) {
  const response = host.switchToHttp().getResponse<Response>();
  const dbError = mapDatabaseError(exception);
  if (dbError) this.logger.warn(`Duplicate database constraint mapped: ${(dbError.getResponse() as ErrorBody).code}`);
  const error = dbError ?? exception;
  let status = HttpStatus.INTERNAL_SERVER_ERROR;
  let code = 'COMMON500';
  let message = '서버 오류가 발생했습니다.';
  if (error instanceof HttpException) {
   status = error.getStatus();
   const data = error.getResponse();
   if (typeof data === 'object' && data !== null && 'code' in data && typeof data.code === 'string' && 'message' in data && typeof data.message === 'string') {
    code = data.code; message = data.message;
   } else {
    code = `COMMON${status}`;
    message = typeof data === 'string' ? data : ('message' in data && typeof data.message === 'string' ? data.message : '요청을 처리할 수 없습니다.');
   }
  } else if (!dbError) this.logger.error('Unhandled request failure');
  response.status(status).json({ isSuccess: false, code, message, result: null });
 }
}
