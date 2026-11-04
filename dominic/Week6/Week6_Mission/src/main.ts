import 'reflect-metadata';
import { static as serveStatic } from 'express';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { apiError } from './common/api-error';
async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 const config = app.get(ConfigService);
 app.use('/demo', serveStatic(join(process.cwd(), 'public')));
 app.useGlobalFilters(new ApiExceptionFilter());
 app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, exceptionFactory: errors => apiError.validation(Object.values(errors[0]?.constraints ?? {})[0] ?? '입력값이 올바르지 않습니다.') }));
 const origins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:5177,http://127.0.0.1:5177').split(',').map(s => s.trim()).filter(Boolean);
 app.enableCors({ origin: origins.includes('*') ? '*' : origins, methods: ['GET', 'POST', 'PATCH', 'DELETE'] });
 await app.listen(Number(config.get<string>('PORT') || 3004), config.get<string>('HOST') || '127.0.0.1');
}
void bootstrap();
