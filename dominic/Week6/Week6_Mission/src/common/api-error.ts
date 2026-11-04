import { HttpException, HttpStatus } from '@nestjs/common';
export type ErrorBody = { code: string; message: string };
export class ApiError extends HttpException {
 constructor(status: number, code: string, message: string) { super({ code, message }, status); }
}
export const apiError = {
 validation: (message: string) => new ApiError(400, 'COMMON400', message),
 email: () => new ApiError(409, 'MEMBER4091', '이미 사용 중인 이메일입니다.'),
 nickname: () => new ApiError(409, 'MEMBER4092', '이미 사용 중인 닉네임입니다.'),
 duplicateRating: () => new ApiError(409, 'RATING4091', '이미 이 영화에 평점을 남기셨습니다.'),
 missingMember: () => new ApiError(404, 'MEMBER404', '존재하지 않는 회원입니다.'),
 missingRating: () => new ApiError(404, 'RATING404', '존재하지 않는 평점입니다.'),
 forbidden: () => new ApiError(403, 'RATING403', '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.'),
};
export function success<T>(code: string, message: string, result: T) {
 return { isSuccess: true, code, message, result };
}
