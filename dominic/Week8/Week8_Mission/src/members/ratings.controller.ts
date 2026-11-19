import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { LoginMember } from '../auth/auth.decorators';
import { success } from '../common/api-error';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
import { MembersService } from './members.service';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly service: MembersService) {}
  @Post()
  async create(@LoginMember() memberId: string, @Body() dto: CreateRatingDto) {
    return success('COMMON201', '평점 등록에 성공했습니다.', { ratingId: await this.service.createRating(memberId, dto) });
  }
  @Patch(':ratingId')
  async update(@LoginMember() memberId: string, @Param('ratingId') ratingId: string, @Body() dto: UpdateRatingDto) {
    await this.service.updateRating(memberId, ratingId, dto);
    return success('COMMON200', '평점 수정에 성공했습니다.', null);
  }
  @Delete(':ratingId')
  async delete(@LoginMember() memberId: string, @Param('ratingId') ratingId: string) {
    await this.service.deleteRating(memberId, ratingId);
    return success('COMMON200', '평점 삭제에 성공했습니다.', null);
  }
}
