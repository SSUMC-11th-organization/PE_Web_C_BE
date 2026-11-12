package com.umc.movie.auth;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.Jwts;
import java.time.Instant;
import java.util.Date;
import com.umc.movie.exception.ApiException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
@Component
public class JwtProvider {

    private final SecretKey key;
    private final long accessExpiration;

    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration}") long accessExpiration) {

        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
        this.accessExpiration = accessExpiration;
    }
    public String createToken(Long memberId) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(memberId.toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessExpiration)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }
    public Long getMemberId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Long memberId = Long.valueOf(claims.getSubject());

            if (memberId <= 0 || claims.getExpiration() == null) {
                throw new IllegalArgumentException();
            }

            return memberId;

        } catch (ExpiredJwtException exception) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "AUTH401_4",
                    "토큰이 만료되었습니다. 다시 로그인해주세요."
            );

        } catch (JwtException | IllegalArgumentException exception) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "AUTH401_3",
                    "유효하지 않은 토큰입니다."
            );
        }
    }
}