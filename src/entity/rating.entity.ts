import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseTimeEntity } from './base-time.entity.js';
import { Member } from './member.entity.js';

@Entity('rating')
@Unique('uk_rating_member_movie', ['member', 'movieId'])
export class Rating extends BaseTimeEntity {
  @PrimaryGeneratedColumn({ name: 'rating_id' })
  ratingId: number;

  @ManyToOne(() => Member, { nullable: false })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  // TMDB 영화 ID를 그대로 담는 일반 컬럼입니다. (외래키 아님)
  @Column({ name: 'movie_id', type: 'bigint' })
  movieId: number;

  @Column({ type: 'tinyint' })
  score: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;
}
