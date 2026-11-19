# 8주차 미션 기록 서비스의 핵심 기능 만들기

## 목표와 준비

이번 주에는 로그인한 회원이 영화를 즐겨찾기에 보관하고, 평점과 즐겨찾기를 한 요청으로 저장하는 기능을 구현했습니다. 7주차의 JWT 인증과 평점 기능을 이어받아 `dominic/Week8/Week8_Mission`에 프로젝트를 구성하고, 별도 MySQL 실습 DB `umc_movie_week8`을 사용했습니다.

워크북의 요청·응답 규칙을 먼저 정리했습니다. 즐겨찾기 등록은 201, 목록·여부 조회와 해제는 200으로 응답하도록 했습니다. 해제 성공 시에는 `result: null`을 반환하고, 아직 즐겨찾기하지 않은 영화의 여부 조회는 오류 대신 `isFavorite: false`를 반환하도록 했습니다.

## 즐겨찾기 엔티티와 API 구현

Favorite 엔티티를 만들고 Member와 다대일 관계를 연결했습니다. 한 회원이 같은 영화를 여러 번 보관하지 못하도록 `(member_id, movie_id)` 복합 UNIQUE를 엔티티와 SQL 스키마에 명시했습니다. `movieId`는 TMDB 영화 식별자로 저장했습니다.

TypeORM Repository를 주입한 Service와 Controller를 작성하여 등록·목록·여부 조회·해제 API 네 개를 구현했습니다. 기존 글로벌 Guard가 토큰을 검증하고, `@LoginMember()`로 전달받은 회원 ID를 모든 조회와 삭제 조건에 넣었습니다. 본문에서 임의의 `memberId`를 보내면 검증 오류가 나며, 다른 회원의 ID를 쿼리에 넣어도 본인의 목록만 조회되는 것을 확인했습니다.

목록은 생성 시각 역순으로 조회하고, 같은 시각에 생성된 데이터는 즐겨찾기 ID 역순으로 정렬했습니다. 데이터가 없을 때는 200과 빈 배열을 반환했습니다. 같은 영화를 다시 등록하면 `409 FAVORITE409_1`, 본인에게 없는 즐겨찾기를 해제하면 `404 FAVORITE404_1`을 반환했습니다.

## 평점과 즐겨찾기를 하나의 트랜잭션으로 저장

`POST /movie-records`를 전담하는 MovieRecordsService를 만들었습니다. `addToFavorites`가 true이면 평점과 즐겨찾기를 함께 저장하고, false이면 평점만 저장하여 응답의 `favorite`를 null로 반환했습니다. 이미 등록된 평점은 `RATING409_1`, 추가하려는 즐겨찾기가 이미 있으면 `FAVORITE409_1`로 거절했습니다.

두 저장은 `dataSource.transaction()`으로 묶었습니다. 콜백에서 전달받은 manager로 Member·Rating·Favorite Repository를 얻고, 조회부터 저장까지 같은 트랜잭션 연결을 사용했습니다. 예외를 콜백 내부에서 정상 응답으로 바꾸지 않고 밖으로 전달하여 TypeORM이 롤백한 다음 전역 필터가 오류를 응답하도록 했습니다.

**평점과 즐겨찾기를 하나의 사용자 행동으로 처리하여, 어느 저장이 실패하더라도 다른 저장이 남지 않게 묶었습니다.**

서비스에서 중복 여부를 조회해도 동시 요청 둘이 모두 검사를 통과할 수 있다는 점을 고려했습니다. DB의 복합 UNIQUE를 유지하고 실제 UNIQUE 오류도 제약 이름에 따라 동일한 409 코드로 처리했습니다.

## 실제 요청과 DB 검증

서로 다른 회원 A와 B로 로그인한 뒤 즐겨찾기를 등록하고, B의 목록에는 A의 데이터가 나오지 않는 것을 확인했습니다. B의 토큰으로 A가 보관한 영화를 해제하려고 하면 404가 발생하며 A의 데이터는 유지되었습니다. 두 회원이 같은 영화를 각각 즐겨찾기하는 것은 허용했습니다.

영화 기록 저장 요청은 201과 함께 `result.rating`, `result.favorite`를 모두 반환했습니다. 같은 요청을 다시 보내면 409가 발생하고 두 테이블의 행 수가 늘어나지 않았습니다. `addToFavorites: false`일 때는 즐겨찾기를 추가하지 않고 평점만 저장되는 것도 확인했습니다.

사전 중복 검사만 실패시키면 실제 저장 후 롤백을 검증할 수 없으므로, 전용 실습 DB의 즐겨찾기 INSERT에만 오류를 내는 임시 트리거를 만들었습니다. 평점 INSERT 다음 즐겨찾기 INSERT에서 오류가 발생하도록 요청한 뒤 DB를 직접 조회했습니다. 요청 전과 실패 후의 결과가 모두 `ratings: 0, favorites: 0`이어서 첫 번째 저장도 취소되는 것을 확인했습니다. 검증 후에는 `finally`에서 트리거를 제거하고 같은 요청의 정상 저장도 확인했습니다.

동일한 즐겨찾기 등록 요청 8개를 동시에 보냈을 때에는 1개만 201로 성공하고 7개가 `FAVORITE409_1`로 거절되었습니다. DB에도 즐겨찾기가 1개만 저장되었습니다. 기존 인증·평점 회귀 검증을 포함한 통합 테스트 24개가 모두 통과했습니다.

Postman 컬렉션도 작성하고 Newman으로 19개 요청과 47개 검사를 실행하여 모두 통과했습니다. [Postman 실행 결과](docs/postman-scenario.txt), [통합 테스트 결과](docs/test-results.txt), [실제 응답과 롤백 기록](docs/api-verification.json)을 함께 남겼습니다.

## 선택 미션 Swagger 문서화

NestJS 11에 맞는 `@nestjs/swagger` 11.4.8을 적용했습니다. `/docs`에서 다섯 개의 8주차 API와 요청 예시, 성공 응답, HTTP 상태와 업무 코드가 포함된 실패 응답을 확인할 수 있도록 했습니다. Bearer 인증 방식도 등록하여 Authorize에 로그인 토큰을 입력한 뒤 실제 요청을 실행했습니다.

회원가입·로그인 등 공개 API와 토큰이 필요한 API를 구분했습니다. Swagger에서 즐겨찾기 등록·목록·여부·해제, 중복 오류와 영화 기록 저장을 직접 호출하여 응답을 캡처했습니다. 토큰이 보이는 Curl 영역은 캡처에서 제외했습니다. [Swagger 전체 API 화면](docs/screenshots/01-swagger-overview.jpg)과 [요청 예시](docs/screenshots/07-swagger-request-example.jpg)를 남겼습니다.

## 트러블슈팅과 회고

Swagger 경로 파라미터에 `minimum`을 직접 지정하자 타입 오류가 발생했습니다. `ApiParam`의 `schema` 안에 정수 타입과 범위를 넣어 빌드를 통과시켰습니다. Postman 검증 스크립트에서는 `data`가 기존 식별자와 충돌하여 응답 변수명을 `responseData`로 변경했습니다.

이번 실습을 통해 트랜잭션과 UNIQUE 제약의 역할을 구분했습니다. 트랜잭션은 여러 저장의 부분 성공을 막고, UNIQUE는 동시에 들어온 요청의 중복 데이터를 막았습니다. 또한 성공 응답을 확인하는 것뿐 아니라, 중간에 실패한 뒤 DB에 무엇이 남았는지 확인해야 원자성을 검증할 수 있다는 점을 배웠습니다.

## 제출 자료와 핵심 코드

- [즐겨찾기 등록 성공](docs/screenshots/02-favorite-create.jpg), [중복 오류](docs/screenshots/03-favorite-duplicate.jpg)
- [목록](docs/screenshots/04-favorite-list.jpg), [여부](docs/screenshots/05-favorite-status.jpg), [해제](docs/screenshots/06-favorite-delete.jpg)
- [영화 기록 성공 응답](docs/screenshots/08-movie-record-success.jpg), [트랜잭션 코드](docs/screenshots/09-transaction-code.jpg)
- [Favorite 엔티티](src/entities/favorite.entity.ts), [즐겨찾기 Service](src/favorites/favorites.service.ts), [Controller](src/favorites/favorites.controller.ts)
- [영화 기록 트랜잭션](src/movie-records/movie-records.service.ts), [DB 중복 오류 처리](src/common/api-exception.filter.ts), [검증 코드](test/favorites.test.cjs)
