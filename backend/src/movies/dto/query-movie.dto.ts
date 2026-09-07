import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class QueryMovieDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search keyword for movie title or overview' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Genre ID or slug to filter by (e.g. hanh-dong)' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ description: 'Release year (e.g. 2024)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({
    description: 'Sorting criteria',
    enum: ['latest', 'popular', 'rating', 'title_asc', 'title_desc', 'releaseDate_desc'],
    default: 'latest',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'latest';
}
