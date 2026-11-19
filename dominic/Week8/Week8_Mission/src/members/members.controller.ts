import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { success } from '../common/api-error';
import { LoginMember, Public } from '../auth/auth.decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('회원 (공개 여부는 각 API 참고)')
@Controller('members')
export class MembersController {
  constructor(private readonly service: MembersService) {}
  @Public() @Get('nickname/:nickname')
  @ApiOperation({ summary: '닉네임 중복 확인 (공개)', security: [] })
  async nickname(@Param('nickname') nickname: string) { return success('COMMON200', '닉네임 확인에 성공했습니다.', await this.service.nicknameAvailable(nickname)); }
  @Public() @Get('email/:email')
  @ApiOperation({ summary: '이메일 중복 확인 (공개)', security: [] })
  async email(@Param('email') email: string) { return success('COMMON200', '이메일 확인에 성공했습니다.', await this.service.emailAvailable(email)); }
  @Public() @Post()
  @ApiOperation({ summary: '회원가입 (공개)', security: [] })
  async register(@Body() dto: CreateMemberDto) { return success('COMMON201', '회원가입에 성공했습니다.', await this.service.register(dto)); }
  @Get('me')
  async me(@LoginMember() memberId: string) { return success('COMMON200', '내 정보 조회에 성공했습니다.', await this.service.me(memberId)); }
  @Patch('me')
  async updateMe(@LoginMember() memberId: string, @Body() dto: UpdateMemberDto) { return success('COMMON200', '내 정보 수정에 성공했습니다.', await this.service.updateMe(memberId, dto.nickname)); }
  @Public() @Get(':memberId/ratings')
  @ApiOperation({ summary: '회원 평점 조회 (공개)', security: [] })
  async ratings(@Param('memberId') memberId: string, @Query('page') page?: string, @Query('size') size?: string) { return success('COMMON200', '평점 조회에 성공했습니다.', await this.service.ratingsFor(memberId, page, size)); }
}
