# [Dominic] Chapter08_서비스의 핵심 기능 만들기

## 🔗 관련 이슈

- Closes #33

## 💡 함께 공유하고 싶은 부분

JWT로 확인한 회원을 기준으로 즐겨찾기 등록·목록·여부·해제와 영화 기록 저장 API를 구현했습니다. `addToFavorites: true`인 영화 기록은 평점과 즐겨찾기를 같은 TypeORM 트랜잭션에서 저장하며, 어느 INSERT가 실패해도 부분 저장이 남지 않도록 했습니다.

- 트랜잭션 콜백의 `manager.getRepository()`만 사용하고 예외는 롤백 후 전역 필터에서 처리합니다.
- 사전 중복 검사와 복합 UNIQUE를 함께 적용하고, DB 중복 오류도 `FAVORITE409_1` 또는 `RATING409_1`로 변환합니다.
- 모든 즐겨찾기 조회·삭제 조건에 인증된 회원 ID를 포함합니다.
- 선택 미션으로 Swagger에 다섯 API의 요청 예시, 성공/실패 응답, Bearer 인증과 공개 API 구분을 작성했습니다.

검증: HTTP·MySQL 통합 테스트 24개, Newman 요청 19개·검사 47개가 통과했습니다. 두 번째 INSERT 실패 시 두 테이블 0건 유지, 동시 즐겨찾기 등록 8개 중 1개만 저장되는 것을 확인했습니다. 응답·Swagger·트랜잭션 캡처와 존댓말 미션 기록, 항목별 3줄 이내 핵심 키워드를 포함했습니다.

기존 주차 PR과 독립적으로 실행·리뷰할 수 있도록 7주차 기반 코드를 8주차 폴더에 포함했습니다.

- [미션 기록](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/blob/dominic/%2333/dominic/Week8/Week8_Mission/MISSION_RECORD.md)
- [검증 및 실행 방법](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/blob/dominic/%2333/dominic/Week8/Week8_Mission/README.md)
- [제출 캡처](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/blob/dominic/%2333/dominic/Week8/Week8_Mission/docs/SCREENSHOTS.md)
- 참고: [TypeORM 트랜잭션](https://typeorm.io/docs/advanced-topics/transactions/), [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)

## 🤔 질문

이미 즐겨찾기한 영화를 영화 기록으로 추가할 때 이번 워크북처럼 409로 거절하는 방식과 기존 즐겨찾기를 유지하며 평점만 추가하는 방식 중 어떤 정책이 사용자에게 더 자연스러울지 이야기하고 싶습니다.

## ✅ 워크북 체크리스트

- [x] 모든 핵심 키워드 정리를 마쳤나요?
- [ ] 핵심 키워드에 대해 완벽히 이해하셨나요?
- [x] 이론 학습 이후 직접 실습을 해보는 시간을 가졌나요?
- [x] 미션을 수행하셨나요?
- [x] 미션을 기록하셨나요?

## ✅ 컨벤션 체크리스트

- [x] 디렉토리 구조 컨벤션을 잘 지켰나요?
- [x] pr 제목을 컨벤션에 맞게 작성하였나요?
- [x] pr에 해당되는 이슈를 연결하였나요?
- [ ] 적절한 라벨을 설정하였나요?
- [ ] 스터디원들에게 code review를 요청하기 위해 reviewer를 등록하였나요?
- [x] 닉네임/main 브랜치의 최신 상태를 반영하고 있는지 확인했나요?

## 📌 주안점

`src/movie-records/movie-records.service.ts`의 트랜잭션 범위와 `test/favorites.test.cjs`의 실제 롤백 검증을 중심으로 확인해 주세요. 즐겨찾기 목록·삭제가 JWT 회원으로 제한되는지, 중복 사전 조회를 통과한 DB 오류도 409로 처리되는지도 리뷰 부탁드립니다.
