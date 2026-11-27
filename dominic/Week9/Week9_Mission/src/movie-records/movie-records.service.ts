import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { apiError } from '../common/api-error';
import { Favorite } from '../entities/favorite.entity';
import { Member } from '../entities/member.entity';
import { Rating } from '../entities/rating.entity';
import { FavoriteResponseDto } from '../favorites/favorite.dto';
import { RatingResponseDto } from '../members/dto/member-response.dto';
import { CreateMovieRecordDto } from './create-movie-record.dto';

@Injectable()
export class MovieRecordsService {
  constructor(private readonly dataSource: DataSource) {}

  async create(memberId: string, dto: CreateMovieRecordDto) {
    // A movie record is one operation: either both inserts commit or neither remains.
    return this.dataSource.transaction(async manager => {
      const members = manager.getRepository(Member);
      const ratings = manager.getRepository(Rating);
      const favorites = manager.getRepository(Favorite);
      const member = await members.findOneBy({ memberId });
      if (!member) throw apiError.missingMember();
      const movieId = String(dto.movieId);
      const where = { member: { memberId }, movieId };
      if (await ratings.exists({ where })) throw apiError.duplicateRating();

      const rating = await ratings.save(ratings.create({ member, movieId, score: dto.score, comment: dto.comment ?? null }));
      let favorite: FavoriteResponseDto | null = null;
      if (dto.addToFavorites) {
        // This failure occurs after the rating INSERT, so the transaction must undo it.
        if (await favorites.exists({ where })) throw apiError.duplicateFavorite();
        const saved = await favorites.save(favorites.create({ member, movieId }));
        favorite = new FavoriteResponseDto(saved);
      }
      // Exceptions must leave this callback so TypeORM can roll back before the HTTP filter handles them.
      return { rating: new RatingResponseDto(rating), favorite };
    });
  }
}
