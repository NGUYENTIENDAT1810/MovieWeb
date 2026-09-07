import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class SearchMovieDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Search query string', required: true })
  @IsNotEmpty()
  @IsString()
  q: string;
}
