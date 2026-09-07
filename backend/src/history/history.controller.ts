import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { SaveHistoryDto } from './dto/save-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Watch History')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Save or update watch progress (for resume watching)' })
  @ApiResponse({ status: 200, description: 'Watch progress recorded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  saveProgress(
    @CurrentUser('id') userId: string,
    @Body() saveHistoryDto: SaveHistoryDto,
  ) {
    return this.historyService.saveProgress(userId, saveHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated watch history / Continue Watching list' })
  @ApiResponse({ status: 200, description: 'List of watched items' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getHistory(
    @CurrentUser('id') userId: string,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.historyService.getHistory(userId, paginationDto);
  }

  @Get('movie/:movieId')
  @ApiOperation({ summary: 'Get last watch progress for a specific movie' })
  @ApiParam({ name: 'movieId', description: 'Movie UUID' })
  @ApiResponse({ status: 200, description: 'Watch progress details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMovieProgress(
    @CurrentUser('id') userId: string,
    @Param('movieId') movieId: string,
  ) {
    return this.historyService.getMovieProgress(userId, movieId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a single watch history item' })
  @ApiParam({ name: 'id', description: 'History record UUID' })
  @ApiResponse({ status: 200, description: 'History item deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deleteItem(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.historyService.deleteHistory(userId, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire watch history for the user' })
  @ApiResponse({ status: 200, description: 'All watch history cleared' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  clearAll(@CurrentUser('id') userId: string) {
    return this.historyService.deleteHistory(userId);
  }
}
