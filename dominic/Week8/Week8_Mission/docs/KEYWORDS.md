# 8주차 핵심 키워드

## 트랜잭션 Transaction

여러 DB 작업을 하나의 처리 단위로 묶습니다.<br>
이번에는 평점과 즐겨찾기 저장을 같은 `dataSource.transaction()` 안에서 실행했습니다. ([TypeORM](https://typeorm.io/docs/advanced-topics/transactions/))

## commit과 rollback

commit은 트랜잭션의 변경을 확정하고, rollback은 아직 확정하지 않은 변경을 취소합니다.<br>
두 번째 저장이 실패하면 앞서 저장한 평점도 취소됩니다. ([MySQL](https://dev.mysql.com/doc/refman/8.0/en/commit.html))

## 원자성 Atomicity

트랜잭션의 작업은 전부 성공하거나 전부 취소되어야 합니다.<br>
평점만 남고 즐겨찾기는 빠지는 부분 저장을 막는 성질입니다. ([MySQL](https://dev.mysql.com/doc/refman/8.0/en/mysql-acid.html))

## ACID

원자성은 전부 처리, 일관성은 규칙 유지, 격리성은 동시 작업 간 간섭 제어, 지속성은 확정된 데이터의 보존입니다.<br>
이번 실습에서는 저장 중 오류가 났을 때 원자성이 유지되는지 확인했습니다. ([MySQL](https://dev.mysql.com/doc/refman/8.0/en/mysql-acid.html))

## UNIQUE 제약 조건

지정한 열 또는 열 조합의 중복 값을 DB에서 거절합니다.<br>
`UNIQUE(member_id, movie_id)`로 같은 회원의 중복 즐겨찾기를 동시 요청에서도 막았습니다. ([MySQL](https://dev.mysql.com/doc/refman/8.0/en/constraint-primary-key.html))

## 낙관적 잠금 Optimistic Locking

버전이나 수정 시각을 비교해 다른 요청이 먼저 변경한 데이터를 감지하는 방식입니다.<br>
이번 중복 등록에는 낙관적 잠금 대신 복합 UNIQUE 제약을 적용했습니다. ([TypeORM](https://typeorm.io/docs/query-builder/select-query-builder/))
