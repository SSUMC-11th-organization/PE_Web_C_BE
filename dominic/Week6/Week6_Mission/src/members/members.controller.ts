import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
import { success } from '../common/api-error';
@Controller('members')
export class MembersController {
 constructor(private readonly service: MembersService) {}
 @Get('nickname/:nickname') async nickname(@Param('nickname') nickname: string) { return success('COMMON200', '닉네임 확인에 성공했습니다.', await this.service.nicknameAvailable(nickname)); }
 @Get('email/:email') async email(@Param('email') email: string) { return success('COMMON200', '이메일 확인에 성공했습니다.', await this.service.emailAvailable(email)); }
 @Post() async register(@Body() dto: CreateMemberDto) { return success('COMMON201', '회원가입에 성공했습니다.', await this.service.register(dto)); }
 @Get(':memberId/ratings') async ratings(@Param('memberId') memberId: string, @Query('page') page?: string, @Query('size') size?: string) { return success('COMMON200', '평점 조회에 성공했습니다.', await this.service.ratingsFor(memberId, page, size)); }
 @Post(':memberId/ratings') async createRating(@Param('memberId') memberId: string, @Body() dto: CreateRatingDto) { return success('COMMON201', '평점 등록에 성공했습니다.', await this.service.createRating(memberId, dto)); }
 @Patch(':memberId/ratings/:ratingId') async updateRating(@Param('memberId') memberId: string, @Param('ratingId') ratingId: string, @Body() dto: UpdateRatingDto) { await this.service.updateRating(memberId, ratingId, dto); return success('COMMON200', '평점 수정에 성공했습니다.', null); }
 @Delete(':memberId/ratings/:ratingId') @HttpCode(204) async deleteRating(@Param('memberId') memberId: string, @Param('ratingId') ratingId: string) { await this.service.deleteRating(memberId, ratingId); }
}
