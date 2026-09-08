import { IsString, IsOptional, IsInt, Min, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEpisodeDto {
  @ApiPropertyOptional({ description: 'Episode number', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  episodeNumber?: number;

  @ApiPropertyOptional({ description: 'Season number', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  seasonNumber?: number;

  @ApiPropertyOptional({ description: 'Episode title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Episode summary / overview' })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 45 })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ description: 'HLS (.m3u8) or MP4 Video Stream URL' })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'WebVTT (.vtt) Subtitle URL' })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  subtitleUrl?: string;
}

