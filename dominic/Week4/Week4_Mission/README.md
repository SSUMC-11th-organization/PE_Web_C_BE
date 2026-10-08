# 4주차 — ORM으로 생산성 높이고 첫 API 완성하기

[백엔드 PR #7](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/pull/7) · [관련 이슈 #6](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/issues/6)

Node.js의 **NestJS + TypeORM + MySQL**을 사용해 도서 조회·등록 API를 구현했다. Controller → Service → Repository 구조를 유지하며, 도서 CRUD는 직접 작성한 SQL 대신 TypeORM Repository로 처리한다.

## 구현 범위

| 구분 | 내용 |
| --- | --- |
| 필수 | Book·Category Entity와 Category 1:N Book 관계 |
| 필수 | `GET /books`: 전체 도서를 `bookId` 내림차순으로 조회 |
| 필수 | `POST /books`: DTO 검증 후 신규 도서 등록, `201 Created` |
| 필수 | 잘못된 요청 `400`, 존재하지 않는 카테고리 `404` |
| 선택 1 | 카테고리를 함께 조회하고 `categoryName`을 Response DTO에 포함 |
| 선택 2 | `GET /books?keyword=스프링`: 제목 부분 검색 |

선택 3인 제목 UNIQUE 제약과 중복 등록 `409` 처리는 선택하지 않았다.

3주차 Raw SQL 버전은 [기존 백엔드 PR #2](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/pull/2)와 로컬 `week3-book-rental-api` 폴더에 보존했다. 이번 브랜치는 `dominic/main`에서 시작해 `dominic/Week4/Week4_Mission`에 4주차 결과물을 추가한다.

## 실행 방법

### 1. 준비

- Node.js **22.9.0 이상**, npm, MySQL이 필요하다.
- 2주차에 만든 `umc_sql_week2` DB와 기존 `book`, `category` 테이블·데이터를 사용한다.
- MySQL을 실행하고 `.env`의 접속 정보를 자신의 로컬 환경에 맞춘다.

이 프로젝트는 `synchronize: false`, `migrationsRun: false`로 설정되어 있다. 서버를 실행해도 테이블을 만들거나 DDL·Migration을 자동 실행하지 않는다. 기존 테이블의 컬럼 이름·타입·PK·FK에 맞춰 Entity를 명시적으로 매핑했다.

### 2. 설치·실행

아래 명령은 이 README가 있는 프로젝트 폴더에서 실행한다.

```bash
npm ci
cp .env.example .env
npm start
```

기본 주소는 **`http://127.0.0.1:3001`**이다. `.env.example`에는 포트 `3001`, DB `umc_sql_week2`를 지정했으며 실제 `.env`는 Git에 포함하지 않는다.

개발 중 자동 재시작이 필요하면 다음 명령을 사용한다.

```bash
npm run start:dev
```

## API

### GET /books

- 대여 불가능한 도서도 포함한 **전체 목록**을 반환한다.
- 최신순의 기준은 `bookId DESC`이다.
- `BookRepository.findAll()`에서 `category`를 JOIN으로 함께 조회한다. 목록의 각 도서마다 카테고리를 별도로 조회하지 않는다.
- Entity 전체를 노출하지 않고 아래 5개 camelCase 필드만 반환한다.

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

위 JSON은 응답 형식의 예시다. 실제 전체 목록에는 기존 도서도 포함되며, 현재 DB 데이터에 따라 목록이 달라진다.

### POST /books

```json
{
  "categoryId": 2,
  "title": "스프링과 NestJS로 배우는 ORM",
  "description": "4주차 TypeORM 등록 및 검색 실습"
}
```

| 필드 | 검증·처리 |
| --- | --- |
| `categoryId` | 필수, 양의 안전한 정수. 숫자 문자열도 정수로 변환하며 null·공백·boolean은 허용하지 않음 |
| `title` | 필수 문자열, 앞뒤 공백 제거 후 빈 값 금지, 최대 100자 |
| `description` | 생략·null 또는 문자열, UTF-8 최대 65,535바이트. 생략하면 DB에 null 저장 |

- 전역 `ValidationPipe`에서 요청을 변환·검증하고, DTO에 없는 속성은 `400`으로 거절한다.
- Service에서 카테고리가 실제로 존재하는지 확인한다. 없으면 `404 Not Found`이다.
- Repository의 `create()`로 객체를 만들고 `save()`로 저장한다. 신규 도서의 `isAvailable`은 `true`이다.
- 성공하면 `201 Created`와 GET의 항목과 같은 Response DTO를 반환한다.

**정상 POST를 다시 보내면 새 도서가 추가되며 새 ID가 생성된다.** 제목 중복을 막는 기능은 이번 선택 범위에 포함하지 않았다.

### GET /books?keyword=스프링

- 제목에 `keyword`가 포함된 도서를 `bookId DESC`로 조회한다.
- 검색어는 앞뒤 공백을 제거한 문자열이어야 하고, 1~100자를 허용한다.
- 검색어를 생략하면 전체 목록, 검색 결과가 없으면 `200`과 빈 배열을 반환한다.
- `?keyword=`처럼 빈 검색어를 전달하면 `400 Bad Request`이다.
- TypeORM `Like()`를 사용하며 `%`, `_`, `\`는 검색어의 문자 그대로 처리하도록 이스케이프한다.

## 핵심 코드

| 역할 | 파일 |
| --- | --- |
| Entity | [Book](src/books/book.entity.ts), [Category](src/categories/category.entity.ts) |
| 요청 DTO | [CreateBookDto](src/books/dto/create-book.dto.ts), [FindBooksQueryDto](src/books/dto/find-books-query.dto.ts) |
| 응답 DTO | [BookResponseDto](src/books/dto/book-response.dto.ts) |
| Repository | [BookRepository](src/books/book.repository.ts), [CategoryRepository](src/categories/category.repository.ts) |
| Service | [BooksService](src/books/books.service.ts) |
| Controller | [BooksController](src/books/books.controller.ts) |
| ORM 연결·검증 | [AppModule](src/app.module.ts), [main.ts](src/main.ts) |

## 요청 예제와 Postman 인증

- [requests.http](requests.http): 에디터의 REST Client에서 사용할 요청 6개
- [Postman Collection](docs/week4.postman_collection.json): Postman의 Import에서 가져올 파일. `baseUrl` 기본값은 `http://127.0.0.1:3001`
- Collection은 요청 예제만 포함하며 자동 테스트 스크립트나 인증 정보는 포함하지 않는다.

2026-10-08에 실제 Postman에서 확인한 결과를 캡처했다.

| 확인 항목 | 실제 결과 캡처 |
| --- | --- |
| 전체 조회 | [200 OK](docs/evidence/01-get-books-200.jpg) |
| 신규 등록 | [201 Created](docs/evidence/02-post-book-201.jpg) |
| 빈 제목 | [400 Bad Request](docs/evidence/03-post-empty-title-400.jpg) |
| 없는 카테고리 | [404 Not Found](docs/evidence/04-post-missing-category-404.jpg) |
| 제목 검색 | [200 OK](docs/evidence/05-get-keyword-200.jpg) |
| 빈 검색어 | [400 Bad Request](docs/evidence/06-get-empty-keyword-400.jpg) |
| 등록 후 전체 조회 | [200 OK](docs/evidence/07-get-books-after-create-200.jpg) |

## 제출용 기록

- [미션 기록](MISSION_RECORD.md): 구현 과정, Raw SQL 비교, 완료 기준
- [핵심 키워드](docs/KEYWORDS.md): 공식 문서 기반 개념 정리
- [실행 검증 기록](docs/VERIFICATION.md): 실제 요청·응답과 인증 자료
