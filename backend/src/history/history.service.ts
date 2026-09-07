import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveHistoryDto } from './dto/save-history.dto';
import { PaginationQueryDto, calculatePagination } from '../common/dto/pagination.dto';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async saveProgress(userId: string, saveHistoryDto: SaveHistoryDto) {
    const { movieId, episodeId, progressSeconds, completed = false } = saveHistoryDto;

    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID '${movieId}' not found`);
    }

    // Kiểm tra xem đã có lịch sử xem phim này chưa
    const existing = await this.prisma.watchHistory.findFirst({
      where: {
        userId,
        movieId,
        ...(episodeId ? { episodeId } : {}),
      },
    });

    if (existing) {
      const updated = await this.prisma.watchHistory.update({
        where: { id: existing.id },
        data: {
          progressSeconds,
          completed,
          episodeId: episodeId || existing.episodeId,
          updatedAt: new Date(),
        },
        include: {
          movie: true,
          episode: true,
        },
      });

      return {
        message: 'Watch progress updated',
        history: updated,
      };
    }

    const created = await this.prisma.watchHistory.create({
      data: {
        userId,
        movieId,
        episodeId,
        progressSeconds,
        completed,
      },
      include: {
        movie: true,
        episode: true,
      },
    });

    return {
      message: 'Watch progress saved',
      history: created,
    };
  }

  async getHistory(userId: string, paginationDto: PaginationQueryDto) {
    const { page, limit, skip, take } = calculatePagination(paginationDto.page, paginationDto.limit);

    const [histories, total] = await Promise.all([
      this.prisma.watchHistory.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          movie: {
            include: {
              genres: {
                include: { genre: true },
              },
            },
          },
          episode: true,
        },
      }),
      this.prisma.watchHistory.count({ where: { userId } }),
    ]);

    const items = histories.map((h) => ({
      ...h,
      movie: {
        ...h.movie,
        genres: h.movie.genres.map((g) => g.genre),
      },
    }));

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getMovieProgress(userId: string, movieId: string) {
    const progress = await this.prisma.watchHistory.findFirst({
      where: { userId, movieId },
      orderBy: { updatedAt: 'desc' },
      include: { episode: true },
    });

    return progress || { progressSeconds: 0, completed: false, episodeId: null };
  }

  async deleteHistory(userId: string, id?: string) {
    if (id) {
      const existing = await this.prisma.watchHistory.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new NotFoundException('History record not found');
      }

      await this.prisma.watchHistory.delete({ where: { id } });
      return { message: 'History record deleted' };
    }

    await this.prisma.watchHistory.deleteMany({ where: { userId } });
    return { message: 'All watch history cleared' };
  }
}
