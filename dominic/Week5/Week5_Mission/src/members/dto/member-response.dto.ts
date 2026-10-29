import { Rating } from '../../entities/rating.entity';

export class AvailabilityResponseDto {
  constructor(readonly available: boolean) {}
}

export class RatingResponseDto {
  readonly ratingId: number;
  readonly movieId: number;
  readonly score: number;
  readonly comment: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(rating: Rating) {
    this.ratingId = Number(rating.ratingId);
    this.movieId = Number(rating.movieId);
    this.score = rating.score;
    this.comment = rating.comment;
    this.createdAt = rating.createdAt;
    this.updatedAt = rating.updatedAt;
  }
}
