import { BadRequestException, UnsupportedMediaTypeException } from '@nestjs/common';

export function pathId(value: string, name: string): number {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new BadRequestException(`${name}는 양의 정수여야 합니다.`);
  }
  return Number(value);
}

export function bodyId(body: Record<string, unknown>, name: string): number {
  const value = body?.[name];
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw new BadRequestException(`${name}는 JSON 숫자로 전달한 양의 정수여야 합니다.`);
  }
  return value;
}

export function jsonRequest(contentType: string | undefined) {
  if (!contentType || !/^application\/(?:json|[a-z0-9.+-]+\+json)(?:\s*;|$)/i.test(contentType)) {
    throw new UnsupportedMediaTypeException('Content-Type: application/json으로 요청해 주세요.');
  }
}

export function envPort(raw: string, name: string): number {
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name}은 1~65535 사이의 정수여야 합니다.`);
  }
  return value;
}
