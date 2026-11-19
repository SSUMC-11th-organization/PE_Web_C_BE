import { HttpException, HttpStatus } from '@nestjs/common';
export type ErrorBody = { code: string; message: string };
export class ApiError extends HttpException {
 constructor(status: number, code: string, message: string) { super({ code, message }, status); }
}
export const apiError = {
 login: () => new ApiError(401, 'AUTH401_1', '이메일 또는 비밀번호가 올바르지 않습니다.'),
 missingToken: () => new ApiError(401, 'AUTH401_2', '로그인이 필요한 요청입니다.'),
 invalidToken: () => new ApiError(401, 'AUTH401_3', '유효하지 않은 토큰입니다.'),
 expiredToken: () => new ApiError(401, 'AUTH401_4', '토큰이 만료되었습니다. 다시 로그인해주세요.'),
 validation: (message: string) => new ApiError(400, 'COMMON400', message),
 email: () => new ApiError(409, 'MEMBER409_2', '이미 사용 중인 이메일입니다.'),
 nickname: () => new ApiError(409, 'MEMBER409_1', '이미 사용 중인 닉네임입니다.'),
 duplicateRating: () => new ApiError(409, 'RATING409_1', '이미 이 영화에 평점을 남기셨습니다.'),
 duplicateFavorite: () => new ApiError(409, 'FAVORITE409_1', '이미 이 영화를 즐겨찾기하셨습니다.'),
 missingFavorite: () => new ApiError(404, 'FAVORITE404_1', '해당 즐겨찾기를 찾을 수 없습니다.'),
 missingMember: () => new ApiError(404, 'MEMBER404_1', '존재하지 않는 회원입니다.'),
 missingRating: () => new ApiError(404, 'RATING404_1', '존재하지 않는 평점입니다.'),
 forbidden: () => new ApiError(403, 'RATING403_1', '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.'),
};
export function success<T>(code: string, message: string, result: T) {
 return { isSuccess: true, code, message, result };
}
