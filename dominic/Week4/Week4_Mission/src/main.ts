import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './common/database-exception.filter';
import { readPort } from './config/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new DatabaseExceptionFilter());
  app.enableShutdownHooks();

  const port = readPort(config.get<string>('PORT'), 3001, 'PORT');
  const host = config.get<string>('HOST') ?? '127.0.0.1';
  await app.listen(port, host);
  Logger.log(`Book API: http://${host}:${port}/books`, 'Bootstrap');
}

void bootstrap().catch((error: unknown) => {
  Logger.error(error instanceof Error ? error.message : '서버 시작 실패', 'Bootstrap');
  process.exitCode = 1;
});
