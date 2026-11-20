// src/main/java/com/umc/movie/dto/FavoriteResponse.java
package com.example.demo.dto;

import com.example.demo.entity.Favorite;

import java.time.LocalDateTime;

public record FavoriteResponse(
        Long favoriteId,
        Long movieId,
        LocalDateTime createdAt
) {
    public static FavoriteResponse from(Favorite favorite) {
        return new FavoriteResponse(
                favorite.getFavoriteId(),
                favorite.getMovieId(),
                favorite.getCreatedAt()
        );
    }
}