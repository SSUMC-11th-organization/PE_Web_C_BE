import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../guard/authenticated-request.js';
import { CreateRatingDto } from '../dto/create-rating.dto.js';
import { UpdateRatingDto } from '../dto/update-rating.dto.js';
import { AuthGuard } from '../guard/auth.guard.js';
import { RatingService } from '../service/rating.service.js';

// 클래스 레벨 경로를 비웠습니다. (/members/{memberId}/ratings 와 /ratings 가 함께 있으므로)
@ApiTags('ratings (평점 조회/등록/수정/삭제)')
@Controller()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // 5주차에 만든 유저별 평점 조회입니다. 공개 API라 AuthGuard를 붙이지 않습니다.
  @Get('members/:memberId/ratings')
  getMemberRatings(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.ratingService.getRatingsByMember(memberId);
  }

  // 경로에서 members/:memberId가 사라지고, memberId는 Guard가 담아 둔 값을 씁니다
  @Post('ratings')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() request: AuthenticatedRequest, @Body() dto: CreateRatingDto) {
    const memberId = request.memberId;
    const result = await this.ratingService.create(memberId, dto);
    return {
      isSuccess: true,
      code: 'COMMON201',
      message: '평점을 등록했습니다.',
      result,
    };
  }

  @Patch('ratings/:ratingId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    const memberId = request.memberId;
    const result = await this.ratingService.update(memberId, ratingId, dto);
    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점을 수정했습니다.',
      result,
    };
  }

  // 응답을 {isSuccess, code, message, result} 형식으로 감싸므로 204 대신 200을 씁니다
  @Delete('ratings/:ratingId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() request: AuthenticatedRequest,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    const memberId = request.memberId;
    await this.ratingService.delete(memberId, ratingId);
    return {
      isSuccess: true,
      code: 'COMMON200',
      message: '평점을 삭제했습니다.',
      result: null,
    };
  }
}
