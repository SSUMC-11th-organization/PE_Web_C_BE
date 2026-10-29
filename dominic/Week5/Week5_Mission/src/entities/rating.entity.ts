import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
@Entity('rating')
@Unique('uk_rating_member_movie', ['member', 'movieId'])
export class Rating extends BaseEntity {
 @PrimaryGeneratedColumn({ name: 'rating_id', type: 'bigint' }) ratingId!: string;
 @ManyToOne(() => Member, member => member.ratings, { nullable: false })
 @JoinColumn({ name: 'member_id' }) member!: Member;
 @Column({ name: 'movie_id', type: 'bigint' }) movieId!: string;
 @Column({ type: 'tinyint' }) score!: number;
 @Column({ type: 'text', nullable: true }) comment!: string | null;
}
