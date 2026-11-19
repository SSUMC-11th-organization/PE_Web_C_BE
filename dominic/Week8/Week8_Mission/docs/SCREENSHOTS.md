# 8주차 제출 캡처

Swagger UI에서 로컬 MySQL과 연결한 API를 직접 실행한 화면입니다. 실제 응답은 02~06, 08번이며 07번은 문서의 요청 예시입니다. 토큰 문자열을 포함하는 Curl 영역은 제외했습니다.

| 파일 | 확인 내용 |
| --- | --- |
| [01 Swagger 전체 화면](screenshots/01-swagger-overview.jpg) | 다섯 개 API, Bearer 인증 안내, 공개 API 구분 |
| [02 등록](screenshots/02-favorite-create.jpg) | POST /favorites, 201 COMMON201 |
| [03 중복](screenshots/03-favorite-duplicate.jpg) | POST /favorites, 409 FAVORITE409_1 |
| [04 목록](screenshots/04-favorite-list.jpg) | GET /favorites, 200 COMMON200 |
| [05 여부](screenshots/05-favorite-status.jpg) | GET /favorites/550, isFavorite: true |
| [06 해제](screenshots/06-favorite-delete.jpg) | DELETE /favorites/550, 200과 result: null |
| [07 요청 예시](screenshots/07-swagger-request-example.jpg) | POST /movie-records 본문과 인증 표시 |
| [08 영화 기록](screenshots/08-movie-record-success.jpg) | 201, rating과 favorite 동시 반환 |
| [09 트랜잭션 코드](screenshots/09-transaction-code.jpg) | 실제 Service 소스와 롤백 검증 행 수 |

Postman에서도 같은 흐름을 재현하도록 [컬렉션](../postman/week8.postman_collection.json)을 제공하며 [Newman 결과](postman-scenario.txt)는 19개 요청, 47개 검사 모두 통과했습니다.
