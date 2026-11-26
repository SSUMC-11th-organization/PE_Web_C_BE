import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
export class CreateRatingDto {
 @ApiProperty({ example: 550, minimum: 1, maximum: Number.MAX_SAFE_INTEGER })
 @IsInt() @Min(1) @Max(Number.MAX_SAFE_INTEGER) movieId!: number;
 @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
 @IsInt() @Min(1) @Max(5) score!: number;
 @ApiPropertyOptional({ example: '다시 보고 싶은 영화입니다.', nullable: true, maxLength: 500 })
 @IsOptional() @IsString() @MaxLength(500) comment?: string | null;
}
export class UpdateRatingDto {
 @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
 @IsInt() @Min(1) @Max(5) score!: number;
 @ApiPropertyOptional({ example: '다시 보고 싶은 영화입니다.', nullable: true, maxLength: 500 })
 @IsOptional() @IsString() @MaxLength(500) comment?: string | null;
}
