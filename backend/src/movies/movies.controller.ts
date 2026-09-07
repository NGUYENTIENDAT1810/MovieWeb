import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { QueryMovieDto } from './dto/query-movie.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of movies with optional filters and sorting' })
  @ApiResponse({ status: 200, description: 'Paginated movies list' })
  findAll(@Query() queryDto: QueryMovieDto) {
    return this.moviesService.findAll(queryDto);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending movies' })
  @ApiResponse({ status: 200, description: 'List of trending movies' })
  findTrending(@Query() paginationDto: PaginationQueryDto) {
    return this.moviesService.findTrending(paginationDto);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular movies' })
  @ApiResponse({ status: 200, description: 'List of popular movies' })
  findPopular(@Query() paginationDto: PaginationQueryDto) {
    return this.moviesService.findPopular(paginationDto);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest released movies' })
  @ApiResponse({ status: 200, description: 'List of latest movies' })
  findLatest(@Query() paginationDto: PaginationQueryDto) {
    return this.moviesService.findLatest(paginationDto);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get movie details by slug' })
  @ApiParam({ name: 'slug', description: 'Movie slug (e.g. big-buck-bunny)' })
  @ApiResponse({ status: 200, description: 'Movie details with genres and episodes' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.moviesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie details by ID' })
  @ApiParam({ name: 'id', description: 'Movie UUID' })
  @ApiResponse({ status: 200, description: 'Movie details with genres and episodes' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  findById(@Param('id') id: string) {
    return this.moviesService.findById(id);
  }

  @Get(':id/episodes')
  @ApiOperation({ summary: 'Get all episodes of a movie by ID or slug' })
  @ApiParam({ name: 'id', description: 'Movie ID or slug' })
  @ApiResponse({ status: 200, description: 'List of episodes for the movie' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  findEpisodes(@Param('id') id: string) {
    return this.moviesService.findEpisodes(id);
  }
}
