// src/main/java/com/umc/movie/dto/MemberResponse.java
package com.example.demo.dto;

public record MemberResponse(
        Long memberId,
        String email,
        String nickname
) {}