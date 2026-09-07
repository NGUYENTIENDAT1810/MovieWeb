import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, calculatePagination } from '../common/dto/pagination.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with ID '${id}' not found`);
    }

    return genre;
  }

  async findMoviesByGenre(genreIdOrSlug: string, paginationDto: PaginationQueryDto) {
    const genre = await this.prisma.genre.findFirst({
      where: {
        OR: [{ id: genreIdOrSlug }, { slug: genreIdOrSlug }],
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre '${genreIdOrSlug}' not found`);
    }

    const { page, limit, skip, take } = calculatePagination(paginationDto.page, paginationDto.limit);

    const [movieGenres, total] = await Promise.all([
      this.prisma.movieGenre.findMany({
        where: { genreId: genre.id },
        skip,
        take,
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
      this.prisma.movieGenre.count({
        where: { genreId: genre.id },
      }),
    ]);

    const items = movieGenres.map((mg) => ({
      ...mg.movie,
      genres: mg.movie.genres.map((g) => g.genre),
    }));

    return {
      genre,
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
