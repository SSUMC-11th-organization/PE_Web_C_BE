import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiError } from './common/api-error';
import { ApiExceptionFilter } from './common/api-exception.filter';

export function configureApp(app: INestApplication) {
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    transform: true, whitelist: true, forbidNonWhitelisted: true,
    exceptionFactory: errors => apiError.validation(Object.values(errors[0]?.constraints ?? {})[0] ?? '입력값이 올바르지 않습니다.'),
  }));
}

export function createApiDocument(app: INestApplication) {
  return SwaggerModule.createDocument(app, new DocumentBuilder()
    .setTitle('UMC Week 9 함께 테스트하고 다듬기')
    .setDescription('공개 API는 토큰이 필요하지 않습니다. 자물쇠가 있는 API는 Authorization: Bearer {token}이 필요합니다. Authorize에는 로그인 응답의 accessToken만 입력하세요. 회원 ID는 JWT sub로 결정합니다.')
    .setVersion('1.0').addBearerAuth().addSecurityRequirements('bearer').build());
}
