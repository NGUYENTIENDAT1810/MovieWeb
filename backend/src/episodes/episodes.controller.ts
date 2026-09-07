import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EpisodesService } from './episodes.service';

@ApiTags('Episodes')
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get episode detail and playback metadata by ID' })
  @ApiParam({ name: 'id', description: 'Episode UUID' })
  @ApiResponse({ status: 200, description: 'Episode details' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  findOne(@Param('id') id: string) {
    return this.episodesService.findOne(id);
  }

  @Get('movie/:movieId/season/:season/episode/:episode')
  @ApiOperation({ summary: 'Get episode by movie ID, season number, and episode number' })
  @ApiParam({ name: 'movieId', description: 'Movie UUID' })
  @ApiParam({ name: 'season', description: 'Season number' })
  @ApiParam({ name: 'episode', description: 'Episode number' })
  @ApiResponse({ status: 200, description: 'Episode details' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  findByNumber(
    @Param('movieId') movieId: string,
    @Param('season', ParseIntPipe) season: number,
    @Param('episode', ParseIntPipe) episode: number,
  ) {
    return this.episodesService.findByMovieAndNumber(movieId, season, episode);
  }
}
