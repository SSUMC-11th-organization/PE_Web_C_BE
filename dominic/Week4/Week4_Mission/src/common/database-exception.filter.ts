import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const driverError = exception.driverError as { code?: string };
    // SQL 문자열·파라미터·접속 정보를 응답에 노출하지 않는다.
    this.logger.error(`데이터베이스 작업 실패 (${driverError.code ?? 'UNKNOWN'})`);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '데이터베이스 작업을 처리하지 못했습니다.',
      error: 'Internal Server Error',
    });
  }
}
