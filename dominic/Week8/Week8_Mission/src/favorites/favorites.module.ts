import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from '../entities/favorite.entity';
import { Member } from '../entities/member.entity';
import { Rating } from '../entities/rating.entity';
import { MovieRecordsController } from '../movie-records/movie-records.controller';
import { MovieRecordsService } from '../movie-records/movie-records.service';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Member, Rating])],
  controllers: [FavoritesController, MovieRecordsController],
  providers: [FavoritesService, MovieRecordsService],
})
export class FavoritesModule {}
