package com.umc.movie.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import com.umc.movie.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtProvider jwtProvider;
    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) {

        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String header = request.getHeader("Authorization");

        if (header == null || header.isBlank()) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "AUTH401_2",
                    "로그인이 필요한 요청입니다."
            );
        }

        String[] parts = header.trim().split("\\s+");

        if (parts.length != 2 || !"Bearer".equalsIgnoreCase(parts[0])) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "AUTH401_3",
                    "유효하지 않은 토큰입니다."
            );
        }

        Long memberId = jwtProvider.getMemberId(parts[1]);
        request.setAttribute("memberId", memberId);

        return true;
    }
}