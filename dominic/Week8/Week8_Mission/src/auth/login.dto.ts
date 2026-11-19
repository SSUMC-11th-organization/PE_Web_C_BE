import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty({ example: 'Study!1234', format: 'password' })
  @IsString() @MinLength(1) @MaxLength(256) password!: string;
}
