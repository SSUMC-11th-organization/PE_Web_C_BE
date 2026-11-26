import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Member } from '../entities/member.entity';
import { apiError } from '../common/api-error';

@Injectable()
export class AuthService {
  private readonly dummyHash = bcrypt.hash('DummyComparison!0', 10);
  constructor(@InjectRepository(Member) private readonly members: Repository<Member>, private readonly jwt: JwtService) {}

  async login(email: string, password: string) {
    const member = await this.members.createQueryBuilder('member').addSelect('member.password')
      .where('member.email = :email', { email }).getOne();
    const validHash = member && /^\$2[aby]\$\d{2}\$.{53}$/.test(member.password);
    const hash = validHash ? member.password : await this.dummyHash;
    // 없는 이메일도 bcrypt 비교를 수행하고 동일한 오류로 응답합니다.
    const matches = await bcrypt.compare(password, hash);
    if (!member || !validHash || !matches || Buffer.byteLength(password, 'utf8') > 72) throw apiError.login();
    return { nickname: member.nickname, accessToken: await this.jwt.signAsync({ sub: String(member.memberId), email: member.email }) };
  }
}
