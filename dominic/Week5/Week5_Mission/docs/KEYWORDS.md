# 5주차 핵심 키워드

## 1. SOP와 CORS

**SOP(Same-Origin Policy)**는 브라우저가 서로 다른 출처의 문서·스크립트가 상호작용하거나 응답을 읽는 것을 제한하는 보안 정책이다. 출처는 **스킴(프로토콜), 호스트, 포트**로 결정된다. `http://localhost:5177`과 `http://localhost:3002`는 포트가 달라 서로 다른 출처다.

**CORS(Cross-Origin Resource Sharing)**는 서버가 HTTP 응답 헤더로 특정 출처에 응답을 읽을 수 있도록 허용하는 방식이다. 브라우저는 요청의 `Origin`과 응답의 `Access-Control-Allow-Origin` 등을 비교한다. 예를 들어 서버가 `Access-Control-Allow-Origin: http://localhost:5177`을 반환하면 해당 출처에서 응답을 사용할 수 있다.

단순 요청은 실제 요청이 서버에 도착한 뒤 브라우저가 응답 읽기를 차단할 수 있다. 반면 특정 메서드나 헤더를 사용하는 요청은 브라우저가 먼저 `OPTIONS` preflight를 보내며, 허용되지 않으면 실제 요청을 보내지 않는다. CORS는 브라우저의 응답 접근 정책이므로 서버 인증·인가나 CSRF 방어를 대체하지 않는다.

이번 실습에서는 5177 출처를 허용해 정상 응답을 확인했고, 허용 목록에 없는 5178에서 같은 API를 호출했을 때 브라우저가 응답을 사용할 수 없었다. Postman이나 네이티브 앱은 브라우저의 SOP를 적용받지 않는다.

참고: [MDN Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy), [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

## 2. Same-Origin과 Same-Site의 차이

- **Same-Origin:** 스킴·전체 호스트·포트가 모두 같아야 한다. 브라우저가 문서 간 접근과 응답 읽기 등을 제한할 때 사용하는 기준이다.
- **Same-Site:** 쿠키의 SameSite 판단처럼 사이트를 기준으로 하는 개념이다. 일반적인 도메인에서는 등록 가능 도메인과 스킴을 기준으로 하므로 서브도메인과 포트는 달라도 같은 사이트일 수 있다.

예를 들어 `https://app.example.com:443`과 `https://api.example.com:8443`은 호스트·포트가 달라 다른 출처지만 같은 사이트다. `http://app.example.com`과 `https://app.example.com`은 스킴이 달라 다른 출처이고, 현대적인 스킴 기준 SameSite 판단에서도 다른 사이트다. 사이트 판단에는 Public Suffix List 등 예외가 있으므로 단순히 도메인 문자열 끝부분만 비교하면 안 된다.

참고: [MDN Site](https://developer.mozilla.org/en-US/docs/Glossary/Site), [MDN 쿠키](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)

## 3. 쿠키의 SameSite 속성

`SameSite`는 교차 사이트 요청에 쿠키를 보낼 수 있는 조건을 제한한다.

- **Strict:** 같은 사이트에서 시작한 요청에만 쿠키를 보낸다. 외부 링크를 통해 최초 방문할 때도 쿠키가 빠질 수 있다.
- **Lax:** 같은 사이트 요청과 일부 교차 사이트 최상위 탐색의 안전한 메서드 요청에는 쿠키를 보낸다. 일반적인 교차 사이트 `fetch`나 POST에는 보내지 않는다. 속성을 생략할 때 브라우저는 보통 Lax로 취급하며, 일부 기본값 구현에는 예외가 있다.
- **None:** 교차 사이트 요청에도 쿠키를 허용한다. `Secure`가 반드시 필요하고, 브라우저의 서드파티 쿠키 제한은 별도로 적용될 수 있다.

SameSite는 CSRF 위험을 줄이는 데 도움이 되지만 모든 경우의 CSRF 방어를 대체하지 않는다. CORS 허용 여부와 쿠키 전송 여부는 별개이며, credential을 포함한 CORS 응답에서는 `Access-Control-Allow-Origin: *` 대신 명시적 출처가 필요하다. 이번 API는 쿠키 로그인을 구현하지 않았다.

참고: [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

## 4. 복합 UNIQUE 제약을 사용하는 이유

`UNIQUE (member_id, movie_id)`는 **두 값의 조합**이 중복되지 않도록 DB가 보장한다. 회원 1이 영화 550에 평점을 하나 남긴 뒤 같은 조합으로 다시 등록하면 거절되지만, 회원 2가 영화 550에 평점을 남기거나 회원 1이 영화 155에 평점을 남기는 것은 가능하다. 각 컬럼에 별도 UNIQUE를 걸면 이 정상 사례까지 막게 된다.

서비스에서 먼저 중복 여부를 검사해도 동시에 들어온 두 요청이 모두 검사를 통과할 수 있다. 따라서 DB 제약을 최종 보호 장치로 두고, 실제 생성 API에서는 제약 위반을 적절한 오류로 변환하는 것이 좋다. 이번 주에는 생성 API를 만들지 않았으며 평점·즐겨찾기 스키마에만 제약을 적용했다. 두 컬럼은 `NOT NULL`로 지정했다.

참고: [MySQL 다중 컬럼 인덱스](https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html), [MySQL SHOW COLUMNS와 복합 UNIQUE](https://dev.mysql.com/doc/refman/8.4/en/show-columns.html)

## 5. 외부 API Key는 프론트와 백엔드 중 어디에 두어야 할까?

비밀로 유지해야 하는 키는 서버 환경 변수나 비밀 관리 서비스에 두고, 서버가 외부 API를 호출하도록 설계한다. 브라우저에 전달되는 JavaScript·네트워크 요청과 Vite의 `VITE_` 환경 변수는 사용자가 확인할 수 있어 비밀 저장소가 아니다. 저장소에 키를 커밋하지 않고, 공급자가 제공하는 사용 범위 제한·사용량 제한·모니터링·키 교체를 함께 적용한다.

이번 워크북은 학습 목적으로 프론트에서 TMDB를 직접 호출한다. 현재 웹 구현의 토큰은 `VITE_` 변수이므로 브라우저에 노출된다는 한계가 있다. 실제 서비스에서는 공급자의 키 정책을 확인하고 비밀 키라면 서버 프록시 등으로 옮겨야 한다. 서버 프록시 자체도 남용되지 않도록 필요한 인증·인가와 요청 제한을 고려해야 한다.

참고: [Google Cloud API 키 관리 모범 사례](https://docs.cloud.google.com/docs/authentication/api-keys-best-practices), [Vite 환경 변수](https://vite.dev/guide/env-and-mode)
