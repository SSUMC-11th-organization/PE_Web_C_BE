import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class UpdateMemberDto {
  @IsString() @MinLength(2) @MaxLength(12)
  @Matches(/^\S(?:.*\S)?$/u, { message: '닉네임의 앞뒤 공백은 허용하지 않습니다.' }) nickname!: string;
}
