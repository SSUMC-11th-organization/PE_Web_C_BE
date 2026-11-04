# UMC 6주차 — 입력한 데이터를 저장하기

5주차 영화 평점 API를 기반으로 NestJS, TypeORM, MySQL에서 회원가입과 평점 등록·수정·삭제를 구현했습니다. 5주차 PR이 아직 병합되지 않아 당시 코드를 이 폴더에 복사해 독립적으로 실행합니다.

## 실행

Node.js 22.9 이상과 MySQL 8이 필요합니다.

```bash
npm ci
cp .env.example .env
# .env에 MySQL 접속 정보 입력
npm run db:init
npm start
```

실습 DB `umc_movie_week6`은 별도로 만듭니다. `db:init`은 대상 DB가 비어 있지 않으면 중단하고 기존 테이블을 삭제하지 않습니다. 현재 로컬 환경에는 DB와 `.env`가 이미 준비되어 있으므로 `npm start`만 실행하면 됩니다.

인증용 화면: http://127.0.0.1:3004/demo/ · API: http://127.0.0.1:3004. 이 화면은 회원가입·평점 등록·검증 실패·동시 가입을 테스트하는 별도 간이 화면입니다. 버튼을 누를 때마다 DB에 테스트 데이터가 생기며 반복 확인할 때는 이메일, 닉네임, 영화 ID를 새 값으로 바꾸세요.

## API 명세

| 메서드와 경로 | 본문 | 성공 |
|---|---|---|
| `POST /members` | `email`, `nickname`, `password` | 201, 회원 ID·이메일·닉네임 |
| `POST /members/:memberId/ratings` | `movieId`, `score`, `comment?` | 201, 평점 ID |
| `PATCH /members/:memberId/ratings/:ratingId` | `score`, `comment?` | 200, result null |
| `DELETE /members/:memberId/ratings/:ratingId` | 없음 | 204, 응답 본문 없음 |
| `GET /members/nickname/:nickname` | 없음 | 200, `result.available` |
| `GET /members/email/:email` | 없음 | 200, `result.available` |
| `GET /members/:memberId/ratings?page=0&size=10` | 없음 | 200, 평점 목록과 페이지 정보 |

성공은 `{ "isSuccess": true, "code": "COMMON201", "message": "...", "result": ... }`, 실패는 `{ "isSuccess": false, "code": "...", "message": "...", "result": null }`을 사용합니다. 204 응답은 HTTP 규칙에 따라 본문이 없습니다. 5주차 GET도 같은 포맷으로 바뀌었으므로 기존 프론트엔드 연동 시 데이터는 `result`에서 읽어야 합니다.

회원가입 이메일은 이메일 형식·254자 이하, 닉네임은 앞뒤 공백 없이 2~12자, 비밀번호는 8자 이상이고 영문 대·소문자·숫자·특수문자를 포함해야 합니다. bcrypt의 72바이트 초과 입력이 잘려 처리되지 않도록 UTF-8 기준 72바이트를 넘으면 400을 반환합니다. 비밀번호는 bcrypt cost 10으로 해시하고 응답에서 제외합니다. 평점은 양의 정수 영화 ID, 1~5점 정수, 선택 후기 500자 이하입니다.

이메일 중복은 `MEMBER4091`, 닉네임 중복은 `MEMBER4092`, 평점 중복은 `RATING4091`로 구분합니다. 잘못된 입력은 400, 평점 소유자 불일치는 403, 없는 회원·평점은 404입니다. 평점 수정 시 후기 값을 생략하면 기존 후기를 유지하고 `null`을 보내면 지웁니다.

**학습용 한계:** 아직 로그인이 없어서 `memberId`는 클라이언트가 정합니다. 경로의 ID와 평점 소유자를 비교하더라도 요청자가 실제로 그 회원인지 인증하지 못하므로, 실제 서비스에서는 JWT 등으로 인증된 사용자 ID를 사용해야 합니다.

## 검증

서버가 실행 중일 때 `npm test`를 실행합니다. 테스트는 실습 DB에 새 회원을 생성하고 평점을 등록·수정·삭제합니다. 회원가입 동시 요청 8건 중 1건 저장·7건 409, bcrypt 해시 일치, 400·403·404·409·204, CORS preflight, 실제 MySQL의 이메일·닉네임·평점 UNIQUE 위반과 전역 예외 변환을 검증했습니다.

[실습 기록](MISSION_RECORD.md), [핵심 키워드](docs/KEYWORDS.md), [API 캡처](docs/browser-success-race.jpg), [입력 검증 캡처](docs/browser-validation.jpg)를 참고하세요.
