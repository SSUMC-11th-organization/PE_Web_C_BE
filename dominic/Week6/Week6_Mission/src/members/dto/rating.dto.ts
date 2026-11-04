import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
export class CreateRatingDto {
 @IsInt() @Min(1) @Max(Number.MAX_SAFE_INTEGER) movieId!: number;
 @IsInt() @Min(1) @Max(5) score!: number;
 @IsOptional() @IsString() @MaxLength(500) comment?: string | null;
}
export class UpdateRatingDto {
 @IsInt() @Min(1) @Max(5) score!: number;
 @IsOptional() @IsString() @MaxLength(500) comment?: string | null;
}
