import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, MaxLength, Min } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ example: 550, description: 'TMDB 영화 ID' })
  @IsInt({ message: '영화 ID는 정수여야 합니다.' })
  @Min(1, { message: '영화 ID는 양수여야 합니다.' })
  movieId: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt({ message: '별점은 정수여야 합니다.' })
  @Min(1, { message: '별점은 1점 이상이어야 합니다.' })
  @Max(5, { message: '별점은 5점 이하여야 합니다.' })
  score: number;

  @ApiPropertyOptional({ example: '재밌어요!' })
  @IsOptional()
  @MaxLength(500, { message: '후기는 500자 이하로 입력해주세요.' })
  comment?: string;
}
