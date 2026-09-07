import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryMovieDto } from './dto/query-movie.dto';
import { SearchMovieDto } from './dto/search-movie.dto';
import { PaginationQueryDto, PaginatedResult, calculatePagination } from '../common/dto/pagination.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(queryDto: QueryMovieDto): Promise<PaginatedResult<any>> {
    const { page, limit, skip, take } = calculatePagination(queryDto.page, queryDto.limit);
    const { search, genre, year, sort = 'latest' } = queryDto;

    const where: Prisma.MovieWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { originalTitle: { contains: search, mode: 'insensitive' } },
        { overview: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (year) {
      where.releaseYear = year;
    }

    if (genre) {
      where.genres = {
        some: {
          genre: {
            OR: [{ id: genre }, { slug: genre }],
          },
        },
      };
    }

    let orderBy: Prisma.MovieOrderByWithRelationInput | Prisma.MovieOrderByWithRelationInput[] = {
      createdAt: 'desc',
    };

    switch (sort) {
      case 'popular':
        orderBy = [{ voteCount: 'desc' }, { rating: 'desc' }];
        break;
      case 'rating':
        orderBy = [{ rating: 'desc' }, { voteCount: 'desc' }];
        break;
      case 'title_asc':
        orderBy = { title: 'asc' };
        break;
      case 'title_desc':
        orderBy = { title: 'desc' };
        break;
      case 'releaseDate_desc':
        orderBy = { releaseDate: 'desc' };
        break;
      case 'latest':
      default:
        orderBy = [{ releaseDate: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          genres: {
            include: { genre: true },
          },
        },
      }),
      this.prisma.movie.count({ where }),
    ]);

    const items = movies.map((movie) => ({
      ...movie,
      genres: movie.genres.map((g) => g.genre),
    }));

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        genres: {
          include: { genre: true },
        },
        episodes: {
          orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }],
        },
      },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID '${id}' not found`);
    }

    return {
      ...movie,
      genres: movie.genres.map((g) => g.genre),
    };
  }

  async findBySlug(slug: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { slug },
      include: {
        genres: {
          include: { genre: true },
        },
        episodes: {
          orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }],
        },
      },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with slug '${slug}' not found`);
    }

    return {
      ...movie,
      genres: movie.genres.map((g) => g.genre),
    };
  }

  async findEpisodes(movieIdOrSlug: string) {
    const movie = await this.prisma.movie.findFirst({
      where: {
        OR: [{ id: movieIdOrSlug }, { slug: movieIdOrSlug }],
      },
    });

    if (!movie) {
      throw new NotFoundException(`Movie '${movieIdOrSlug}' not found`);
    }

    return this.prisma.episode.findMany({
      where: { movieId: movie.id },
      orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }],
    });
  }

  async findTrending(paginationDto: PaginationQueryDto) {
    return this.findAll({
      ...paginationDto,
      sort: 'popular',
    });
  }

  async findPopular(paginationDto: PaginationQueryDto) {
    return this.findAll({
      ...paginationDto,
      sort: 'popular',
    });
  }

  async findLatest(paginationDto: PaginationQueryDto) {
    return this.findAll({
      ...paginationDto,
      sort: 'latest',
    });
  }

  async search(searchDto: SearchMovieDto) {
    return this.findAll({
      ...searchDto,
      search: searchDto.q,
    });
  }
}
