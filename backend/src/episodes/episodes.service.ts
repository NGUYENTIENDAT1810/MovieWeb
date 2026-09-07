import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

@Injectable()
export class EpisodesService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            posterUrl: true,
            backdropUrl: true,
          },
        },
      },
    });

    if (!episode) {
      throw new NotFoundException(`Episode with ID '${id}' not found`);
    }

    return episode;
  }

  async findByMovieAndEpisode(
    movieId: string,
    seasonNumber: number,
    episodeNumber: number,
  ) {
    const episode = await this.prisma.episode.findUnique({
      where: {
        movieId_seasonNumber_episodeNumber: {
          movieId,
          seasonNumber,
          episodeNumber,
        },
      },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            posterUrl: true,
          },
        },
      },
    });

    if (!episode) {
      throw new NotFoundException(
        `Episode S${seasonNumber}E${episodeNumber} not found for movie '${movieId}'`,
      );
    }

    return episode;
  }

  async createEpisode(dto: CreateEpisodeDto) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: dto.movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID '${dto.movieId}' not found`);
    }

    const seasonNumber = dto.seasonNumber || 1;
    const existing = await this.prisma.episode.findUnique({
      where: {
        movieId_seasonNumber_episodeNumber: {
          movieId: dto.movieId,
          seasonNumber,
          episodeNumber: dto.episodeNumber,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Tập ${dto.episodeNumber} (Mùa ${seasonNumber}) đã tồn tại cho bộ phim này`,
      );
    }

    return this.prisma.episode.create({
      data: {
        movieId: dto.movieId,
        episodeNumber: dto.episodeNumber,
        seasonNumber,
        title: dto.title,
        overview: dto.overview,
        thumbnailUrl: dto.thumbnailUrl,
        duration: dto.duration,
        videoUrl: dto.videoUrl,
        subtitleUrl: dto.subtitleUrl,
        source: 'ADMIN_CUSTOM',
      },
    });
  }

  async updateEpisode(id: string, dto: UpdateEpisodeDto) {
    const episode = await this.prisma.episode.findUnique({ where: { id } });
    if (!episode) {
      throw new NotFoundException(`Episode with ID '${id}' not found`);
    }

    return this.prisma.episode.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async deleteEpisode(id: string) {
    const episode = await this.prisma.episode.findUnique({ where: { id } });
    if (!episode) {
      throw new NotFoundException(`Episode with ID '${id}' not found`);
    }

    await this.prisma.episode.delete({ where: { id } });

    return {
      success: true,
      message: `Episode '${episode.title}' deleted successfully`,
    };
  }

  async presetDemoEpisodes(movieId: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID '${movieId}' not found`);
    }

    // Preset 2 legal open-source demo episodes (HLS + MP4)
    const ep1 = await this.prisma.episode.upsert({
      where: {
        movieId_seasonNumber_episodeNumber: {
          movieId,
          seasonNumber: 1,
          episodeNumber: 1,
        },
      },
      update: {
        title: 'Tập 1: Big Buck Bunny (HLS Multi-Bitrate)',
        overview: 'Luồng phát trực tuyến HLS .m3u8 adaptive bitrate streaming chuẩn quốc tế (Blender Foundation, Creative Commons).',
        videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        duration: 10,
        source: 'OPEN_SOURCE_HLS',
      },
      create: {
        movieId,
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'Tập 1: Big Buck Bunny (HLS Multi-Bitrate)',
        overview: 'Luồng phát trực tuyến HLS .m3u8 adaptive bitrate streaming chuẩn quốc tế (Blender Foundation, Creative Commons).',
        videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        duration: 10,
        source: 'OPEN_SOURCE_HLS',
      },
    });

    const ep2 = await this.prisma.episode.upsert({
      where: {
        movieId_seasonNumber_episodeNumber: {
          movieId,
          seasonNumber: 1,
          episodeNumber: 2,
        },
      },
      update: {
        title: 'Tập 2: Sintel (Adaptive HLS Stream)',
        overview: 'Luồng video HLS mã nguồn mở thử nghiệm (Blender Open Movie Project).',
        videoUrl: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
        duration: 15,
        source: 'OPEN_SOURCE_HLS',
      },
      create: {
        movieId,
        seasonNumber: 1,
        episodeNumber: 2,
        title: 'Tập 2: Sintel (Adaptive HLS Stream)',
        overview: 'Luồng video HLS mã nguồn mở thử nghiệm (Blender Open Movie Project).',
        videoUrl: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
        duration: 15,
        source: 'OPEN_SOURCE_HLS',
      },
    });

    return {
      success: true,
      message: `Đã nạp 2 nguồn video HLS demo hợp pháp cho phim "${movie.title}"`,
      episodes: [ep1, ep2],
    };
  }
}
