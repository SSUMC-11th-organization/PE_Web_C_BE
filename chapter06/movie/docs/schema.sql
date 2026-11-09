-- 새 실습 DB를 준비할 때만 실행합니다. 기존 테이블과 데이터는 삭제하지 않습니다.
CREATE DATABASE IF NOT EXISTS umc_movie CHARACTER SET utf8mb4;
USE umc_movie;

CREATE TABLE IF NOT EXISTS member (
    member_id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(254) NOT NULL,
    password VARCHAR(60) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (member_id),
    CONSTRAINT uk_member_email UNIQUE (email),
    CONSTRAINT uk_member_nickname UNIQUE (nickname)
);

CREATE TABLE IF NOT EXISTS rating (
    rating_id BIGINT NOT NULL AUTO_INCREMENT,
    member_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    score TINYINT NOT NULL,
    comment TEXT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (rating_id),
    CONSTRAINT uk_rating_member_movie UNIQUE (member_id, movie_id),
    CONSTRAINT fk_rating_member FOREIGN KEY (member_id) REFERENCES member (member_id),
    CONSTRAINT ck_rating_score CHECK (score BETWEEN 1 AND 5)
);
