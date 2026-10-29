import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from './members/members.module';
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ type: 'mysql' as const, host: c.get<string>('DB_HOST') || '127.0.0.1', port: Number(c.get<string>('DB_PORT') || 3306), username: c.get<string>('DB_USER') || 'root', password: c.get<string>('DB_PASSWORD') || '', database: c.get<string>('DB_NAME') || 'umc_movie_week5', charset: 'utf8mb4', autoLoadEntities: true, synchronize: false, supportBigNumbers: true, bigNumberStrings: true, retryAttempts: 2 }) }), MembersModule] })
export class AppModule {}
