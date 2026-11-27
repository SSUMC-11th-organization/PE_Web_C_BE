# 9주차 제출 캡처

모든 이미지는 실행 중인 Swagger UI 또는 실제 실행 로그를 표시하는 로컬 증빙 페이지에서 캡처했습니다. 로그 화면의 FAIL은 임시 복사본에서 수행한 의도적인 제거 실험입니다. 제출하는 원본 코드는 정상이며 원복 후 전체 테스트를 통과했습니다.

| 번호 | 화면 | 확인 내용 |
|---|---|---|
| [01](screenshots/01-swagger-overview.jpg) | Swagger 전체 API 목록 | 공개 API와 보호 API 자물쇠 구분, 15개 API |
| [02](screenshots/02-favorite-documentation.jpg) | 즐겨찾기 등록 문서 펼침 | 요청·응답·401·409 예제 |
| [03](screenshots/03-favorite-201.jpg) | Authorize 후 실제 등록 응답 | Server response 201 / COMMON201 |
| [04](screenshots/04-favorite-409.jpg) | 같은 요청 재실행 | Server response 409 / FAVORITE409_1 |
| [05](screenshots/05-rating-documentation.jpg) | 평점 등록 문서 펼침 | 요청 DTO, 토큰 필요, 201·401·409 예제 |
| [06](screenshots/06-tests-passed.jpg) | 전체 기본 테스트 통과 | 단위 4개·메모리 DB 통합 14개 |
| [07](screenshots/07-duplicate-unit-failed.jpg) | 중복 검사 제거: 단위 실패 | 예외를 기대했으나 정상 저장 응답 반환 |
| [08](screenshots/08-duplicate-e2e-failed.jpg) | 중복 검사 제거: 통합 실패 | 409 예상, SQLite UNIQUE 오류로 500 반환 |
| [09](screenshots/09-transaction-removed-failed.jpg) | 트랜잭션 제거: 통합 실패 | 평점 Expected 0 / Received 1 |
| [10](screenshots/10-tests-restored.jpg) | 원복 후 재통과 | 통합 14개 통과 |

실패한 이유를 한 문장으로 정리하면, **중복 검사를 제거하자 서비스가 저장을 허용하고 API 응답 계약이 깨졌으며, 트랜잭션을 제거하자 실패한 요청의 평점이 남아 DB 상태 검증이 실패했습니다.**

캡처 03·04는 실제 브라우저 요청 결과이며 JWT가 보이는 Curl 영역은 제외했습니다. 테스트 캡처의 원본 텍스트는 [전체 결과](test-results.txt), [중복 단위 실패](mutation-favorite-unit.txt), [중복 통합 실패](mutation-favorite-e2e.txt), [트랜잭션 실패](mutation-transaction-e2e.txt), [원복 결과](mutation-restored-e2e.txt)에서 확인할 수 있습니다.
