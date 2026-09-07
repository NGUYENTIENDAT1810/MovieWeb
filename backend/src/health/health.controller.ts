import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'System health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-09-07T08:00:00.000Z' },
        database: { type: 'string', example: 'connected' },
      },
    },
  })
  async check() {
    const isDbConnected = await this.prisma.isHealthy();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: isDbConnected ? 'connected' : 'disconnected',
    };
  }
}
