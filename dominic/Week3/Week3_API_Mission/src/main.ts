import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { envPort } from './common/input';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
  const config = app.get(ConfigService);
  const host = config.get<string>('HOST', '127.0.0.1');
  const port = envPort(config.get<string>('PORT', '3000'), 'PORT');
  await app.listen(port, host);
  Logger.log(`API 서버: http://${host}:${port}`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  const failure = error as { code?: string; message?: string };
  Logger.error(`시작 실패: ${failure.code ?? failure.message ?? 'UNKNOWN_ERROR'}`, 'Bootstrap');
  process.exitCode = 1;
});
