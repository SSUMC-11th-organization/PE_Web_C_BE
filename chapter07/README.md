# 7주차 - 로그인한 사용자를 구분하기

Spring Boot 기반 영화 평점 서비스의 로그인, JWT 인증 및 평점 소유권 검증 실습입니다.

## 실행 환경

- Java 21, Spring Boot 3.5.0, MySQL
- 기존 `umc_movie` 스키마와 테이블이 필요합니다. `ddl-auto=validate`이므로 테이블을 자동 생성하지 않습니다.
- 실행 환경변수: `DB_PASSWORD`, `JWT_SECRET`, `JWT_ACCESS_EXPIRATION` (초 단위, 기본 3600)
- `JWT_SECRET`에는 최소 32바이트 이상의 비밀키를 사용합니다.
- DB 주소와 사용자명은 `src/main/resources/application.properties`에서 자신의 환경에 맞게 설정합니다.
- 실행: Windows 터미널에서 `./gradlew.bat bootRun`

## 주요 API

| Method | URL | 기능 | 인증 |
|---|---|---|---|
| POST | `/members` | 회원가입 | 불필요 |
| POST | `/auth/login` | 로그인 및 JWT 발급 | 불필요 |
| GET | `/members/me` | 내 정보 조회 | 필요 |
| PATCH | `/members/me` | 닉네임 수정 | 필요 |
| POST | `/ratings` | 평점 등록 | 필요 |
| PATCH | `/ratings/{ratingId}` | 평점 수정 | 필요 |
| DELETE | `/ratings/{ratingId}` | 평점 삭제 | 필요 |
| GET | `/members/{memberId}/ratings` | 회원별 평점 조회 | 불필요 |

인증 요청에는 `Authorization: Bearer {accessToken}` 헤더를 전달합니다. 평점 등록·수정·삭제의 회원 ID는 검증된 토큰에서 가져옵니다.

## 구현 내용

- bcrypt 해시와 입력 비밀번호 비교를 통한 로그인
- JWT 발급, 서명 및 만료시간 검증
- 인터셉터를 이용한 공통 인증 처리
- 인증된 회원의 정보 조회 및 닉네임 변경
- 평점 수정·삭제 시 작성자 소유권 검사
- ApiException과 전역 예외 처리기를 통한 공통 실패 응답
- 삭제 성공 시 200 응답 및 result=null 반환

## 수동 검증 기록

Postman에서 두 계정 A, B로 아래 시나리오를 확인했습니다.

| 시나리오 | 상태 | code |
|---|---|---|
| 로그인 성공 | 200 | COMMON200 |
| 토큰 없이 내 정보 조회 | 401 | AUTH401_2 |
| 내 정보 조회·수정 | 200 | COMMON200 |
| A의 평점 등록 | 201 | COMMON201 |
| 동일 영화 중복 평점 등록 | 409 | RATING409_1 |
| A의 본인 평점 수정 | 200 | COMMON200 |
| B의 토큰으로 A의 평점 수정 | 403 | RATING403_1 |
| 토큰 없이 평점 수정 | 401 | AUTH401_2 |
| 존재하지 않는 평점 삭제 | 404 | RATING404_1 |
| A의 본인 평점 삭제 | 200 | COMMON200 |

토큰 만료 실험과 커스텀 `@LoginMember` 구현은 진행하지 않았습니다.
