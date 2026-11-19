import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { Favorite } from '../entities/favorite.entity';

export class CreateFavoriteDto {
  @ApiProperty({ example: 550, minimum: 1, maximum: Number.MAX_SAFE_INTEGER, description: 'TMDB 영화 ID' })
  @IsInt() @Min(1) @Max(Number.MAX_SAFE_INTEGER)
  movieId!: number;
}

export class MovieIdParamDto {
  @Type(() => Number)
  @IsInt() @Min(1) @Max(Number.MAX_SAFE_INTEGER)
  movieId!: number;
}

export class FavoriteResponseDto {
  readonly favoriteId: number;
  readonly movieId: number;
  readonly createdAt: Date;

  constructor(favorite: Favorite) {
    this.favoriteId = Number(favorite.favoriteId);
    this.movieId = Number(favorite.movieId);
    this.createdAt = favorite.createdAt;
  }
}
