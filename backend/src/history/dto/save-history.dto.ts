import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SaveHistoryDto {
  @ApiProperty({ description: 'Movie UUID', example: 'd3b07384-d113-40e1-953e-5de612345678' })
  @IsString()
  @IsNotEmpty()
  movieId: string;

  @ApiPropertyOptional({ description: 'Episode UUID if watching an episode' })
  @IsOptional()
  @IsString()
  episodeId?: string;

  @ApiProperty({ description: 'Watch progress in seconds', example: 125 })
  @IsInt()
  @Min(0)
  progressSeconds: number;

  @ApiPropertyOptional({ description: 'Whether the movie or episode was completed', default: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean = false;
}
