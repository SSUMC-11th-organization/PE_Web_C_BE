import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';

@Entity('favorite')
@Unique('uk_favorite_member_movie', ['member', 'movieId'])
export class Favorite extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'favorite_id', type: 'bigint' }) favoriteId!: string;
  @ManyToOne(() => Member, member => member.favorites, { nullable: false })
  @JoinColumn({ name: 'member_id' }) member!: Member;
  @Column({ name: 'movie_id', type: 'bigint' }) movieId!: string;
}
