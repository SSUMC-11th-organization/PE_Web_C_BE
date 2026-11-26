import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginMember } from '../auth/auth.decorators';
import { apiError, ErrorBody, success } from '../common/api-error';
import { ApiFailure, ApiProtectedErrors, ApiSuccess, favoriteExample } from '../common/api-docs';
import { CreateMovieRecordDto } from './create-movie-record.dto';
import { MovieRecordsService } from './movie-records.service';

@ApiTags('9주차 영화 기록')
@ApiBearerAuth()
@ApiProtectedErrors()
@Controller('movie-records')
export class MovieRecordsController {
  constructor(private readonly service: MovieRecordsService) {}

  @Post()
  @ApiOperation({ summary: '평점과 즐겨찾기를 한 번에 저장', description: 'JWT 회원만 저장합니다. addToFavorites=true이면 두 INSERT를 같은 트랜잭션으로 처리합니다. 기존 평점 또는 추가하려는 즐겨찾기가 있으면 409입니다. false이면 favorite는 null입니다.' })
  @ApiSuccess(201, '영화 기록을 저장했습니다.', { rating: { ratingId: 1, movieId: 238, score: 5, comment: '다시 보고 싶은 영화입니다.', createdAt: favoriteExample.createdAt, updatedAt: favoriteExample.createdAt }, favorite: { ...favoriteExample, movieId: 238 } })
  @ApiFailure(409, [apiError.duplicateRating().getResponse() as ErrorBody, apiError.duplicateFavorite().getResponse() as ErrorBody])
  @ApiFailure(404, [apiError.missingMember().getResponse() as ErrorBody])
  async create(@LoginMember() memberId: string, @Body() dto: CreateMovieRecordDto) {
    return success('COMMON201', '영화 기록을 저장했습니다.', await this.service.create(memberId, dto));
  }
}
