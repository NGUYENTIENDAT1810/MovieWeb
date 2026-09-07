import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GenresService } from './genres.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  @ApiOperation({ summary: 'Get all movie genres' })
  @ApiResponse({ status: 200, description: 'List of all genres' })
  findAll() {
    return this.genresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get genre detail by ID' })
  @ApiParam({ name: 'id', description: 'Genre ID' })
  @ApiResponse({ status: 200, description: 'Genre details' })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  findOne(@Param('id') id: string) {
    return this.genresService.findOne(id);
  }

  @Get(':id/movies')
  @ApiOperation({ summary: 'Get paginated movies belonging to a specific genre (by ID or slug)' })
  @ApiParam({ name: 'id', description: 'Genre ID or slug (e.g. hanh-dong)' })
  @ApiResponse({ status: 200, description: 'Paginated list of movies by genre' })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  findMoviesByGenre(
    @Param('id') id: string,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.genresService.findMoviesByGenre(id, paginationDto);
  }
}
