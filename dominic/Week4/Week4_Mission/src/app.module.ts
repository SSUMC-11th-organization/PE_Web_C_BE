import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from './books/books.module';
import { readPort } from './config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST') ?? '127.0.0.1',
        port: readPort(config.get<string>('DB_PORT'), 3306, 'DB_PORT'),
        username: config.get<string>('DB_USER') ?? 'root',
        password: config.get<string>('DB_PASSWORD') ?? '',
        database: config.get<string>('DB_NAME') ?? 'umc_sql_week2',
        charset: 'utf8mb4',
        autoLoadEntities: true,
        // 2·3주차의 기존 테이블과 데이터를 그대로 사용한다.
        synchronize: false,
        migrationsRun: false,
        supportBigNumbers: true,
        bigNumberStrings: true,
        relationLoadStrategy: 'join' as const,
        logging: false,
        retryAttempts: 3,
        retryDelay: 1000,
      }),
    }),
    BooksModule,
  ],
})
export class AppModule {}
