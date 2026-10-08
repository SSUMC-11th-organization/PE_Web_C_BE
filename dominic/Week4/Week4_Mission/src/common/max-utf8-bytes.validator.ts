import { ValidateBy } from 'class-validator';
import type { ValidationOptions } from 'class-validator';

export function MaxUtf8Bytes(maxBytes: number, options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'maxUtf8Bytes',
      constraints: [maxBytes],
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= maxBytes,
        defaultMessage: () => `$property는 UTF-8 ${maxBytes}바이트 이하여야 합니다.`,
      },
    },
    options,
  );
}
