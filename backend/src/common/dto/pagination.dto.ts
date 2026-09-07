import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export function calculatePagination(page: number = 1, limit: number = 20) {
  const validPage = Math.max(1, page || 1);
  const validLimit = Math.max(1, Math.min(100, limit || 20));
  return {
    page: validPage,
    limit: validLimit,
    skip: (validPage - 1) * validLimit,
    take: validLimit,
  };
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
