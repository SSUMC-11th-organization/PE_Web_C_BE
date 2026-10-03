# 3주차 실제 실행 결과

확인일: 2026-10-01, Asia/Seoul. NestJS 11.2.7, mysql2 3.24.5, MySQL 8.4.11, Postman 12.29.5.

| 구분 | 요청 | 실제 상태 | 캡처 |
| --- | --- | --- | --- |
| 필수 1 | GET /books/category/1 | 200 | evidence/01-category-get-200.jpg |
| 기본 실습 | GET /books | 200 | evidence/04-books-get-200.jpg |
| 기본 실습 | POST /books | 201 | evidence/05-books-post-201.jpg |
| 필수 2 | POST /rentals | 201 | evidence/02-rentals-post-201.jpg |
| 선택 | PATCH /rentals/3/return | 200 | evidence/03-rentals-return-200.jpg |
| 등록 후 재조회 | GET /books | 200 | evidence/06-books-get-after-create-200.jpg |

JPG는 실제 Postman 화면을 촬영한 것이다. 대여 생성에는 URL, JSON Body, 201과 대여 기록이, 반납에는 본문 없는 PATCH 요청, 200과 반납일이 함께 보인다.

## 실제 MySQL 결과

- 새 도서: book_id 4, 클린 코드
- 새 대여: rental_id 3, user_id 1, book_id 4
- 대여 시각: 2026-10-01 23:22:34
- 반납 기한: 2026-10-08 23:22:34
- 반납 시각: 2026-10-01 23:24:07
- 대여 기간: 604800초 = 7일
- 반납 후 is_available: 1
- 도서 개수: 3 → 4, 대여 기록 개수: 2 → 3

`database-verification.json`은 실제 MySQL SELECT 결과다. 대여·반납은 기존 실습 DB에서 실행했으며 새 기록은 삭제하지 않았다.

## 검증 범위

NestJS 빌드, DB 연결, Postman 성공 흐름, 등록 후 GET, DB 저장 결과와 반납 기한을 확인했다. 별도의 자동 테스트, 동시 요청, 오류 분기, 장애 시 롤백 검증은 실행하지 않았다.
