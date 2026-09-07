import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { EpisodesService } from './episodes.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Episodes')
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get episode details by ID' })
  @ApiParam({ name: 'id', description: 'Episode UUID' })
  @ApiResponse({ status: 200, description: 'Episode details with video stream URL' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  findById(@Param('id') id: string) {
    return this.episodesService.findById(id);
  }

  @Get('movie/:movieId/season/:season/episode/:episode')
  @ApiOperation({ summary: 'Get episode by movie ID, season number and episode number' })
  @ApiParam({ name: 'movieId', description: 'Movie UUID' })
  @ApiParam({ name: 'season', description: 'Season number', example: 1 })
  @ApiParam({ name: 'episode', description: 'Episode number', example: 1 })
  @ApiResponse({ status: 200, description: 'Episode details' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  findByMovieAndEpisode(
    @Param('movieId') movieId: string,
    @Param('season') season: number,
    @Param('episode') episode: number,
  ) {
    return this.episodesService.findByMovieAndEpisode(
      movieId,
      Number(season),
      Number(episode),
    );
  }

  // --- Admin Episode & Video Sources Management ---

  @Post('admin')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new episode with video stream URL (Requires ADMIN role)' })
  @ApiResponse({ status: 201, description: 'Episode created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires ADMIN role' })
  createEpisode(@Body() createDto: CreateEpisodeDto) {
    return this.episodesService.createEpisode(createDto);
  }

  @Patch('admin/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update episode video source or metadata (Requires ADMIN role)' })
  @ApiParam({ name: 'id', description: 'Episode UUID' })
  @ApiResponse({ status: 200, description: 'Episode updated successfully' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  updateEpisode(@Param('id') id: string, @Body() updateDto: UpdateEpisodeDto) {
    return this.episodesService.updateEpisode(id, updateDto);
  }

  @Delete('admin/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an episode (Requires ADMIN role)' })
  @ApiParam({ name: 'id', description: 'Episode UUID' })
  @ApiResponse({ status: 200, description: 'Episode deleted successfully' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  deleteEpisode(@Param('id') id: string) {
    return this.episodesService.deleteEpisode(id);
  }

  @Post('admin/preset-demo/:movieId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Preset legal open-source demo streams (HLS/MP4) for movie (Requires ADMIN role)' })
  @ApiParam({ name: 'movieId', description: 'Movie UUID' })
  @ApiResponse({ status: 200, description: 'Demo episodes preset result' })
  presetDemoEpisodes(@Param('movieId') movieId: string) {
    return this.episodesService.presetDemoEpisodes(movieId);
  }
}
