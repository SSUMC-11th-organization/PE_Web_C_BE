// src/main/java/com/umc/movie/dto/LoginResponse.java
package com.example.demo.dto;

public record LoginResponse(
        String nickname,
        String accessToken
) {
}