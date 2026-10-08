import { Transform } from 'class-transformer';
import { IsDefined, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { MaxUtf8Bytes } from '../../common/max-utf8-bytes.validator';

function normalizeCategoryId(value: unknown): unknown {
  // 숫자 문자열은 변환하되 null·공백·boolean을 숫자로 취급하지 않는다.
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }
  return value;
}

export class CreateBookDto {
  @Transform(({ value }: { value: unknown }) => normalizeCategoryId(value))
  @IsDefined({ message: 'categoryId는 필수입니다.' })
  @IsInt({ message: 'categoryId는 정수여야 합니다.' })
  @Min(1, { message: 'categoryId는 1 이상이어야 합니다.' })
  @Max(Number.MAX_SAFE_INTEGER, { message: 'categoryId가 안전한 정수 범위를 초과했습니다.' })
  categoryId!: number;

  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString({ message: 'title은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'title은 비어 있을 수 없습니다.' })
  @MaxLength(100, { message: 'title은 100자 이하여야 합니다.' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'description은 문자열 또는 null이어야 합니다.' })
  @MaxUtf8Bytes(65535, { message: 'description은 UTF-8 65535바이트 이하여야 합니다.' })
  description?: string | null;
}
