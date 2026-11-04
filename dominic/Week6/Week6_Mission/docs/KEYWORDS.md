# 6주차 핵심 키워드

## Bean Validation과 @Valid

Bean Validation은 Java 객체의 필드에 선언한 조건을 검사하는 표준입니다.<br>
`@Valid`는 요청 객체 등에 정의된 검증 규칙을 실행하도록 연결합니다. ([Jakarta Validation](https://jakarta.ee/specifications/bean-validation/))

## class-validator와 ValidationPipe

`class-validator`의 데코레이터로 DTO의 형식과 범위를 선언합니다.<br>
NestJS `ValidationPipe`는 요청을 DTO로 검증하고 잘못된 입력을 예외로 처리합니다. ([NestJS](https://docs.nestjs.com/techniques/validation))

## bcrypt와 salt round

bcrypt는 소금값(salt)을 사용해 비밀번호를 해시하며, 원문을 복원하는 암호화가 아닙니다.<br>
cost가 커질수록 계산량이 증가하며 이번 실습에서는 cost 10과 UTF-8 72바이트 제한을 사용했습니다. ([bcrypt.js](https://github.com/dcodeIO/bcrypt.js))

## HTTP 201 / 204 / 409

201은 자원 생성 성공, 204는 성공했지만 응답 본문이 없음을 뜻합니다.<br>
409는 현재 데이터 상태와 요청이 충돌할 때 사용합니다. ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status))

## UNIQUE 제약 조건과 동시성

두 요청이 동시에 사전 중복 확인을 통과해도 DB의 UNIQUE 제약이 중복 저장을 막습니다.<br>
제약 위반을 409로 변환하면 동시성 상황에서도 클라이언트가 일관된 오류를 받습니다. ([MySQL](https://dev.mysql.com/doc/refman/8.4/en/create-index.html))

## @RestControllerAdvice / Exception Filter

Spring의 `@RestControllerAdvice`와 NestJS의 Exception Filter는 예외 응답을 공통으로 처리합니다.<br>
이번에는 NestJS 전역 필터에서 입력 오류와 DB 중복 오류를 동일한 구조로 변환했습니다. ([NestJS](https://docs.nestjs.com/exception-filters))
