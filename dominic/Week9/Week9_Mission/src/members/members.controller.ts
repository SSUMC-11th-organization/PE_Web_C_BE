import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { apiError, ErrorBody, success } from '../common/api-error';
import { LoginMember, Public } from '../auth/auth.decorators';
import { ApiFailure, ApiProtectedErrors, ApiSuccess } from '../common/api-docs';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

const memberExample = { email: 'dominic@example.com', nickname: '도미닉', createdAt: '2026-11-27T03:00:00.000Z' };
const ratingExample = { ratingId: 1, movieId: 550, score: 5, comment: null, createdAt: memberExample.createdAt, updatedAt: memberExample.createdAt };

@ApiTags('회원 (공개 여부는 각 API 참고)')
@Controller('members')
export class MembersController {
  constructor(private readonly service: MembersService) {}
  @Public() @Get('nickname/:nickname')
  @ApiOperation({ summary: '닉네임 중복 확인 (공개)', description: '토큰 불필요. 앞뒤 공백 없는 2~12자 닉네임의 사용 가능 여부를 반환합니다.', security: [] })
  @ApiParam({ name: 'nickname', example: '도미닉' })
  @ApiSuccess(200, '닉네임 확인에 성공했습니다.', { available: true })
  @ApiFailure(400, [{ code: 'COMMON400', message: '닉네임은 앞뒤 공백 없이 2~12자여야 합니다.' }])
  async nickname(@Param('nickname') nickname: string) { return success('COMMON200', '닉네임 확인에 성공했습니다.', await this.service.nicknameAvailable(nickname)); }
  @Public() @Get('email/:email')
  @ApiOperation({ summary: '이메일 중복 확인 (공개)', description: '토큰 불필요. 올바른 이메일의 사용 가능 여부를 반환합니다.', security: [] })
  @ApiParam({ name: 'email', example: 'dominic@example.com' })
  @ApiSuccess(200, '이메일 확인에 성공했습니다.', { available: true })
  @ApiFailure(400, [{ code: 'COMMON400', message: '올바른 이메일 형식이어야 합니다.' }])
  async email(@Param('email') email: string) { return success('COMMON200', '이메일 확인에 성공했습니다.', await this.service.emailAvailable(email)); }
  @Public() @Post()
  @ApiOperation({ summary: '회원가입 (공개)', description: '토큰 불필요. 비밀번호는 bcrypt로 해시하며 이메일·닉네임 중복은 409입니다.', security: [] })
  @ApiSuccess(201, '회원가입에 성공했습니다.', { memberId: 1, email: memberExample.email, nickname: memberExample.nickname })
  @ApiFailure(400, [{ code: 'COMMON400', message: '입력값이 올바르지 않습니다.' }])
  @ApiFailure(409, [apiError.email().getResponse(), apiError.nickname().getResponse()] as ErrorBody[])
  async register(@Body() dto: CreateMemberDto) { return success('COMMON201', '회원가입에 성공했습니다.', await this.service.register(dto)); }
  @Get('me') @ApiBearerAuth() @ApiProtectedErrors()
  @ApiOperation({ summary: '내 정보 조회', description: '토큰 필요. JWT sub에 해당하는 회원의 공개 정보만 조회합니다.' })
  @ApiSuccess(200, '내 정보 조회에 성공했습니다.', memberExample)
  @ApiFailure(404, [apiError.missingMember().getResponse() as ErrorBody])
  async me(@LoginMember() memberId: string) { return success('COMMON200', '내 정보 조회에 성공했습니다.', await this.service.me(memberId)); }
  @Patch('me') @ApiBearerAuth() @ApiProtectedErrors()
  @ApiOperation({ summary: '내 정보 수정', description: '토큰 필요. 본인 닉네임만 수정하며 중복 닉네임은 409 / MEMBER409_1입니다.' })
  @ApiSuccess(200, '내 정보 수정에 성공했습니다.', memberExample)
  @ApiFailure(404, [apiError.missingMember().getResponse() as ErrorBody])
  @ApiFailure(409, [apiError.nickname().getResponse() as ErrorBody])
  async updateMe(@LoginMember() memberId: string, @Body() dto: UpdateMemberDto) { return success('COMMON200', '내 정보 수정에 성공했습니다.', await this.service.updateMe(memberId, dto.nickname)); }
  @Public() @Get(':memberId/ratings')
  @ApiOperation({ summary: '회원 평점 조회 (공개)', description: '토큰 불필요. 최신순입니다. 쿼리가 없으면 배열, page 또는 size를 지정하면 페이지 객체를 반환합니다.', security: [] })
  @ApiParam({ name: 'memberId', schema: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER }, example: 1 })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 0, maximum: 1000000, default: 0 } })
  @ApiQuery({ name: 'size', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } })
  @ApiSuccess(200, '평점 조회에 성공했습니다.', [ratingExample])
  @ApiFailure(400, [{ code: 'COMMON400', message: 'ID 또는 페이지 값이 올바르지 않습니다.' }])
  @ApiFailure(404, [apiError.missingMember().getResponse() as ErrorBody])
  async ratings(@Param('memberId') memberId: string, @Query('page') page?: string, @Query('size') size?: string) { return success('COMMON200', '평점 조회에 성공했습니다.', await this.service.ratingsFor(memberId, page, size)); }
}
