import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalMovies, totalEpisodes, totalUsers, totalGenres, recentMovies] =
      await Promise.all([
        this.prisma.movie.count(),
        this.prisma.episode.count(),
        this.prisma.user.count(),
        this.prisma.genre.count(),
        this.prisma.movie.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            genres: {
              include: { genre: true },
            },
          },
        }),
      ]);

    return {
      totalMovies,
      totalEpisodes,
      totalUsers,
      totalGenres,
      recentMovies: recentMovies.map((m) => ({
        ...m,
        genres: m.genres.map((g) => g.genre),
      })),
    };
  }

  async updateMovie(id: string, updateDto: UpdateMovieDto) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID '${id}' not found`);
    }

    return this.prisma.movie.update({
      where: { id },
      data: updateDto,
      include: {
        genres: {
          include: { genre: true },
        },
      },
    });
  }

  async deleteMovie(id: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID '${id}' not found`);
    }

    // Cascade delete relations
    await this.prisma.$transaction([
      this.prisma.movieGenre.deleteMany({ where: { movieId: id } }),
      this.prisma.episode.deleteMany({ where: { movieId: id } }),
      this.prisma.favorite.deleteMany({ where: { movieId: id } }),
      this.prisma.watchHistory.deleteMany({ where: { movieId: id } }),
      this.prisma.movie.delete({ where: { id } }),
    ]);

    return {
      success: true,
      message: `Movie '${movie.title}' deleted successfully`,
    };
  }
}
