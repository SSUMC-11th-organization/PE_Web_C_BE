# Week 9 · 함께 테스트하고 다듬기

[9주차 워크북](https://makeus-challenge.notion.site/9-2deb57f4596b83bcb2f681f4382bfd21) · [이슈 #37](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/issues/37)

8주차 NestJS 영화 API를 이어서 Swagger 문서를 완성하고, 단위·통합 테스트로 성공·실패 응답과 저장 상태를 검증했습니다. 이 폴더만 설치해 실행할 수 있습니다.

## 설치와 테스트

Node.js 22 이상을 사용합니다. 검증 환경은 Node.js 25.3.0, MySQL 8입니다.

```bash
npm ci
npm run build
npm run typecheck:test
npm test                  # 가짜 Repository 단위 테스트 4개
npm run test:e2e           # sql.js 메모리 DB 통합 테스트 14개
npm run test:mutations     # 임시 복사본에서 제거 → 실패 확인 → 복원 후 통과
```

단위·메모리 DB 테스트는 `.env`, MySQL, 별도 서버가 필요하지 않습니다. 테스트마다 메모리 스키마를 새로 만들고 종료 시 연결을 닫습니다. 실제 Guard, ValidationPipe, ExceptionFilter, 서비스와 Repository를 사용하며 HTTP 포트는 임의의 루프백 포트입니다. 통합 테스트가 Guard를 가짜로 대체하지 않습니다.

MySQL의 BIGINT 자동 증가 PK는 sql.js에서 지원되지 않아 **테스트 전용** `MemoryDataSource`가 자동 증가 컬럼만 INTEGER로 바꿉니다. BIGINT 조회값은 MySQL과 같은 문자열로 정규화합니다. 프로덕션 엔티티·MySQL 스키마·FK·복합 UNIQUE는 유지합니다. SQLite 테스트만으로 MySQL 동시성까지 보장하지 않으므로 별도 MySQL 회귀 테스트를 제공합니다.

## MySQL 서버와 Swagger

```bash
cp .env.example .env
# DB 연결 정보와 32바이트 이상의 JWT_SECRET을 .env에 설정
npm run db:init
npm start
```

- Swagger: <http://127.0.0.1:3009/swagger-ui> (`/docs`도 지원)
- OpenAPI JSON: <http://127.0.0.1:3009/swagger-ui-json> (`/docs-json`도 지원)
- 실행 증빙 뷰어: <http://127.0.0.1:3009/demo/evidence.html>
- DB 기본 이름: `umc_movie_week9`, `synchronize: false`
- `db:init`은 비어 있는 DB에서만 동작하며 기존 테이블이 있으면 중단합니다.
- `.env`는 Git에서 제외됩니다. 예시 파일의 DB 비밀번호·JWT 키는 비워 두었습니다.
- 로그인 가능한 계정은 `POST /members`로 직접 만듭니다. SQL seed의 계정은 로그인 실습용이 아닙니다.

Swagger에서 회원가입 → 로그인 → accessToken 복사 → **Authorize**에 토큰 값만 입력 → `POST /favorites`의 Try it out → Execute를 실행합니다. 처음에는 201 / COMMON201, 같은 회원·영화로 재요청하면 409 / FAVORITE409_1입니다. 공개 API에는 자물쇠가 없고 보호 API에는 자물쇠가 있습니다. 캡처에는 JWT가 보이는 Curl 영역을 포함하지 않았습니다.

서버가 켜져 있는 상태에서 추가 검증합니다.

```bash
npm run test:mysql        # 실제 MySQL 회귀 테스트 24개
npm run test:scenario     # Postman/Newman 19요청, 47검증
npm run evidence         # 저장된 실제 로그로 HTML 증빙 재생성
```

MySQL 회귀 테스트는 전용 DB `umc_movie_week9`와 TRIGGER 권한이 필요합니다. 일시적인 트리거로 두 번째 INSERT를 실패시킨 후 평점·즐겨찾기 모두 0건인지 확인하고 `finally`에서 트리거를 제거합니다. 테스트가 만든 회원·평점은 이 전용 DB에 남습니다.

## API 문서 범위

15개 operation 모두 한 줄 설명, 인증 여부, 성공·실패 HTTP 상태와 `code` 예제를 제공합니다. 평점/닉네임 요청 DTO와 ID·페이지 파라미터도 문서화했습니다.

| API | 인증 | 정상 | 주요 실패 |
|---|---|---|---|
| POST /members | 공개 | 201 / COMMON201 | 400 / COMMON400, 409 / MEMBER409_1·2 |
| POST /auth/login | 공개 | 200 / COMMON200 | 400 / COMMON400, 401 / AUTH401_1 |
| GET /members/nickname/:nickname, /members/email/:email | 공개 | 200 / COMMON200 | 400 / COMMON400 |
| GET /members/:memberId/ratings | 공개 | 200 / COMMON200 | 400 / COMMON400, 404 / MEMBER404_1 |
| GET /members/me | JWT | 200 / COMMON200 | 401 / AUTH401_2·3·4, 404 / MEMBER404_1 |
| PATCH /members/me | JWT | 200 / COMMON200 | 400, 401, 404, 409 / MEMBER409_1 |
| POST /ratings | JWT | 201 / COMMON201 | 400, 401, 404 / MEMBER404_1, 409 / RATING409_1 |
| PATCH, DELETE /ratings/:ratingId | JWT | 200 / COMMON200, result null | 400, 401, 403 / RATING403_1, 404 / RATING404_1 |
| POST /favorites | JWT | 201 / COMMON201 | 400, 401, 404 / MEMBER404_1, 409 / FAVORITE409_1 |
| GET /favorites | JWT | 200 / COMMON200, 배열 | 401 / AUTH401_2·3·4 |
| GET /favorites/:movieId | JWT | 200 / COMMON200, isFavorite | 400, 401 |
| DELETE /favorites/:movieId | JWT | 200 / COMMON200, result null | 400, 401, 404 / FAVORITE404_1 |
| POST /movie-records | JWT | 201 / COMMON201 | 400, 401, 404 / MEMBER404_1, 409 / RATING409_1·FAVORITE409_1 |

보호 API의 공통 400은 COMMON400, 401은 AUTH401_2(누락)·3(위조)·4(만료)입니다. 문서의 각 응답 예제에서 정확한 상태와 code를 함께 확인할 수 있습니다. 회원 평점 조회는 쿼리가 없으면 배열, `page` 또는 `size`를 주면 `{ content, page, size, totalElements, totalPages }`입니다.

## 선택 미션: 실패 응답과 DB 상태를 함께 확인

`POST /movie-records`는 트랜잭션 내부에서 평점을 저장한 후 즐겨찾기 중복을 검사·저장합니다. 이미 즐겨찾기한 영화라면 FAVORITE409_1이 발생하고, 먼저 INSERT한 평점도 롤백됩니다. `addToFavorites: false`이면 평점만 저장하고 favorite는 null입니다.

통합 테스트는 기존 즐겨찾기 1건·평점 0건을 준비하고 요청 후 평점 전체 개수와 해당 회원·영화의 평점 개수가 그대로인지 확인합니다. 트랜잭션을 제거한 임시 복사본에서는 HTTP 409가 유지되어도 **Expected: 0 / Received: 1**로 실패합니다. 기존 8주차의 사전 중복 검사 순서 그대로라면 INSERT 전에 종료되어 트랜잭션을 제거해도 테스트가 통과하므로, 실패 지점을 첫 INSERT 뒤로 이동했습니다.

`npm run test:mutations`는 소스와 설정을 OS 임시 디렉터리에 복사하고 node_modules만 연결합니다. 원본 소스와 MySQL에는 변경을 가하지 않으며, 각 실패 로그가 기대한 테스트에서 발생했는지도 확인합니다. 실험 후 원복한 복사본에서 전체 단위·통합 테스트를 다시 실행하고 임시 폴더를 제거합니다.

즐겨찾기 중복 검사를 제거하면 단위 테스트는 예외 대신 정상 저장 응답을 받아 실패합니다. sql.js 통합 테스트는 UNIQUE가 중복 INSERT를 차단하지만 SQLite 예외를 MySQL 전용 필터가 매핑하지 않아 **409 예상 → 500 응답**으로 실패합니다. 이 결과를 중복 데이터가 저장됐다는 뜻으로 해석하지 않습니다. 실제 MySQL에서는 UNIQUE와 ER_DUP_ENTRY 매핑도 중복을 방어합니다.

## 제출 자료

- [요구사항별 완료·검증](docs/REQUIREMENTS.md)
- [미션 기록](MISSION_RECORD.md), [트러블슈팅](docs/TROUBLESHOOTING.md)
- [핵심 키워드: 항목별 3줄 이내](docs/KEYWORDS.md)
- [스터디 회고 및 1분 발표](docs/RETROSPECTIVE.md)
- [캡처 목록](docs/SCREENSHOTS.md)
- [단위·메모리 통합 결과](docs/test-results.txt), [MySQL 결과](docs/mysql-test-results.txt), [Newman 결과](docs/postman-scenario.txt)
- [실패 실험 요약](docs/mutation-results.json), [PR 초안](../PR_DRAFT.md)

## 검증의 한계

메모리 DB는 MySQL 격리 수준·락·동시성의 대체물이 아닙니다. 브라우저 CORS 차단도 서버 테스트만으로 확인할 수 없으며, 이번 Swagger 검증은 같은 origin에서 실행했습니다. 기존 MySQL CORS preflight 검증은 유지했습니다.

2026-11-27 `npm audit --omit=dev`에서 TypeORM 0.3.31의 glob/minimatch 경로와 관련된 moderate 3건(전이 의존성 포함)이 보고됐습니다. audit의 자동 해결안은 TypeORM 1.x로의 major 변경이므로 이번 학습 미션에서는 0.3 API를 유지했습니다. 정적 엔티티 클래스 목록을 사용하며 사용자 입력으로 glob 경로를 받지 않습니다.

## 공식 참고 자료

- [NestJS 테스트: TestingModule, Repository 대체, Supertest](https://docs.nestjs.com/fundamentals/testing)
- [NestJS OpenAPI 문서](https://docs.nestjs.com/openapi/introduction)
- [TypeORM sql.js 옵션](https://typeorm.io/docs/drivers/sqlite/)
