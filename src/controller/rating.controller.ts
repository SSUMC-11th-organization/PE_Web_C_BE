import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RatingService } from '../service/rating.service.js';

@ApiTags('members (평점 조회)')
@Controller('members')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get(':memberId/ratings')
  getMemberRatings(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.ratingService.getRatingsByMember(memberId);
  }
}
