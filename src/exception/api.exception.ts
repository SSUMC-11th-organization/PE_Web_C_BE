import { HttpException, HttpStatus } from '@nestjs/common';

// 상태 코드와 code 문자열(예: AUTH401_1)을 함께 담아 던지는 예외입니다.
// 전역 필터(AllExceptionsFilter)가 이 code를 응답 body의 code 필드에 실어 줍니다.
export class ApiException extends HttpException {
  constructor(
    status: HttpStatus,
    public readonly code: string,
    message: string,
  ) {
    super({ code, message }, status);
  }
}
