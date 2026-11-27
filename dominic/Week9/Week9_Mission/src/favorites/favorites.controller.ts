import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { LoginMember } from '../auth/auth.decorators';
import { apiError, ErrorBody, success } from '../common/api-error';
import { ApiFailure, ApiProtectedErrors, ApiSuccess, favoriteExample } from '../common/api-docs';
import { CreateFavoriteDto, MovieIdParamDto } from './favorite.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('즐겨찾기 (인증 필요)')
@ApiBearerAuth()
@ApiProtectedErrors()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: '내 즐겨찾기 등록', description: 'Authorization: Bearer {token}. 회원은 JWT sub로 식별합니다.' })
  @ApiSuccess(201, '즐겨찾기를 등록했습니다.', favoriteExample)
  @ApiFailure(409, [apiError.duplicateFavorite().getResponse() as ErrorBody])
  @ApiFailure(404, [apiError.missingMember().getResponse() as ErrorBody])
  async create(@LoginMember() memberId: string, @Body() dto: CreateFavoriteDto) {
    return success('COMMON201', '즐겨찾기를 등록했습니다.', await this.service.create(memberId, dto.movieId));
  }

  @Get()
  @ApiOperation({ summary: '내 즐겨찾기 목록', description: '토큰 필요. 내 목록을 조회합니다. 최신순입니다. 같은 시각에는 favoriteId 역순으로 정렬하며 빈 목록은 []입니다.' })
  @ApiSuccess(200, '즐겨찾기 목록을 조회했습니다.', [favoriteExample])
  async list(@LoginMember() memberId: string) {
    return success('COMMON200', '즐겨찾기 목록을 조회했습니다.', await this.service.list(memberId));
  }

  @Get(':movieId')
  @ApiParam({ name: 'movieId', schema: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER }, example: 550 })
  @ApiOperation({ summary: '내 즐겨찾기 여부', description: '토큰 필요. 등록하지 않은 영화도 200과 isFavorite: false를 응답합니다.' })
  @ApiSuccess(200, '즐겨찾기 여부를 조회했습니다.', { isFavorite: true })
  async status(@LoginMember() memberId: string, @Param() params: MovieIdParamDto) {
    return success('COMMON200', '즐겨찾기 여부를 조회했습니다.', await this.service.status(memberId, params.movieId));
  }

  @Delete(':movieId')
  @ApiParam({ name: 'movieId', schema: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER }, example: 550 })
  @ApiOperation({ summary: '내 즐겨찾기 해제', description: '토큰 필요. 본인 즐겨찾기만 삭제하며 성공 응답은 200, result: null입니다.' })
  @ApiSuccess(200, '즐겨찾기를 해제했습니다.', null)
  @ApiFailure(404, [apiError.missingFavorite().getResponse() as ErrorBody])
  async delete(@LoginMember() memberId: string, @Param() params: MovieIdParamDto) {
    await this.service.delete(memberId, params.movieId);
    return success('COMMON200', '즐겨찾기를 해제했습니다.', null);
  }
}
