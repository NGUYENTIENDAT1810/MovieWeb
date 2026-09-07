import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { SearchMovieDto } from './dto/search-movie.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOperation({ summary: 'Search movies by keyword query' })
  @ApiResponse({ status: 200, description: 'Paginated search results' })
  search(@Query() searchDto: SearchMovieDto) {
    return this.moviesService.search(searchDto);
  }
}
