# 워크북 요구사항과 검증 연결

원문: [9주차 - 함께 테스트하고 다듬기](https://makeus-challenge.notion.site/9-2deb57f4596b83bcb2f681f4382bfd21)

| 구분 | 요구사항 | 구현·증빙 |
|---|---|---|
| 실습 | Swagger UI와 공개/보호 API 표시 | src/app.setup.ts, /swagger-ui, 캡처 01 |
| 실습 | 회원가입·로그인·즐겨찾기 문서 | 각 Controller와 DTO, 캡처 02 |
| 실습 | Authorize 후 201·중복 409 실제 확인 | 캡처 03·04 |
| 실습 | 즐겨찾기 가짜 Repository 단위 2개 | src/favorites/favorites.service.spec.ts |
| 실습 | 메모리 DB 즐겨찾기 통합 4개 | test/mission.e2e-spec.ts의 첫 4개 |
| 실습 | 중복 검사 제거 시 실패 및 복원 | docs/mutation-favorite-unit.txt, mutation-favorite-e2e.txt, mutation-restored-*.txt |
| 필수 | 평점 CRUD·회원별 평점 조회·내 정보 조회/수정 문서 | src/members의 Controller·DTO, 캡처 05 |
| 필수 | 즐겨찾기 조회·여부·해제 설명과 토큰 표시 | src/favorites/favorites.controller.ts |
| 필수 | 중복 평점 409 / RATING409_1 단위 테스트 | src/members/members.service.spec.ts |
| 필수 | 다른 회원 수정 403 / RATING403_1 단위 테스트 | 동일 파일, save 미호출 및 기존 점수 검증 |
| 필수 | POST /ratings 무토큰 401, 정상 토큰 201 통합 테스트 | test/mission.e2e-spec.ts, code·저장 결과도 검증 |
| 선택 | 기존 즐겨찾기에 addToFavorites true 요청 시 409 | 충돌 롤백 통합 테스트 |
| 선택 | 실패 후 평점 개수 유지, 기존 즐겨찾기 보존 | 전체 count·회원/영화별 count·즐겨찾기 count 검증 |
| 선택 | 트랜잭션 제거 시 실패 화면 | 캡처 09, docs/mutation-transaction-e2e.txt의 Expected 0 / Received 1 |
| 제출 | 문서·전체 통과·실패 화면, 테스트 코드 | docs/SCREENSHOTS.md, 각 spec 파일과 실제 로그 |

단위 4개 + 메모리 DB 통합 14개 = 18개가 기본 학습 테스트입니다. 별도로 기존 MySQL 회귀 24개와 Newman 47개 검증을 통과했습니다. 중복 검사 제거 실험의 통합 실패는 SQLite UNIQUE 오류에 따른 HTTP code 변화이며, MySQL에서 중복 행이 생겼다는 증거가 아닙니다.
