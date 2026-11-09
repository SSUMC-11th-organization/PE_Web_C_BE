# Chapter06 — 입력한 데이터를 저장하기

Spring Boot 3.5.0 / Java 21 / MySQL 회원가입 및 영화 평점 API 실습입니다.
관련 이슈: #22

## 실행

1. MySQL에 `umc_movie` 데이터베이스를 준비합니다.
2. 새 DB라면 Workbench에서 `docs/schema.sql`을 실행합니다. 기존 실습 DB는 해당 테이블과 제약 조건을 사용합니다.
3. 실행 환경에 `DB_USERNAME`, `DB_PASSWORD`를 설정합니다. DB 주소가 다르면 `DB_URL`도 설정합니다.
4. 프로젝트 폴더에서 `./gradlew bootRun`을 실행합니다. Windows에서는 `./gradlew.bat bootRun`을 사용합니다.

DB URL 기본값은 `jdbc:mysql://localhost:3306/umc_movie`입니다. 실제 비밀번호는 저장소에 포함하지 않습니다.
`ddl-auto=validate`이므로 테이블을 자동 생성하거나 기존 데이터를 변경하지 않습니다.

## API 명세

| Method | 경로 | 기능 | 성공 상태 |
| --- | --- | --- | --- |
| GET | /members/nickname/{nickname} | 닉네임 중복 확인 | 200 |
| GET | /members/email/{email} | 이메일 중복 확인 | 200 |
| POST | /members | 회원가입 | 201 |
| GET | /members/{memberId}/ratings | 회원별 평점 조회 | 200 |
| POST | /members/{memberId}/ratings | 평점 등록 | 201 |
| PATCH | /members/{memberId}/ratings/{ratingId} | 평점 수정 | 200 |
| DELETE | /members/{memberId}/ratings/{ratingId} | 평점 삭제 | 204 |

회원가입 요청:

```json
{"email":"practice01@example.com","password":"Umc!1234","nickname":"영화연습01"}
```

평점 등록 요청:

```json
{"movieId":550,"score":5,"comment":"재미있어요!"}
```

평점 수정 요청:

```json
{"score":4,"comment":"다시 보니 4점!"}
```

수정 시 score는 필수이며 comment를 생략하면 기존 후기를 지웁니다.
삭제 성공 응답은 본문이 없습니다. 기존 조회 API는 이전 주차의 응답 형식을 유지합니다.
이번에 추가한 쓰기 API(삭제 성공 제외)와 처리된 예외는 `isSuccess`, `code`, `message`, `result` 형식을 사용합니다.

## 구현

- DTO Bean Validation과 `@Valid`로 이메일, 비밀번호, 닉네임, 별점(1~5), 후기(500자)를 검증합니다.
- BCrypt로 비밀번호를 해시하고 회원 응답 DTO에서는 비밀번호를 제외합니다.
- 서비스의 사전 중복 검사와 DB UNIQUE 제약 조건으로 이메일·닉네임·회원별 영화 평점의 중복을 막습니다.
- 평점 수정·삭제 시 전달된 memberId와 작성자 번호를 비교합니다.
- `GlobalExceptionHandler`에서 검증 오류 400, 작성자 불일치 403, 대상 없음 404, 중복 및 데이터 무결성 오류 409를 처리합니다.
- 로그인 전 실습으로 memberId를 URL에서 받습니다. 현재 로그인 사용자 인증은 구현 범위에 포함하지 않았습니다.

## Postman 실습에서 확인한 결과

| 상황 | 결과 |
| --- | --- |
| 회원가입 | 201, password 없는 응답 |
| 이메일 중복 | 409 |
| 잘못된 이메일 | 400 |
| 평점 등록 | 201, ratingId 반환 |
| 같은 회원·영화에 평점 재등록 | 409 |
| 평점 수정 후 조회 | 200, 변경된 별점·후기 확인 |
| 다른 회원 번호로 평점 수정 | 403 |
| 없는 평점 수정 | 404 |
| 평점 삭제 | 204, 본문 없음 |
| 삭제 후 조회 | 200, 빈 목록 |
| 별점 6점 등록 | 400 |

Workbench에서 회원 비밀번호 저장값도 조회했습니다. 캡처는 별도 미션 기록에 첨부합니다.

## 트러블슈팅

- 이슈: Workbench에서 회원 조회 시 `Error Code: 1046. No database selected`가 발생했습니다.
- 원인: 쿼리를 실행할 기본 데이터베이스를 선택하지 않았습니다.
- 해결: SCHEMAS에서 프로젝트 DB를 선택한 뒤 조회 쿼리를 다시 실행했습니다.
