import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMovieDto {
  @ApiPropertyOptional({ description: 'Movie title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Original title' })
  @IsOptional()
  @IsString()
  originalTitle?: string;

  @ApiPropertyOptional({ description: 'Movie overview/synopsis' })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({ description: 'Poster image URL' })
  @IsOptional()
  @IsString()
  posterUrl?: string;

  @ApiPropertyOptional({ description: 'Backdrop image URL' })
  @IsOptional()
  @IsString()
  backdropUrl?: string;

  @ApiPropertyOptional({ description: 'Release year', example: 2024 })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2100)
  releaseYear?: number;

  @ApiPropertyOptional({ description: 'Rating (0 - 10)', example: 8.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @ApiPropertyOptional({ description: 'Country of production' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Movie status' })
  @IsOptional()
  @IsString()
  status?: string;
}
