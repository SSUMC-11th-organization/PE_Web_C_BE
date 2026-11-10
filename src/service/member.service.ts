import { ConflictException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entity/member.entity.js';
import { CheckResponseDto } from '../dto/check-response.dto.js';
import { CreateMemberDto } from '../dto/create-member.dto.js';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async checkNickname(nickname: string): Promise<CheckResponseDto> {
    const exists = await this.memberRepository.exists({ where: { nickname } });
    return { available: !exists };
  }

  async checkEmail(email: string): Promise<CheckResponseDto> {
    const exists = await this.memberRepository.exists({ where: { email } });
    return { available: !exists };
  }

  async signUp(dto: CreateMemberDto) {
    if (await this.memberRepository.exists({ where: { email: dto.email } })) {
      throw new ConflictException({
        code: 'MEMBER4091',
        message: '이미 사용 중인 이메일입니다.',
      });
    }
    if (
      await this.memberRepository.exists({ where: { nickname: dto.nickname } })
    ) {
      throw new ConflictException({
        code: 'MEMBER4092',
        message: '이미 사용 중인 닉네임입니다.',
      });
    }

    const saved = await this.memberRepository.save(
      this.memberRepository.create({
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        nickname: dto.nickname,
      }),
    );

    // password는 응답에서 제외
    return {
      memberId: saved.memberId,
      email: saved.email,
      nickname: saved.nickname,
    };
  }
}
