import type { Request } from 'express';

// AuthGuard가 토큰을 검증한 뒤 memberId를 담아 둔 요청 타입입니다.
export type AuthenticatedRequest = Request & { memberId: number };
