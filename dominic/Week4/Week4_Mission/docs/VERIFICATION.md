# 4주차 실제 실행 확인

확인일: 2026-10-08 (Asia/Seoul). NestJS 서버 `http://127.0.0.1:3001`, MySQL 8.4의 기존 `umc_sql_week2` 데이터베이스, Postman 데스크톱 Lightweight API Client를 사용했다. 아래 사진은 실제 요청·응답 화면이다.

## 확인 결과

| 요청 | 입력/조건 | 실제 결과 | 캡처 |
| --- | --- | --- | --- |
| GET `/books` | 등록 전 전체 도서 | 200, 기존 4권을 ID 4→1 순으로 조회 | [전체 조회](evidence/01-get-books-200.jpg) |
| POST `/books` | categoryId 2, 정상 제목·설명 | 201, bookId 5 생성, categoryName `과학`, isAvailable `true` | [신규 등록](evidence/02-post-book-201.jpg) |
| POST `/books` | categoryId 1, title 공백 3개 | 400, `title은 비어 있을 수 없습니다.` | [제목 오류](evidence/03-post-empty-title-400.jpg) |
| POST `/books` | categoryId 999999, 정상 제목 | 404, `카테고리 999999를 찾을 수 없습니다.` | [카테고리 오류](evidence/04-post-missing-category-404.jpg) |
| GET `/books?keyword=스프링` | 제목 부분 검색 | 200, 새 도서 1권 조회 | [제목 검색](evidence/05-get-keyword-200.jpg) |
| GET `/books?keyword=` | 검색어를 빈 문자열로 전달 | 400, `keyword는 비어 있을 수 없습니다.` | [검색어 오류](evidence/06-get-empty-keyword-400.jpg) |
| GET `/books` | 등록 후 다시 전체 조회 | 200, 새 도서 ID 5가 목록 첫 항목 | [등록 후 전체 조회](evidence/07-get-books-after-create-200.jpg) |

### 실제 등록 요청과 응답

```http
POST http://127.0.0.1:3001/books
Content-Type: application/json
```

```json
{
  "categoryId": 2,
  "title": "스프링과 NestJS로 배우는 ORM",
  "description": "4주차 TypeORM 등록 및 검색 실습"
}
```

응답: `201 Created`

```json
{
  "bookId": 5,
  "title": "스프링과 NestJS로 배우는 ORM",
  "description": "4주차 TypeORM 등록 및 검색 실습",
  "categoryName": "과학",
  "isAvailable": true
}
```

### 실제 검색 응답

`GET /books?keyword=스프링` → `200 OK`

```json
[
  {
    "bookId": 5,
    "title": "스프링과 NestJS로 배우는 ORM",
    "description": "4주차 TypeORM 등록 및 검색 실습",
    "categoryName": "과학",
    "isAvailable": true
  }
]
```

## DB 저장 결과 확인

Postman 등록 후 MySQL을 읽기 전용으로 조회하여 도서가 4권에서 5권으로 늘었음을 확인했다. 원래 도서 ID 1~4는 보존되었고, ID 5에 요청한 제목·설명·category_id 2·is_available 1이 저장되어 있었다. ID 2 `겨울의 편지`의 대여 불가 값은 유지되어 있다.

| book_id | title | category_name | is_available |
| --- | --- | --- | --- |
| 5 | 스프링과 NestJS로 배우는 ORM | 과학 | 1 |
| 4 | 클린 코드 | 문학 | 1 |
| 3 | 우주를 읽는 법 | 과학 | 1 |
| 2 | 겨울의 편지 | 문학 | 0 |
| 1 | 달빛 도서관 | 문학 | 1 |

DB의 0/1 값은 TypeORM의 boolean 매핑을 거쳐 API에서는 false/true로 전달한다. 기존 테이블의 DDL 변경은 실행하지 않았고 `synchronize: false`, `migrationsRun: false`를 유지했다.

## 확인 범위

- `npm run build` 성공 및 수동 코드 검토 완료.
- 필수·선택 요청은 위 Postman 결과로 확인했다. 자동 테스트는 추가하거나 실행하지 않았다.
- 전체 ID 순서·대여 불가 도서 포함 여부를 다시 확인할 수 있는 실제 응답은 [전체 JSON](evidence/get-books-after-create.json)에 저장한다.
- `description`의 UTF-8 65,535바이트 제한과 기타 경계값 검증은 코드에 추가했으며, 위 Postman 캡처에는 별도 경계값 실행 결과가 포함되어 있지 않다.
- 정상 POST는 실제 DB에 도서 한 건을 추가한다. 요청을 반복하면 새 ID가 생성되며, 위 bookId 5는 이번 확인 시점의 값이다.

## 검증 문장

실제 Postman 요청에서 전체 조회 200, 신규 등록 201, 빈 제목 400, 없는 카테고리 404, 제목 검색 200 및 빈 검색어 400을 확인하여 필수 미션과 선택한 두 기능의 실행 결과가 요구사항과 일치함을 확인했다.
