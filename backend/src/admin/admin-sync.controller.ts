import { Controller, Post, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminSyncService } from './admin-sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin Sync')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/movies/sync')
export class AdminSyncController {
  constructor(private readonly syncService: AdminSyncService) {}

  @Post('genres')
  @ApiOperation({ summary: 'Sync movie genres from TMDB API (Requires ADMIN role)' })
  @ApiResponse({ status: 200, description: 'Genres sync result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires ADMIN role' })
  syncGenres() {
    return this.syncService.syncGenres();
  }

  @Post('popular')
  @ApiOperation({ summary: 'Sync popular movies from TMDB API (Requires ADMIN role)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Batch sync summary' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires ADMIN role' })
  syncPopular(@Query('page') page?: number) {
    return this.syncService.syncPopular(page ? Number(page) : 1);
  }

  @Post('trending')
  @ApiOperation({ summary: 'Sync trending movies from TMDB API (Requires ADMIN role)' })
  @ApiQuery({ name: 'timeWindow', required: false, enum: ['day', 'week'], example: 'day' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Batch sync summary' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires ADMIN role' })
  syncTrending(
    @Query('timeWindow') timeWindow: 'day' | 'week' = 'day',
    @Query('page') page?: number,
  ) {
    return this.syncService.syncTrending(timeWindow, page ? Number(page) : 1);
  }

  @Post(':externalId')
  @ApiOperation({ summary: 'Sync a single movie by TMDB external ID (Requires ADMIN role)' })
  @ApiParam({ name: 'externalId', description: 'TMDB Movie ID (e.g. 550 for Fight Club)' })
  @ApiResponse({ status: 200, description: 'Single movie sync result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires ADMIN role' })
  syncByExternalId(@Param('externalId') externalId: string) {
    return this.syncService.syncByExternalId(externalId);
  }
}
