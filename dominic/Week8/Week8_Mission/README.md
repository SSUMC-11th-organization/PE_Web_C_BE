# 8주차 즐겨찾기와 영화 기록 API

NestJS와 MySQL로 로그인한 회원의 즐겨찾기 기능을 구현했습니다. 영화 기록은 평점과 즐겨찾기를 하나의 트랜잭션으로 저장합니다. 선택 미션인 Swagger 문서화도 포함합니다.

- 워크북: [8주차 서비스의 핵심 기능 만들기](https://makeus-challenge.notion.site/8-357b57f4596b83088df881b184408f62)
- 이슈: [#33](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/issues/33)
- 브랜치: `dominic/#33` → `dominic/main`
- [노션용 핵심 키워드](docs/KEYWORDS.md), [미션 기록](MISSION_RECORD.md), [스터디 회고](docs/RETROSPECTIVE.md)

## 실행

Node.js 22.9 이상과 MySQL 8이 필요합니다. 7주차 프로젝트를 이어받아 로그인·회원·평점 API도 실행할 수 있도록 구성했습니다.

```bash
npm ci
cp .env.example .env
# .env에 DB 접속 정보와 JWT_SECRET을 입력합니다.
# JWT_SECRET은 node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"로 생성할 수 있습니다.
npm run db:init
npm start
```

기본 주소는 `http://127.0.0.1:3007`입니다. `DB_NAME=umc_movie_week8`을 사용하며 초기화 스크립트는 기존 테이블이 있으면 작업을 중단합니다. `.env`는 Git에서 제외합니다. `synchronize: false`이며 스키마는 [schema.sql](sql/schema.sql)로 만듭니다. 시드 회원의 비밀번호는 로그인용이 아니므로 `POST /members`로 테스트 회원을 생성해 주세요.

## 필수 API

모든 8주차 API에 `Authorization: Bearer {accessToken}`이 필요합니다. 회원은 JWT `sub`로 확인하며 작성자 `memberId`를 요청 파라미터로 정의하지 않습니다. 본문에 임의의 `memberId`를 넣으면 400입니다.

| Method | URL | 요청 | 성공 결과 |
| --- | --- | --- | --- |
| POST | `/favorites` | `{ "movieId": 550 }` | 201, 즐겨찾기 정보 |
| GET | `/favorites` | 없음 | 200, 본인 목록 최신순 또는 `[]` |
| GET | `/favorites/{movieId}` | 영화 ID | 200, `{ "isFavorite": true/false }` |
| DELETE | `/favorites/{movieId}` | 영화 ID | 200, `result: null` |
| POST | `/movie-records` | 아래 예시 | 201, `rating`과 `favorite` |

```json
{
  "movieId": 238,
  "score": 5,
  "comment": "다시 보고 싶은 영화입니다.",
  "addToFavorites": true
}
```

`movieId`는 양의 안전한 정수, `score`는 1~5의 정수, `comment`는 선택 입력이며 최대 500자입니다. `addToFavorites`는 필수 boolean입니다. `false`이면 평점만 저장하고 응답의 `favorite`는 `null`입니다. 이미 즐겨찾기한 영화를 `true`로 기록하면 409이며 평점도 추가하지 않습니다.

공통 응답은 `{ isSuccess, code, message, result }`입니다. 생성은 `COMMON201`, 조회·해제는 `COMMON200`을 사용합니다.

| HTTP | code | 상황 |
| --- | --- | --- |
| 400 | `COMMON400` | 잘못된 영화 ID·별점·본문 |
| 401 | `AUTH401_2` / `AUTH401_3` / `AUTH401_4` | 토큰 누락 / 유효하지 않음 / 만료 |
| 404 | `MEMBER404_1` | 저장할 회원이 없음 |
| 404 | `FAVORITE404_1` | 본인의 해제 대상 즐겨찾기가 없음 |
| 409 | `FAVORITE409_1` | 같은 회원의 같은 영화 즐겨찾기 중복 |
| 409 | `RATING409_1` | 같은 회원의 같은 영화 평점 중복 |

등록하지 않은 영화의 여부 조회는 404가 아닌 200과 `false`입니다. 목록은 `createdAt DESC, favoriteId DESC`로 정렬하여 생성 시각이 같아도 순서를 일정하게 유지합니다. 영화 ID는 TMDB 식별자로 저장하며 별도 영화 테이블의 외래 키를 만들지 않습니다.

## 트랜잭션과 중복 방지

[MovieRecordsService](src/movie-records/movie-records.service.ts)의 `dataSource.transaction()` 안에서 회원과 기존 기록을 조회한 뒤 평점, 즐겨찾기를 저장합니다. 콜백의 `manager.getRepository()`로 얻은 Repository만 사용합니다. 예외가 콜백 밖으로 전달되면 TypeORM이 롤백하고, 이후 전역 예외 필터가 HTTP 응답을 만듭니다. ([TypeORM 공식 문서](https://typeorm.io/docs/advanced-topics/transactions/))

서비스 사전 검사는 이해하기 쉬운 중복 응답을 제공하고, `UNIQUE(member_id, movie_id)`는 동시 요청에서도 중복 저장을 막습니다. DB 제약 이름을 확인해 평점은 `RATING409_1`, 즐겨찾기는 `FAVORITE409_1`로 응답합니다.

## 선택 미션 Swagger

- UI: [http://127.0.0.1:3007/docs](http://127.0.0.1:3007/docs)
- OpenAPI JSON: [http://127.0.0.1:3007/docs-json](http://127.0.0.1:3007/docs-json)

회원가입 후 `/auth/login`으로 발급받은 `accessToken`만 **Authorize**에 입력합니다. UI가 Bearer 헤더를 붙입니다. 8주차 API에는 인증 표시가 있고, 공개 API는 별도로 표시합니다. 각 API의 요청 예시와 HTTP 상태·업무 코드가 포함된 성공/실패 응답 예시를 확인할 수 있습니다. 문서 구성은 [NestJS 공식 문서](https://docs.nestjs.com/openapi/introduction)를 참고했습니다.

공개 API는 회원가입, 로그인, 닉네임·이메일 중복 확인, 회원별 평점 조회입니다. 나머지 회원·평점 쓰기 API와 8주차 API는 기존 글로벌 Guard로 보호합니다.

## 검증과 제출 자료

서버를 먼저 실행하고 다른 터미널에서 아래 명령을 실행합니다.

```bash
npm test
npm run test:scenario
npm run evidence
```

- HTTP·MySQL 통합 테스트: **24개 통과**, [실행 결과](docs/test-results.txt)
- Postman/Newman: **19개 요청, 47개 검사 통과**, [컬렉션](postman/week8.postman_collection.json), [실행 결과](docs/postman-scenario.txt)
- [실제 API 응답과 롤백 조회 기록](docs/api-verification.json)
- [응답·Swagger·트랜잭션 캡처 목록](docs/SCREENSHOTS.md)

통합 테스트는 A/B 회원 데이터 분리, 입력 검증, 인증, 중복, `addToFavorites` 분기, 동시 등록, Swagger 보안 설정을 검사합니다. 롤백 테스트는 전용 `umc_movie_week8` DB에 임시 트리거를 만들어 두 번째 INSERT를 실패시킨 뒤 두 테이블의 행 수가 0인지 확인합니다. `finally`에서 트리거를 제거하고 재요청이 성공하는지도 검사합니다. 테스트 DB 계정에는 해당 DB의 TRIGGER 권한이 필요합니다.

`npm run evidence`는 실제 서비스 소스와 롤백 검증 기록을 `/demo/transaction.html`로 만들어 코드 캡처를 재현합니다. API 캡처는 Swagger의 실제 실행 응답이며, Postman 컬렉션도 별도로 실행 검증했습니다.
