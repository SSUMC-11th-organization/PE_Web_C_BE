# 5주차 미션 기록 — 화면과 API 연결

## 구현 과정

1. 워크북의 요구사항을 바탕으로 회원·평점·즐겨찾기 테이블을 별도 MySQL DB에 만들었다. `member`와 `rating`에만 테스트 데이터를 넣었다. `movie_id`는 TMDB 식별자를 저장하는 일반 컬럼이고, 평점과 즐겨찾기에는 각각 `(member_id, movie_id)` 복합 UNIQUE를 두었다.
2. NestJS 프로젝트를 새로 만들고 `Member`, `Rating` 엔티티와 공통 생성·수정 시각 클래스를 작성했다. Favorite은 8주차용 테이블만 만들었다. 비밀번호는 조회 엔티티에서 기본 선택하지 않는다.
3. Repository를 주입하는 Service와 Controller를 구성하고, 응답 DTO에 필요한 필드만 담았다. 닉네임·이메일의 존재 여부와 회원별 평점 조회 API를 구현했다.
4. 기존 UMCine 영화 화면에 회원 API 영역을 추가하고 세 요청을 실제 `fetch`로 연결했다. 요청 결과와 오류를 각 입력 영역에 표시한다.
5. 선택 미션으로 닉네임 2~12자·이메일 형식 검증, 평점 페이지네이션, 제한된 CORS 출처를 구현했다.

핵심 코드: [Entity](src/entities/member.entity.ts), [Rating Entity](src/entities/rating.entity.ts), [DTO](src/members/dto/member-response.dto.ts), [Controller](src/members/members.controller.ts), [Service](src/members/members.service.ts), [CORS 설정](src/main.ts). 웹 화면 코드는 별도의 프론트엔드 작업 폴더에 있다.

## 실제 검증 결과

- Postman에서 닉네임 `수현`과 이메일 `noco@umc.com`은 각각 200과 `available: false`를 반환했다. 회원 1의 페이지 0, 크기 1 조회는 200과 `totalElements: 2`, `totalPages: 2`를 반환했다.
- [Postman 닉네임 캡처](docs/postman-nickname.png), [이메일 캡처](docs/postman-email.png), [평점 캡처](docs/postman-ratings.png)
- 실제 UMCine 웹 화면에서 세 API를 모두 호출하여 응답을 확인했다. [웹 화면 캡처](docs/browser-api-success.jpg)
- 자동 API 테스트에서 사용 가능/중복, 닉네임 길이와 이메일 형식 오류, 404, 페이지 분리, 잘못된 페이지 입력 및 CORS 허용 여부를 확인했다. 테스트 3개 모두 통과했다.
- 프론트엔드 기존 테스트 141개, ESLint, 타입 검사와 빌드가 통과했다. Vite 라우터 생성 시 기존 순환 의존성 경고가 출력되지만 빌드는 성공했다.

## CORS 선택 미션

기본 서버는 `http://localhost:5177`과 `http://127.0.0.1:5177`만 허용하도록 설정했다. 동일한 웹 코드를 `http://127.0.0.1:5178`에서 열어 제한된 서버(3002)를 호출하자 브라우저에서 응답을 읽지 못하고 연결 오류가 표시됐다. 반면 별도로 `CORS_ORIGINS=*`로 실행한 서버(3003)를 `http://127.0.0.1:5179`에서 호출했을 때 정상 응답을 읽었다. 전체 허용은 다른 웹 출처에서도 응답을 읽을 수 있게 하므로 필요한 출처만 지정하면 브라우저가 읽을 수 있는 범위를 줄일 수 있다. CORS는 인증을 대신하지 않으며, 일반적인 단순 요청은 서버에 도착해도 브라우저에서 응답 접근을 차단할 수 있다. 쿠키 등의 credential을 포함하는 요청에는 와일드카드 허용을 사용할 수 없다.

- [제한된 출처의 차단 화면](docs/cors-restricted-denied.jpg)
- [와일드카드 허용 화면](docs/cors-wildcard-allowed.jpg)
- [허용된 5177 출처의 세 API 성공 화면](docs/browser-api-success.jpg)

## 트러블슈팅

- **로컬 MySQL 접속 차단:** 실행 환경의 네트워크 제한으로 127.0.0.1:3306 접근이 거부되었다. 로컬 DB 초기화와 서버 실행에 필요한 권한을 받아 별도 DB에 연결했다.
- **프론트엔드 검사 오류:** 폼의 버튼에 명시적인 타입이 없어 접근성 규칙이 실패했다. 세 버튼에 `type="submit"`을 추가한 뒤 검사를 다시 통과했다.

## 제출 안내

캡처 파일과 이 기록을 개인 미션 Notion 페이지에 첨부하고 페이지 URL을 워크북의 피드백 시스템에 제출하면 된다. 아직 Notion 작성 및 제출은 하지 않았다.
