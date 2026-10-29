import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 const config = app.get(ConfigService);
 const origins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:5177,http://127.0.0.1:5177').split(',').map(s => s.trim()).filter(Boolean);
 app.enableCors({ origin: origins.includes('*') ? '*' : origins, methods: ['GET'] });
 await app.listen(Number(config.get<string>('PORT') || 3002), config.get<string>('HOST') || '127.0.0.1');
}
void bootstrap();
