import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { success } from '../common/api-error';
import { Public } from './auth.decorators';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiFailure, ApiSuccess } from '../common/api-docs';
@ApiTags('공개 인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public() @Post('login') @HttpCode(200)
  @ApiOperation({ summary: '로그인 (공개)', description: '토큰 불필요. 이메일과 비밀번호를 검증하고 JWT accessToken을 발급합니다.', security: [] })
  @ApiSuccess(200, '로그인에 성공했습니다.', { nickname: 'dominic', accessToken: '{JWT}' })
  @ApiFailure(401, [{ code: 'AUTH401_1', message: '이메일 또는 비밀번호가 올바르지 않습니다.' }])
  @ApiFailure(400, [{ code: 'COMMON400', message: '입력값이 올바르지 않습니다.' }])
  async login(@Body() dto: LoginDto) {
    return success('COMMON200', '로그인에 성공했습니다.', await this.auth.login(dto.email, dto.password));
  }
}
