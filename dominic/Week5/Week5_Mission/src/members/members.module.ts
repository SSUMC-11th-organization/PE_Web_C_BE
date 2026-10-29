import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../entities/member.entity';
import { Rating } from '../entities/rating.entity';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
@Module({ imports: [TypeOrmModule.forFeature([Member, Rating])], controllers: [MembersController], providers: [MembersService] })
export class MembersModule {}
