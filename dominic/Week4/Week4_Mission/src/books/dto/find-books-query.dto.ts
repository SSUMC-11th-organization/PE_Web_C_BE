import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class FindBooksQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString({ message: 'keyword는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'keyword는 비어 있을 수 없습니다.' })
  @MaxLength(100, { message: 'keyword는 100자 이하여야 합니다.' })
  keyword?: string;
}
