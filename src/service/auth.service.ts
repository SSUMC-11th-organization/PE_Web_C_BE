import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Member } from '../entity/member.entity.js';
import { LoginRequestDto } from '../dto/login-request.dto.js';
import { LoginResponseDto } from '../dto/login-response.dto.js';
import { ApiException } from '../exception/api.exception.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    // "이메일 없음"과 "비밀번호 틀림"을 구분하면 가입 여부가 노출되므로
    // 두 경우 모두 똑같은 예외(AUTH401_1)를 던집니다.
    const member = await this.memberRepository.findOne({
      where: { email: dto.email },
    });
    if (!member) {
      throw this.invalidCredentials();
    }

    // compare()가 저장된 해시에서 salt를 꺼내 같은 방식으로 해시한 뒤 대조합니다.
    const matched = await bcrypt.compare(dto.password, member.password);
    if (!matched) {
      throw this.invalidCredentials();
    }

    // sub는 JWT 표준에서 "이 토큰의 주인"을 뜻하는 항목입니다.
    const accessToken = await this.jwtService.signAsync({
      sub: String(member.memberId),
      email: member.email,
    });

    return { nickname: member.nickname, accessToken };
  }

  private invalidCredentials() {
    return new ApiException(
      HttpStatus.UNAUTHORIZED,
      'AUTH401_1',
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    );
  }
}
