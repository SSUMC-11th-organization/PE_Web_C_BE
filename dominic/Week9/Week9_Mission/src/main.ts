import 'reflect-metadata';
import { static as serveStatic } from 'express';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { configureApp, createApiDocument } from './app.setup';
async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 const config = app.get(ConfigService);
 app.use('/demo', serveStatic(join(process.cwd(), 'public')));
 configureApp(app);
 const origins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:5177,http://127.0.0.1:5177').split(',').map(s => s.trim()).filter(Boolean);
 app.enableCors({ origin: origins.includes('*') ? '*' : origins, methods: ['GET', 'POST', 'PATCH', 'DELETE'] });
 const document = createApiDocument(app);
 for (const path of ['swagger-ui', 'docs']) {
  SwaggerModule.setup(path, app, document, { swaggerOptions: { persistAuthorization: false, docExpansion: 'list' } });
 }
 await app.listen(Number(config.get<string>('PORT') || 3009), config.get<string>('HOST') || '127.0.0.1');
}
void bootstrap();
