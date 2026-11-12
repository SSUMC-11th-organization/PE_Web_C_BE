import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Not, Repository } from 'typeorm';
import { Member } from '../entity/member.entity.js';
import { CheckResponseDto } from '../dto/check-response.dto.js';
import { CreateMemberDto } from '../dto/create-member.dto.js';
import { MemberInfoResponseDto } from '../dto/member-info-response.dto.js';
import { MemberUpdateRequestDto } from '../dto/member-update-request.dto.js';
import { ApiException } from '../exception/api.exception.js';

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
      throw new ApiException(
        HttpStatus.CONFLICT,
        'MEMBER409_2',
        '이미 사용 중인 이메일입니다.',
      );
    }
    if (
      await this.memberRepository.exists({ where: { nickname: dto.nickname } })
    ) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'MEMBER409_1',
        '이미 사용 중인 닉네임입니다.',
      );
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

  async getMyInfo(memberId: number): Promise<MemberInfoResponseDto> {
    const member = await this.findMember(memberId);
    return MemberInfoResponseDto.from(member);
  }

  async updateMyInfo(
    memberId: number,
    dto: MemberUpdateRequestDto,
  ): Promise<MemberInfoResponseDto> {
    const member = await this.findMember(memberId);

    // 나를 제외한 다른 회원이 그 닉네임을 쓰고 있다면 막습니다.
    // (내 닉네임 그대로 보내는 경우는 중복이 아님)
    const duplicated = await this.memberRepository.exists({
      where: { nickname: dto.nickname, memberId: Not(memberId) },
    });
    if (duplicated) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'MEMBER409_1',
        '이미 사용 중인 닉네임입니다.',
      );
    }

    member.nickname = dto.nickname;
    await this.memberRepository.save(member);
    return MemberInfoResponseDto.from(member);
  }

  private async findMember(memberId: number): Promise<Member> {
    const member = await this.memberRepository.findOne({ where: { memberId } });
    if (!member) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'MEMBER404_1',
        '해당 회원을 찾을 수 없습니다.',
      );
    }
    return member;
  }
}
