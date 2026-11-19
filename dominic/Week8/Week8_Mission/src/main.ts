import 'reflect-metadata';
import { static as serveStatic } from 'express';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { apiError } from './common/api-error';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 const config = app.get(ConfigService);
 app.use('/demo', serveStatic(join(process.cwd(), 'public')));
 app.useGlobalFilters(new ApiExceptionFilter());
 app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, exceptionFactory: errors => apiError.validation(Object.values(errors[0]?.constraints ?? {})[0] ?? '입력값이 올바르지 않습니다.') }));
 const origins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:5177,http://127.0.0.1:5177').split(',').map(s => s.trim()).filter(Boolean);
 app.enableCors({ origin: origins.includes('*') ? '*' : origins, methods: ['GET', 'POST', 'PATCH', 'DELETE'] });
 const swaggerConfig = new DocumentBuilder()
  .setTitle('UMC Week 8 즐겨찾기와 영화 기록 API')
  .setDescription('8주차 API는 Authorization: Bearer {token}이 필요합니다. POST /members, POST /auth/login, 닉네임·이메일 중복 확인, 회원 평점 조회는 공개 API입니다. Authorize에는 로그인 응답의 accessToken만 입력하세요. 회원 ID는 토큰 sub로 결정합니다.')
  .setVersion('1.0')
  .addBearerAuth()
  .addSecurityRequirements('bearer')
  .build();
 const document = SwaggerModule.createDocument(app, swaggerConfig);
 SwaggerModule.setup('docs', app, document, { swaggerOptions: { persistAuthorization: false, docExpansion: 'list' } });
 await app.listen(Number(config.get<string>('PORT') || 3007), config.get<string>('HOST') || '127.0.0.1');
}
void bootstrap();
