import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export function jwtOptions(config: ConfigService): JwtModuleOptions {
  const secret = config.get<string>('JWT_SECRET');
  const ttl = Number(config.get<string>('JWT_ACCESS_EXPIRATION') ?? '3600');
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error('JWT_SECRET must contain at least 32 bytes.');
  if (!Number.isSafeInteger(ttl) || ttl < 1 || ttl > 86400) throw new Error('JWT_ACCESS_EXPIRATION must be 1..86400 seconds.');
  return { secret, signOptions: { algorithm: 'HS256', expiresIn: ttl }, verifyOptions: { algorithms: ['HS256'] } };
}
