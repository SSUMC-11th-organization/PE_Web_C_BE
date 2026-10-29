import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Rating } from './rating.entity';
@Entity('member')
export class Member extends BaseEntity {
 @PrimaryGeneratedColumn({ name: 'member_id', type: 'bigint' }) memberId!: string;
 @Column({ length: 254, unique: true }) email!: string;
 @Column({ length: 60, select: false }) password!: string;
 @Column({ length: 50, unique: true }) nickname!: string;
 @OneToMany(() => Rating, rating => rating.member) ratings!: Rating[];
}
