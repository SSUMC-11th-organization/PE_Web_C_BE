# 4주차 핵심 키워드 정리

## 1. JPA / Hibernate와 TypeORM

- **ORM**은 객체의 필드·관계를 DB의 컬럼·관계에 매핑하고, 조회와 저장에 필요한 SQL을 만들어 주는 기술이다.
- **JPA(Jakarta Persistence)**는 Java에서 ORM을 사용하는 표준 API와 동작 규칙이다. **Hibernate**는 이 표준을 구현하는 ORM이며 자체 기능도 제공한다. [Hibernate 공식 소개](https://hibernate.org/orm/#jakarta-persistence-jpa-compatibility)
- **TypeORM**은 TypeScript·JavaScript에서 사용하는 ORM 라이브러리다. Entity와 Repository로 DB 작업을 표현하며, Data Mapper와 Active Record 방식을 지원한다. [TypeORM 공식 소개](https://typeorm.io/)
- **나의 이해:** ORM은 공통 개념이고, JPA는 표준, Hibernate와 TypeORM은 실제 DB 작업을 수행하는 도구로 구분할 수 있다.

## 2. Entity Lifecycle과 Persistence Context

- JPA의 엔티티 상태는 **비영속(new), 영속(managed), 준영속(detached), 삭제(removed)**로 구분한다. 영속성 컨텍스트는 관리 중인 엔티티와 변경 상태를 보관한다.
- Hibernate는 변경을 메모리에 모았다가 **flush**할 때 SQL로 반영할 수 있다. 따라서 `persist()` 호출과 SQL 실행 시점이 항상 같지는 않으며, flush는 트랜잭션 커밋이나 필요한 조회 전에 일어날 수 있다.
- 다만 `IDENTITY`처럼 DB가 ID를 생성하는 전략에서는 ID를 얻기 위해 INSERT가 먼저 실행될 수 있다. **flush는 DB에 SQL을 보내는 과정이고, commit은 트랜잭션을 확정하는 과정이다.** [Hibernate 영속성 컨텍스트·Flush 문서](https://docs.hibernate.org/orm/current/userguide/html_single/#flushing)
- TypeORM의 `repository.create()`는 객체만 만들고, `await repository.save()`는 저장 작업을 수행한다. 조회한 객체의 필드만 바꾸고 트랜잭션을 커밋한다고 JPA처럼 자동 저장되는 것으로 가정하면 안 된다. [TypeORM Repository API](https://typeorm.io/docs/working-with-entity-manager/repository-api/)
- **나의 이해:** 객체 생성, SQL 실행, 트랜잭션 확정의 시점을 구분하고, 사용하는 ORM의 저장 방식을 확인해야 한다.

## 3. DTO와 API Contract

- **DTO(Data Transfer Object)**는 요청·응답으로 주고받는 데이터의 모양을 정의한다. **API Contract**는 필드 이름과 타입, 필수 여부, HTTP 상태 코드 등 서버와 클라이언트의 약속이다. [NestJS DTO 설명](https://docs.nestjs.com/controllers#request-payloads)
- Entity는 DB 구조를 표현한다. Entity 전체를 응답하면 내부 필드나 관계가 노출되고, DB 구조 변경이 응답 형식 변경으로 이어질 수 있다. [NestJS 응답 직렬화 문서](https://docs.nestjs.com/application/serialization)
- 도서 응답은 `bookId`, `title`, `description`, `categoryName`, `isAvailable`만 DTO에 담아 반환한다. `Category` 객체 전체를 반환할 필요는 없다.
- **나의 이해:** Entity는 저장 구조, DTO는 통신 구조로 나누면 DB와 API를 각각 관리하기 쉬워진다.

## 4. Validation을 Controller 경계에서 수행하는 이유

- 외부 요청은 타입·필수값·길이가 잘못될 수 있으므로, Service의 업무 처리 전에 형식을 검증한다. NestJS에서는 **DTO의 검증 데코레이터와 `ValidationPipe`**를 함께 사용한다.
- `categoryId`의 정수·양수 여부, `title`의 빈 값·100자 제한 등을 검사한다. 검증 실패는 `400 Bad Request`로 응답한다.
- `transform`은 요청을 DTO 인스턴스로 변환하고, `whitelist`는 선언한 속성만 허용한다. `forbidNonWhitelisted`를 함께 쓰면 알 수 없는 속성을 오류로 처리한다. TypeScript 타입 선언만으로는 런타임 검증이 되지 않는다. [NestJS Validation 문서](https://docs.nestjs.com/application/validation)
- 카테고리가 실제 DB에 존재하는지는 **Service의 업무 검증**으로 확인한다. 존재하지 않으면 이번 API에서는 `404 Not Found`로 처리한다.
- **나의 이해:** 요청의 모양은 API 경계에서 확인하고, DB 상태와 관련된 조건은 Service에서 확인하면 책임이 분명해진다.

## 5. N+1 Query

- 목록을 한 번 조회한 뒤 각 항목의 관계를 별도로 조회하면, 목록 조회 **1회 + 관계 조회 N회**가 발생할 수 있다. 이를 N+1 문제라고 한다.
- 예를 들어 도서 N권을 조회하고 반복문에서 카테고리를 한 권씩 조회하면 DB 왕복 횟수가 늘어난다. 캐시·중복 관계에 따라 실제 쿼리 수는 달라질 수 있다.
- 필요한 관계를 JOIN으로 함께 조회하면 반복 조회를 줄일 수 있다. TypeORM에서는 `relations: { category: true }`와 `relationLoadStrategy: 'join'` 또는 `leftJoinAndSelect()`를 사용할 수 있다. [TypeORM N+1 설명](https://typeorm.io/docs/performance-optimization/efficient-use-of-query-builder/), [Find Options](https://typeorm.io/docs/working-with-entity-manager/find-options/)
- **나의 이해:** 관계를 선언하는 것만으로 성능이 보장되지는 않으므로, 목록 API에서는 필요한 관계를 함께 가져오고 실제 SQL을 확인해야 한다.

## 6. Migration과 synchronize

- **`synchronize: true`**는 실행 시 Entity 정의에 맞춰 DB 스키마를 자동으로 변경한다. 기존 데이터가 있는 운영 DB에서는 예상하지 못한 컬럼 변경이나 데이터 손실이 발생할 수 있다. [TypeORM Data Source Options](https://typeorm.io/docs/data-source/data-source-options/)
- **Migration**은 스키마 변경을 파일과 실행 이력으로 관리하는 방법이다. 적용할 SQL을 검토하고 환경별로 같은 변경을 순서대로 실행할 수 있다. 되돌리기 코드가 있어도 삭제된 데이터가 자동 복구되는 것은 아니다. [TypeORM Migration 문서](https://typeorm.io/docs/migrations/why/)
- 이번 과제는 기존 `book`, `category` 테이블을 사용하므로 **`synchronize: false`**로 설정하고 테이블명·컬럼명·타입을 명시적으로 매핑한다. 이 설정이 Entity와 실제 DB 구조의 일치까지 자동 검증해 주는 것은 아니다.
- **나의 이해:** 스키마 변경도 코드 변경처럼 검토와 이력을 남기고, 실제 데이터에 미치는 영향을 확인해야 한다.
