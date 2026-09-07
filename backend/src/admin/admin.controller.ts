import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard metrics & stats (Requires ADMIN role)' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics and recent movies' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires ADMIN role' })
  getStats() {
    return this.adminService.getStats();
  }

  @Patch('movies/:id')
  @ApiOperation({ summary: 'Update movie metadata (Requires ADMIN role)' })
  @ApiParam({ name: 'id', description: 'Movie UUID' })
  @ApiResponse({ status: 200, description: 'Updated movie record' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  updateMovie(@Param('id') id: string, @Body() updateDto: UpdateMovieDto) {
    return this.adminService.updateMovie(id, updateDto);
  }

  @Delete('movies/:id')
  @ApiOperation({ summary: 'Delete a movie and associated relations (Requires ADMIN role)' })
  @ApiParam({ name: 'id', description: 'Movie UUID' })
  @ApiResponse({ status: 200, description: 'Movie deleted confirmation' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  deleteMovie(@Param('id') id: string) {
    return this.adminService.deleteMovie(id);
  }
}
