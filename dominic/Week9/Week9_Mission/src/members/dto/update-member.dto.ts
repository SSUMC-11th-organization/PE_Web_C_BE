import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class UpdateMemberDto {
  @ApiProperty({ example: '도미닉', minLength: 2, maxLength: 12, description: '앞뒤 공백 없는 닉네임' })
  @IsString() @MinLength(2) @MaxLength(12)
  @Matches(/^\S(?:.*\S)?$/u, { message: '닉네임의 앞뒤 공백은 허용하지 않습니다.' }) nickname!: string;
}
