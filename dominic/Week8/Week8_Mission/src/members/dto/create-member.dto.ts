import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateMemberDto {
 @ApiProperty({ example: 'member@example.com' })
 @IsString() @IsNotEmpty() @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' }) @MaxLength(254) email!: string;
 @ApiProperty({ example: 'dominic', minLength: 2, maxLength: 12 })
 @IsString() @MinLength(2) @MaxLength(12) @Matches(/^\S(?:.*\S)?$/u, { message: '닉네임의 앞뒤 공백은 허용하지 않습니다.' }) nickname!: string;
 @ApiProperty({ example: 'Study!1234', minLength: 8, maxLength: 72, format: 'password' })
 @IsString() @MinLength(8) @MaxLength(72) @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s])\S+$/, { message: '비밀번호는 영문 대·소문자, 숫자, 특수문자를 포함해야 합니다.' }) password!: string;
}
