# UMC 3주차 - NestJS 도서 대여 API

사용자가 제공한 「3주차 - 첫 API 만들고 검증하기」 PDF를 기준으로 Node.js 과정의 **NestJS**를 선택했다. Controller - Service - Repository로 분리하고 DTO와 ORM 없이 mysql2의 Raw SQL을 사용한다. 응답은 DB의 snake_case 컬럼을 그대로 사용한다.

## 구현 및 실제 확인

| 구분 | API | Postman에서 확인한 상태 |
| --- | --- | --- |
| 기본 실습 1 | `GET /books` | 200 OK |
| 기본 실습 2 | `POST /books` | 201 Created |
| 필수 미션 1 | `GET /books/category/:categoryId` | 200 OK |
| 필수 미션 2 | `POST /rentals` | 201 Created |
| 선택 미션 | `PATCH /rentals/:rentalId/return` | 200 OK |

2026-10-01(한국 시간)에 Postman Lightweight API Client에서 실제 요청을 보냈다. URL, POST Body, 상태 코드, JSON 응답이 보이는 **캡처 6장**을 `docs/evidence/`에 저장했다. 도서 등록 후 GET 재조회도 확인했다.

- 새 도서: `book_id = 4`, 제목 `클린 코드`
- 새 대여: `rental_id = 3`, `user_id = 1`, `book_id = 4`
- 대여: `2026-10-01 23:22:34`
- 반납 기한: `2026-10-08 23:22:34`
- 반납 완료: `2026-10-01 23:24:07`
- MySQL에서 대여 기간 `604800초 = 7일`, 반납 후 `is_available = 1`을 확인했다.

기존 `umc_sql_week2`에 책 1권과 대여 기록 1개가 추가됐으며, 새 대여는 반납까지 완료됐다. 현재 책은 4권, 대여 기록은 3개다.

## 실행

Node.js 22.9 이상과 MySQL 8.x를 준비하고, 이 프로젝트 디렉터리에서 다음 순서로 실행한다.

```bash
npm ci
cp .env.example .env
# .env의 DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME을 수정
npm start
```

서버: **http://127.0.0.1:3000**. `npm start`는 NestJS를 빌드하고 실행한다. 종료는 `Ctrl+C`, 개발 중 자동 빌드·재시작은 `npm run start:dev`를 사용한다.

실제 인증에 사용한 DB 이름은 `umc_sql_week2`다. 비밀번호는 `.env`에서 관리하고 Git에 포함하지 않는다. `GET /health`로 DB 연결 상태를 확인할 수 있다. 로컬 학습용 서버이며 로그인 인증은 포함하지 않는다.

## 3계층 구조

```text
src/
  main.ts                       서버 시작·종료, 공통 예외 필터
  app.module.ts                 NestJS 부품 등록
  database/database.module.ts  환경변수와 MySQL 커넥션 풀
  books/
    book.controller.ts         요청과 경로 변수·Body
    book.service.ts            입력 및 카테고리 존재 검사
    book.repository.ts         도서 SELECT·INSERT 생 SQL
  rentals/
    rental.controller.ts       대여 POST·반납 PATCH 요청
    rental.service.ts          대여 정책, 중복 검사, 트랜잭션
    rental.repository.ts       대여 SELECT·INSERT·UPDATE 생 SQL
  common/                      입력 검사, 트랜잭션, 오류 응답
```

SQL은 Repository에, 대여 여부 판단과 트랜잭션 흐름은 Service에 두었다. 모듈에서 부품을 등록하고 생성자 주입으로 연결한다. 커넥션 풀은 최대 10개 연결을 사용한다.

## 필수 1: 카테고리 도서 조회

```bash
curl 'http://127.0.0.1:3000/books/category/1'
```

```sql
SELECT * FROM book WHERE category_id = ? ORDER BY book_id DESC;
```

해당 카테고리의 모든 도서가 포함되므로 대여 불가 도서도 반환한다. 카테고리에 책이 없으면 빈 배열, 카테고리 자체가 없으면 404다.

## 필수 2: 대여 생성

```bash
curl -i -X POST 'http://127.0.0.1:3000/rentals' \
  -H 'Content-Type: application/json' \
  -d '{"userId":1,"bookId":4}'
```

```sql
INSERT INTO rental (user_id, book_id, rented_at, due_at, returned_at)
VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NULL);
```

성공 응답은 201이며 **응답 객체의 `rental_id`**를 다음 반납 요청에 사용한다. `userId`, `bookId`는 JSON 숫자로 전달한다. 사용자·도서가 없으면 404, 대여 불가 또는 미반납 기록이 있으면 409다.

책을 `FOR UPDATE`로 잠그고 대여 기록 생성과 `is_available = FALSE` 변경을 같은 트랜잭션에서 실행한다. 실패하면 롤백한다.

## 선택: 반납

```bash
# <rental_id>를 앞 POST 응답의 실제 값으로 바꿔 실행
curl -i -X PATCH 'http://127.0.0.1:3000/rentals/<rental_id>/return'
```

```sql
UPDATE rental SET returned_at = NOW() WHERE rental_id = ?;
```

Body 없이 경로 변수만 전달한다. 성공은 200이며 변경된 대여 기록을 반환한다. 다른 미반납 기록이 없으면 도서를 다시 대여 가능하게 변경한다. 이미 반납한 기록은 409로 처리하고 기존 반납 시각을 유지한다.

캡처의 `rental_id = 3`은 이미 반납됐다. 다시 실습할 때는 새 POST 응답의 ID를 사용한다.

## 기본 실습: 전체 조회·도서 등록

```bash
curl 'http://127.0.0.1:3000/books'
curl -i -X POST 'http://127.0.0.1:3000/books' \
  -H 'Content-Type: application/json' \
  -d '{"categoryId":1,"title":"클린 코드","description":"애자일 소프트웨어 장인 정신"}'
```

GET은 JSON 배열, POST는 생성된 책 객체를 반환한다. 책 ID는 AUTO_INCREMENT이므로 입력하지 않는다. 등록 요청을 반복하면 새 책이 계속 생성된다.

## Postman 사용법

1. 계정 없이 `Continue without an account → Open Lightweight API Client`를 선택하면 직접 요청할 수 있다.
2. 계정으로 Collections를 사용하는 경우 `postman/UMC-Week3.postman_collection.json`을 Import한다.
3. 필수 1: `GET http://127.0.0.1:3000/books/category/1`
4. 필수 2: `POST http://127.0.0.1:3000/rentals`, `Body → raw → JSON`, 본문 `{"userId":1,"bookId":4}`
5. 응답 객체의 `rental_id`를 Collection Variables의 `rentalId`에 입력한다.
6. 선택: `PATCH http://127.0.0.1:3000/rentals/새ID/return`, Body는 `none`이다.

응답은 DB 행 또는 배열 그대로다. 날짜는 MySQL 세션 시간대의 DATETIME 문자열이고 `is_available`은 0 또는 1이다. 새 DB의 초기 데이터에는 책 4가 없으므로 도서를 먼저 등록하거나 대여 가능한 기존 ID를 사용한다.

## 오류 처리와 검증 범위

| 상태 | 구현한 처리 |
| --- | --- |
| 400 | 잘못된 ID, 필수 값 누락, 빈 제목, 잘못된 JSON |
| 404 | 없는 카테고리·사용자·도서·대여 기록 또는 경로 |
| 409 | 대여 불가, 중복 대여·반납, DB 잠금 충돌 |
| 413 | 과도하게 큰 요청 본문 |
| 415 | POST 요청이 JSON Content-Type이 아님 |
| 500 | 서버 및 DB 오류; SQL·접속 정보를 응답에 노출하지 않음 |

실제 Postman 성공 흐름, 등록 후 재조회, DB 저장 결과를 확인했다. 오류 분기·동시 요청·롤백에 대한 별도 자동 테스트는 실행하지 않았다.

## 새 실습 DB 만들기

기존 2주차 테이블과 데이터를 사용하거나, 빈 DB를 준비하려면 `.env`의 DB_NAME을 새 이름으로 바꾸고 실행한다.

```bash
npm run db:init
npm start
```

`sql/01_schema.sql`, `sql/02_seed.sql`을 순서대로 실행한다. 대상 DB에 테이블이 있으면 중단하며 기존 DB를 삭제하지 않는다. MySQL DDL은 자동 커밋되므로 실패 시 이미 생성된 테이블은 남을 수 있다. 원인을 해결하고 새 빈 DB를 지정한다.

## 제출 자료

- `MISSION_RECORD.md`: 중간 과정, 핵심 코드, 실제 결과를 정리한 미션 기록
- `docs/KEYWORDS.md`: 핵심 키워드 간단 정리와 공식 참고 자료
- `docs/evidence/`: 실제 Postman JPG 캡처 6장
- `docs/VERIFICATION.md`: 확인 결과와 캡처 목록
- `docs/database-verification.json`: 실제 MySQL 저장 결과
- `postman/UMC-Week3.postman_collection.json`, `requests.http`: 재실행용 요청 모음

노션에는 미션 기록을 붙여 넣고 JPG 파일을 해당 위치에 직접 첨부한다. 개인 노션 페이지 URL 제출은 아직 수행하지 않았다.

## 참고

- 사용자 제공 PDF 「3주차 - 첫 API 만들고 검증하기」: 3계층(7-10쪽), 기본 실습(14-31쪽), 미션·인증(34-36쪽)
- [NestJS Controller 공식 문서](https://docs.nestjs.com/controllers)
- [NestJS 환경 설정 공식 문서](https://docs.nestjs.com/techniques/configuration)
- [mysql2 prepared statements 공식 문서](https://sidorares.github.io/node-mysql2/docs/examples/queries/prepared-statements)
