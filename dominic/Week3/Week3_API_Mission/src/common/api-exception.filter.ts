import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (error instanceof HttpException) {
      const body = error.getResponse();
      return response.status(error.getStatus()).json(
        typeof body === 'string' ? { statusCode: error.getStatus(), message: body } : body,
      );
    }

    const failure = error as { code?: string; status?: number; type?: string };
    if (failure.type === 'entity.parse.failed') {
      return response.status(400).json({ statusCode: 400, message: '올바른 JSON 객체를 전달해 주세요.' });
    }
    if (failure.type === 'entity.too.large') {
      return response.status(413).json({ statusCode: 413, message: '요청 본문이 너무 큽니다.' });
    }
    if (failure.code === 'ER_LOCK_DEADLOCK' || failure.code === 'ER_LOCK_WAIT_TIMEOUT') {
      return response.status(409).json({ statusCode: 409, message: '다른 요청을 처리 중입니다. 잠시 후 다시 요청해 주세요.' });
    }
    Logger.error(failure.code ?? 'UNKNOWN_ERROR', 'API');
    return response.status(500).json({ statusCode: 500, message: '서버에서 요청을 처리하지 못했습니다.' });
  }
}
