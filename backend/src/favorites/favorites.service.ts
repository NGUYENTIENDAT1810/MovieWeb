import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, calculatePagination } from '../common/dto/pagination.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async addFavorite(userId: string, movieId: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID '${movieId}' not found`);
    }

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (existing) {
      return { message: 'Movie is already in favorites', favorite: existing };
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        movieId,
      },
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

    return {
      message: 'Added to favorites successfully',
      favorite: {
        ...favorite,
        movie: {
          ...favorite.movie,
          genres: favorite.movie.genres.map((g) => g.genre),
        },
      },
    };
  }

  async removeFavorite(userId: string, movieId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Movie is not in favorites');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    return { message: 'Removed from favorites successfully' };
  }

  async getFavorites(userId: string, paginationDto: PaginationQueryDto) {
    const { page, limit, skip, take } = calculatePagination(paginationDto.page, paginationDto.limit);

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          movie: {
            include: {
              genres: {
                include: { genre: true },
              },
            },
          },
        },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    const items = favorites.map((f) => ({
      favoriteId: f.id,
      favoritedAt: f.createdAt,
      movie: {
        ...f.movie,
        genres: f.movie.genres.map((g) => g.genre),
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

  async checkFavoriteStatus(userId: string, movieId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    return {
      isFavorite: !!favorite,
    };
  }
}
