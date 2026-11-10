import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

// 모든 오류를 { isSuccess:false, code, message, result:null } 형식으로 통일합니다.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    // DB UNIQUE 제약 위반 (사전 중복 체크를 통과해도 동시 요청이면 여기서 막힙니다)
    if (
      exception instanceof QueryFailedError &&
      (exception.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
    ) {
      response.status(HttpStatus.CONFLICT).json({
        isSuccess: false,
        code: 'COMMON4091',
        message: '이미 존재하는 데이터입니다.',
        result: null,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      let code = `COMMON${status}`;
      let message: string | string[] = exception.message;

      if (typeof body === 'string') {
        message = body;
      } else {
        const obj = body as { code?: string; message?: string | string[] };
        if (obj.code) code = obj.code; // 서비스에서 지정한 코드 우선
        if (obj.message) message = obj.message;
      }

      response.status(status).json({
        isSuccess: false,
        code,
        message: Array.isArray(message) ? message[0] : message,
        result: null,
      });
      return;
    }

    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      isSuccess: false,
      code: 'COMMON500',
      message: '서버 오류가 발생했습니다.',
      result: null,
    });
  }
}
