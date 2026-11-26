// src/main/java/com/umc/movie/dto/MovieRecordResponse.java
package com.example.demo.dto;

public record MovieRecordResponse(
        RatingResponse rating,
        FavoriteResponse favorite
) {
}