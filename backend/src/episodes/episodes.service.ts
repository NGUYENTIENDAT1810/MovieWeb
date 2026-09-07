import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EpisodesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
      include: {
        movie: {
          include: {
            genres: {
              include: { genre: true },
            },
          },
        },
      },
    });

    if (!episode) {
      throw new NotFoundException(`Episode with ID '${id}' not found`);
    }

    return {
      ...episode,
      movie: {
        ...episode.movie,
        genres: episode.movie.genres.map((g) => g.genre),
      },
    };
  }

  async findByMovieAndNumber(movieId: string, seasonNumber: number, episodeNumber: number) {
    const episode = await this.prisma.episode.findUnique({
      where: {
        movieId_seasonNumber_episodeNumber: {
          movieId,
          seasonNumber,
          episodeNumber,
        },
      },
      include: {
        movie: true,
      },
    });

    if (!episode) {
      throw new NotFoundException(
        `Episode S${seasonNumber}E${episodeNumber} for movie '${movieId}' not found`,
      );
    }

    return episode;
  }
}
