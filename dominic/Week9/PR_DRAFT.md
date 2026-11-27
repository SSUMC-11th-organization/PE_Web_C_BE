# [Dominic] Chapter09_함께 테스트하고 다듬기

## 🔗 관련 이슈

- Closes #37
- [9주차 워크북](https://makeus-challenge.notion.site/9-2deb57f4596b83bcb2f681f4382bfd21)

<br/>

## 💡 함께 공유하고 싶은 부분

Swagger에서 평점 CRUD·회원 정보·즐겨찾기 등 15개 API에 설명, 인증 여부, 성공·실패 상태와 code 예제를 작성했습니다. `/swagger-ui`와 기존 `/docs`에서 확인할 수 있습니다.

가짜 Repository로 즐겨찾기·평점 서비스 단위 테스트 4개를 작성하고, sql.js 메모리 DB와 실제 JWT·HTTP 요청으로 통합 테스트 14개를 작성했습니다. 매 테스트마다 스키마를 초기화하며 개발 MySQL을 사용하지 않습니다.

선택 미션은 평점 INSERT 이후 즐겨찾기 중복으로 실패하도록 구성해 평점 0건·기존 즐겨찾기 1건을 검증했습니다. 임시 복사본에서 트랜잭션을 제거하면 HTTP 409가 유지되어도 평점이 1건 남아 테스트가 실패합니다. 중복 검사 제거 시 단위·통합 실패와 원복 후 전체 통과 결과도 기록했습니다.

- [프로젝트 README](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/blob/dominic/%2337/dominic/Week9/Week9_Mission/README.md)
- [미션 기록](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/blob/dominic/%2337/dominic/Week9/Week9_Mission/MISSION_RECORD.md)
- [키워드](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/blob/dominic/%2337/dominic/Week9/Week9_Mission/docs/KEYWORDS.md), [트러블슈팅](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/blob/dominic/%2337/dominic/Week9/Week9_Mission/docs/TROUBLESHOOTING.md)
- [캡처 10장](https://github.com/SSUMC-11th-organization/PE_Web_C_BE/blob/dominic/%2337/dominic/Week9/Week9_Mission/docs/SCREENSHOTS.md)

검증: 빌드·테스트 타입 검사 통과, 단위 4개·메모리 통합 14개·MySQL 회귀 24개 통과, Newman 19요청·47검증 통과. 제거 실험 3건에서 기대한 실패를 확인하고 복원 후 재통과했습니다.

<br/>

## 🤔 질문

DB UNIQUE와 중복 오류 변환이 HTTP 계약을 유지하는 경우, 서비스 사전 검사 제거를 단위 테스트에서 어디까지 제약하는 것이 적절할지 이야기해 보고 싶습니다. 메모리 DB 테스트와 실제 MySQL 회귀 테스트의 적정 범위도 함께 검토받고 싶습니다.

<br/>

## ✅ 워크북 체크리스트

- [x] 모든 핵심 키워드 정리를 마쳤나요?
- [ ] 핵심 키워드에 대해 완벽히 이해하셨나요?
- [x] 이론 학습 이후 직접 실습을 해보는 시간을 가졌나요?
- [x] 미션을 수행하셨나요?
- [x] 미션을 기록하셨나요?

<br/>

## ✅ 컨벤션 체크리스트

- [x] 디렉토리 구조 컨벤션을 잘 지켰나요? (`dominic/Week9/Week9_Mission`)
- [x] pr 제목을 컨벤션에 맞게 작성하였나요?
- [x] pr에 해당되는 이슈를 연결하였나요? (본문 `Closes #37`)
- [ ] 적절한 라벨을 설정하였나요? (이슈는 mission/workbook 적용, PR 생성 시 적용)
- [ ] 스터디원들에게 code review를 요청하기 위해 reviewer를 등록하였나요? (지정된 리뷰어 없음)
- [x] 닉네임/main 브랜치의 최신 상태를 반영하고 있는지 확인했나요? (`3706ad3` 기준)

<br/>

## 📌 주안점

- 트랜잭션을 제거했을 때 실패하는 DB 상태 검증과 실패 지점의 순서
- sql.js 자동 증가 PK/문자열 ID 변환이 테스트에만 적용되는지
- sql.js 중복 실패 실험은 UNIQUE 오류가 500으로 바뀐 결과이며, MySQL에서는 별도 오류 매핑이 409를 유지할 수 있다는 차이
- 기존 TypeORM 0.3.31 전이 의존성의 moderate audit 3건은 README의 한계에 기록했습니다. audit가 제안하는 TypeORM 1.x major 변경은 이번 미션에 포함하지 않았습니다.
