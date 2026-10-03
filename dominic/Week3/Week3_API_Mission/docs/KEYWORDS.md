# 3주차 핵심 키워드

## 1. 3계층 외의 아키텍처

- **클린 아키텍처**: 핵심 비즈니스 로직을 DB·프레임워크와 분리한다. 변경과 테스트가 쉬워지지만 구조가 복잡해질 수 있다. [Microsoft 문서](https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/common-web-application-architectures)
- **마이크로서비스**: 기능별로 서비스를 나누어 독립적으로 배포한다. 개별 확장이 쉽지만 서비스 간 통신과 운영이 복잡하다. [Microsoft 문서](https://learn.microsoft.com/en-us/azure/architecture/microservices/)

## 2. 대표적인 웹 보안 공격

- **SQL Injection**: 입력값으로 SQL을 조작하는 공격. `?` 바인딩을 사용하는 Prepared Statement로 방어한다. [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- **XSS**: 악성 스크립트를 사용자 브라우저에서 실행시키는 공격. 출력 위치에 맞는 인코딩과 HTML 정제로 방어한다. [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet)
- **CSRF**: 로그인한 사용자가 원하지 않는 요청을 보내도록 유도하는 공격. CSRF 토큰 검증 등으로 방어한다. [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

## 3. 커넥션 풀(Connection Pool)

DB 연결을 모아 두고 요청마다 빌려 쓰고 반환하는 방식이다. 연결을 재사용해 접속 비용을 줄인다. 직접 빌린 연결은 사용 후 반환해야 한다. [mysql2 문서](https://sidorares.github.io/node-mysql2/docs#using-connection-pools)

## 4. Raw SQL vs ORM

| 구분 | 방식 | 장점 | 단점 |
| --- | --- | --- | --- |
| [Raw SQL](https://sidorares.github.io/node-mysql2/docs) | SQL을 직접 작성 | 복잡한 쿼리와 성능을 세밀하게 조절 | 반복 코드와 직접 관리할 부분이 많음 |
| [ORM](https://typeorm.io/docs/getting-started/) | 객체와 테이블을 연결해 데이터 처리 | 기본 CRUD 작성이 편리 | 생성되는 SQL과 성능을 확인해야 함 |

## 5. INSERT 외 핵심 SQL 문법

- **SELECT**: 데이터 조회
- **UPDATE**: 기존 데이터 수정
- **DELETE**: 데이터 삭제
- **WHERE**: 조건에 맞는 데이터 선택
- **JOIN**: 관련 테이블 연결
- **ORDER BY / LIMIT**: 결과 정렬 / 개수 제한
- **GROUP BY / HAVING**: 데이터를 묶어 집계 / 집계 결과에 조건 적용. [MySQL 문서](https://dev.mysql.com/doc/refman/8.4/en/sql-data-manipulation-statements.html), [SELECT 문법](https://dev.mysql.com/doc/refman/8.4/en/select.html)
