import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { apiError } from '../common/api-error';
import { Favorite } from '../entities/favorite.entity';
import { Member } from '../entities/member.entity';
import { FavoriteResponseDto } from './favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite) private readonly favorites: Repository<Favorite>,
    @InjectRepository(Member) private readonly members: Repository<Member>,
  ) {}

  async create(memberId: string, movieId: number) {
    const member = await this.members.findOneBy({ memberId });
    if (!member) throw apiError.missingMember();
    const where = { member: { memberId }, movieId: String(movieId) };
    if (await this.favorites.exists({ where })) throw apiError.duplicateFavorite();
    // Concurrent requests are also protected by uk_favorite_member_movie.
    const favorite = await this.favorites.save(this.favorites.create({ member, movieId: String(movieId) }));
    return new FavoriteResponseDto(favorite);
  }

  async list(memberId: string) {
    const items = await this.favorites.find({
      where: { member: { memberId } },
      order: { createdAt: 'DESC', favoriteId: 'DESC' },
    });
    return items.map(item => new FavoriteResponseDto(item));
  }

  async status(memberId: string, movieId: number) {
    return { isFavorite: await this.favorites.exists({ where: { member: { memberId }, movieId: String(movieId) } }) };
  }

  async delete(memberId: string, movieId: number) {
    const result = await this.favorites.delete({ member: { memberId }, movieId: String(movieId) });
    if (!result.affected) throw apiError.missingFavorite();
  }
}
