package com.umc.movie.service;

import com.umc.movie.auth.JwtProvider;
import com.umc.movie.dto.LoginRequest;
import com.umc.movie.dto.LoginResponse;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.ApiException;
import com.umc.movie.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public LoginResponse login(LoginRequest request) {
        Member member = memberRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED,
                        "AUTH401_1",
                        "이메일 또는 비밀번호가 올바르지 않습니다."
                ));

        if (!passwordEncoder.matches(
                request.password(), member.getPassword())) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "AUTH401_1",
                    "이메일 또는 비밀번호가 올바르지 않습니다."
            );
        }

        String accessToken = jwtProvider.createToken(member.getMemberId());

        return new LoginResponse(member.getNickname(), accessToken);
    }
}