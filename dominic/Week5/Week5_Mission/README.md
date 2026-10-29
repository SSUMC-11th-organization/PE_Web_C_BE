# UMC 5주차 영화 평점 API

NestJS + TypeORM + MySQL로 워크북의 영화 서비스 API와 필수·선택 미션을 구현했습니다. 기존 4주차 도서 DB는 변경하지 않고 별도 `umc_movie_week5` DB를 사용합니다. 영화 웹 화면은 별도 프론트엔드 프로젝트의 영화 목록 상단에 연결되어 있습니다.

## 실행

Node.js 22.9 이상과 MySQL 8이 필요합니다. 새 환경에서:

```sh
npm ci
cp .env.example .env
# .env에 로컬 MySQL 접속 정보 입력
npm run db:init
npm start
```

이 컴퓨터에는 `.env`와 실습 DB가 이미 준비되어 있습니다. `db:init`은 대상 DB가 비어 있지 않으면 중단하므로 매번 실행하지 않습니다. DB 생성 및 테이블 권한이 필요합니다. SQL과 시드 데이터는 `sql/`에 있으며 기존 데이터는 삭제하지 않습니다.

다른 터미널에서 웹 앱을 실행합니다.

```sh
cd '<프론트엔드 Week5_Mission 경로>'
pnpm install
pnpm dev --host 127.0.0.1 --port 5177 --strictPort
```

웹: http://127.0.0.1:5177/ · API: http://127.0.0.1:3002. 회원 API 영역은 TMDB 토큰 없이도 동작합니다. 영화 목록 데이터는 별도의 TMDB 토큰 설정이 필요합니다. 백엔드 주소를 바꾸려면 웹의 `.env.local`에 `VITE_MEMBER_API_BASE_URL`을 지정하고 Vite를 재시작합니다.

## API 계약

| API | 성공 응답 |
|---|---|
| `GET /members/nickname/{nickname}` | `{ "available": false }` 등 |
| `GET /members/email/{email}` | `{ "available": false }` 등 |
| `GET /members/{memberId}/ratings` | 평점 DTO 배열, 최신순 (동일 시각은 ID 역순) |
| `GET /members/{memberId}/ratings?page=0&size=10` | `{ content, page, size, totalElements, totalPages }` |

닉네임은 앞뒤 공백 없이 2~12자, 이메일은 이메일 형식과 254자 제한을 검사합니다. 잘못된 값은 400, 존재하지 않는 회원은 404입니다. page는 0부터, size는 1~100입니다. page 또는 size를 전달하면 페이지 응답을 사용하고, 생략한 값은 각각 0과 10입니다. 시드 회원 ID는 1·2, 닉네임은 수현·민서, 이메일은 noco@umc.com·minseo@umc.com입니다. 비밀번호는 로그인에 사용할 수 없는 더미 문자열입니다.

`npm test`는 서버와 시드 DB가 실행 중인 상태에서 실제 HTTP 요청을 검사합니다. 프론트엔드는 `pnpm lint`, `pnpm test`, `pnpm build`로 검사합니다.

## 인증과 미션 기록

[미션 기록](MISSION_RECORD.md)에 구현 과정, 결과, 선택 미션, 트러블슈팅과 인증 자료를 정리했습니다. Postman 요청은 [컬렉션](docs/week5.postman_collection.json)에서 가져올 수 있습니다. 노션 제출이나 코드 업로드는 수행하지 않았습니다.
