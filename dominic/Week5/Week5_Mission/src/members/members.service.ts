import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isEmail } from 'class-validator';
import { Member } from '../entities/member.entity';
import { Rating } from '../entities/rating.entity';
import { AvailabilityResponseDto, RatingResponseDto } from './dto/member-response.dto';

@Injectable()
export class MembersService {
 constructor(@InjectRepository(Member) private readonly members: Repository<Member>, @InjectRepository(Rating) private readonly ratings: Repository<Rating>) {}
 async nicknameAvailable(nickname: string) {
  if (nickname !== nickname.trim() || [...nickname].length < 2 || [...nickname].length > 12) throw new BadRequestException('닉네임은 앞뒤 공백 없이 2~12자여야 합니다.');
  return new AvailabilityResponseDto(!(await this.members.exist({ where: { nickname } })));
 }
 async emailAvailable(email: string) {
  if (email.length > 254 || !isEmail(email)) throw new BadRequestException('올바른 이메일 형식이어야 합니다.');
  return new AvailabilityResponseDto(!(await this.members.exist({ where: { email } })));
 }
 async ratingsFor(memberId: string, pageInput?: string, sizeInput?: string) {
  if (!/^[1-9]\d*$/.test(memberId) || !Number.isSafeInteger(Number(memberId))) throw new BadRequestException('회원 ID는 양의 정수여야 합니다.');
  const paged = pageInput !== undefined || sizeInput !== undefined;
  const page = this.integer(pageInput ?? '0', 'page', 0, 1000000);
  const size = this.integer(sizeInput ?? '10', 'size', 1, 100);
  if (!(await this.members.exist({ where: { memberId } }))) throw new NotFoundException('회원을 찾을 수 없습니다.');
  const [items, total] = await this.ratings.findAndCount({ where: { member: { memberId } }, order: { createdAt: 'DESC', ratingId: 'DESC' }, ...(paged ? { skip: page * size, take: size } : {}) });
  const content = items.map(rating => new RatingResponseDto(rating));
  return paged ? { content, page, size, totalElements: total, totalPages: Math.ceil(total / size) } : content;
 }
 private integer(value: string, name: string, min: number, max: number): number {
  if (!/^(0|[1-9]\d*)$/.test(value) || Number(value) < min || Number(value) > max) throw new BadRequestException(`${name} 값이 올바르지 않습니다.`);
  return Number(value);
 }
}
