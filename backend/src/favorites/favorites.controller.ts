import { Controller, Post, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Favorites')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':movieId')
  @ApiOperation({ summary: 'Add a movie to favorites' })
  @ApiParam({ name: 'movieId', description: 'Movie UUID' })
  @ApiResponse({ status: 201, description: 'Added to favorites' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  addFavorite(
    @CurrentUser('id') userId: string,
    @Param('movieId') movieId: string,
  ) {
    return this.favoritesService.addFavorite(userId, movieId);
  }

  @Delete(':movieId')
  @ApiOperation({ summary: 'Remove a movie from favorites' })
  @ApiParam({ name: 'movieId', description: 'Movie UUID' })
  @ApiResponse({ status: 200, description: 'Removed from favorites' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  removeFavorite(
    @CurrentUser('id') userId: string,
    @Param('movieId') movieId: string,
  ) {
    return this.favoritesService.removeFavorite(userId, movieId);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of user favorite movies' })
  @ApiResponse({ status: 200, description: 'List of favorite movies' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getFavorites(
    @CurrentUser('id') userId: string,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.favoritesService.getFavorites(userId, paginationDto);
  }

  @Get(':movieId/status')
  @ApiOperation({ summary: 'Check if a specific movie is favorited by current user' })
  @ApiParam({ name: 'movieId', description: 'Movie UUID' })
  @ApiResponse({ status: 200, description: 'Favorite status { isFavorite: boolean }' })
  checkStatus(
    @CurrentUser('id') userId: string,
    @Param('movieId') movieId: string,
  ) {
    return this.favoritesService.checkFavoriteStatus(userId, movieId);
  }
}
