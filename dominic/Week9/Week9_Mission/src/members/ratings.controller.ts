import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { LoginMember } from '../auth/auth.decorators';
import { apiError, ErrorBody, success } from '../common/api-error';
import { ApiFailure, ApiProtectedErrors, ApiSuccess } from '../common/api-docs';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
import { MembersService } from './members.service';

@ApiTags('평점 (인증 필요)')
@ApiBearerAuth()
@ApiProtectedErrors()
@Controller('ratings')
export class RatingsController {
  constructor(private readonly service: MembersService) {}
  @Post()
  @ApiOperation({ summary: '내 평점 등록', description: '토큰 필요. 같은 회원·영화의 중복 등록은 409 / RATING409_1입니다.' })
  @ApiSuccess(201, '평점 등록에 성공했습니다.', { ratingId: 1 })
  @ApiFailure(404, [apiError.missingMember().getResponse() as ErrorBody])
  @ApiFailure(409, [apiError.duplicateRating().getResponse() as ErrorBody])
  async create(@LoginMember() memberId: string, @Body() dto: CreateRatingDto) {
    return success('COMMON201', '평점 등록에 성공했습니다.', { ratingId: await this.service.createRating(memberId, dto) });
  }
  @Patch(':ratingId')
  @ApiParam({ name: 'ratingId', schema: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER }, example: 1 })
  @ApiOperation({ summary: '내 평점 수정', description: '토큰 필요. 작성자만 수정할 수 있으며 다른 회원은 403 / RATING403_1입니다.' })
  @ApiSuccess(200, '평점 수정에 성공했습니다.', null)
  @ApiFailure(403, [apiError.forbidden().getResponse() as ErrorBody])
  @ApiFailure(404, [apiError.missingRating().getResponse() as ErrorBody])
  async update(@LoginMember() memberId: string, @Param('ratingId') ratingId: string, @Body() dto: UpdateRatingDto) {
    await this.service.updateRating(memberId, ratingId, dto);
    return success('COMMON200', '평점 수정에 성공했습니다.', null);
  }
  @Delete(':ratingId')
  @ApiParam({ name: 'ratingId', schema: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER }, example: 1 })
  @ApiOperation({ summary: '내 평점 삭제', description: '토큰 필요. 작성자만 삭제할 수 있으며 없는 평점은 404 / RATING404_1입니다.' })
  @ApiSuccess(200, '평점 삭제에 성공했습니다.', null)
  @ApiFailure(403, [apiError.forbidden().getResponse() as ErrorBody])
  @ApiFailure(404, [apiError.missingRating().getResponse() as ErrorBody])
  async delete(@LoginMember() memberId: string, @Param('ratingId') ratingId: string) {
    await this.service.deleteRating(memberId, ratingId);
    return success('COMMON200', '평점 삭제에 성공했습니다.', null);
  }
}
