import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isEmail } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { Member } from '../entities/member.entity';
import { Rating } from '../entities/rating.entity';
import { apiError } from '../common/api-error';
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
import { AvailabilityResponseDto, RatingResponseDto } from './dto/member-response.dto';

@Injectable()
export class MembersService {
 constructor(@InjectRepository(Member) private readonly members: Repository<Member>, @InjectRepository(Rating) private readonly ratings: Repository<Rating>) {}
 async nicknameAvailable(nickname: string) {
  if (nickname !== nickname.trim() || [...nickname].length < 2 || [...nickname].length > 12) throw apiError.validation('닉네임은 앞뒤 공백 없이 2~12자여야 합니다.');
  return new AvailabilityResponseDto(!(await this.members.exist({ where: { nickname } })));
 }
 async emailAvailable(email: string) {
  if (email.length > 254 || !isEmail(email)) throw apiError.validation('올바른 이메일 형식이어야 합니다.');
  return new AvailabilityResponseDto(!(await this.members.exist({ where: { email } })));
 }
 async register(dto: CreateMemberDto) {
  if (Buffer.byteLength(dto.password, 'utf8') > 72) throw apiError.validation('비밀번호는 UTF-8 기준 72바이트 이하여야 합니다.');
  if (await this.members.exist({ where: { email: dto.email } })) throw apiError.email();
  if (await this.members.exist({ where: { nickname: dto.nickname } })) throw apiError.nickname();
  const password = await bcrypt.hash(dto.password, 10);
  const member = await this.members.save(this.members.create({ email: dto.email, nickname: dto.nickname, password }));
  return { memberId: Number(member.memberId), email: member.email, nickname: member.nickname };
 }
 async ratingsFor(memberId: string, pageInput?: string, sizeInput?: string) {
  this.id(memberId);
  const paged = pageInput !== undefined || sizeInput !== undefined;
  const page = this.integer(pageInput ?? '0', 'page', 0, 1000000);
  const size = this.integer(sizeInput ?? '10', 'size', 1, 100);
  if (!(await this.members.exist({ where: { memberId } }))) throw apiError.missingMember();
  const [items, total] = await this.ratings.findAndCount({ where: { member: { memberId } }, order: { createdAt: 'DESC', ratingId: 'DESC' }, ...(paged ? { skip: page * size, take: size } : {}) });
  const content = items.map(rating => new RatingResponseDto(rating));
  return paged ? { content, page, size, totalElements: total, totalPages: Math.ceil(total / size) } : content;
 }
 async createRating(memberId: string, dto: CreateRatingDto) {
  this.id(memberId);
  const member = await this.members.findOneBy({ memberId });
  if (!member) throw apiError.missingMember();
  const movieId = String(dto.movieId);
  if (await this.ratings.exist({ where: { member: { memberId }, movieId } })) throw apiError.duplicateRating();
  const rating = await this.ratings.save(this.ratings.create({ member, movieId, score: dto.score, comment: dto.comment ?? null }));
  return Number(rating.ratingId);
 }
 async updateRating(memberId: string, ratingId: string, dto: UpdateRatingDto) {
  const rating = await this.findOwnedRating(memberId, ratingId);
  rating.score = dto.score;
  if (dto.comment !== undefined) rating.comment = dto.comment;
  await this.ratings.save(rating);
 }
 async deleteRating(memberId: string, ratingId: string) {
  const rating = await this.findOwnedRating(memberId, ratingId);
  await this.ratings.remove(rating);
 }
 private async findOwnedRating(memberId: string, ratingId: string) {
  this.id(memberId); this.id(ratingId);
  const rating = await this.ratings.findOne({ where: { ratingId }, relations: { member: true } });
  if (!rating) throw apiError.missingRating();
  if (rating.member.memberId !== memberId) throw apiError.forbidden();
  return rating;
 }
 private id(value: string) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw apiError.validation('ID는 양의 안전한 정수여야 합니다.');
 }
 private integer(value: string, name: string, min: number, max: number): number {
  if (!/^(0|[1-9]\d*)$/.test(value) || Number(value) < min || Number(value) > max) throw apiError.validation(`${name} 값이 올바르지 않습니다.`);
  return Number(value);
 }
}
