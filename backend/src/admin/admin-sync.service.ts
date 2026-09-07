import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExternalMovieService } from '../external-movies/external-movies.service';
import { TmdbMovieItem, SyncResult } from '../external-movies/interfaces/tmdb.interface';
import { slugify } from '../common/utils/slugify.util';

@Injectable()
export class AdminSyncService {
  private readonly logger = new Logger(AdminSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly externalMovieService: ExternalMovieService,
  ) {}

  async syncGenres(): Promise<{ created: number; total: number }> {
    const tmdbGenres = await this.externalMovieService.getMovieGenres();
    let created = 0;

    for (const g of tmdbGenres.genres) {
      const slug = slugify(g.name);
      const existing = await this.prisma.genre.findFirst({
        where: { OR: [{ name: g.name }, { slug }] },
      });

      if (!existing) {
        await this.prisma.genre.create({
          data: { name: g.name, slug },
        });
        created++;
      }
    }

    const total = await this.prisma.genre.count();
    return { created, total };
  }

  async syncMovieItem(tmdbMovie: TmdbMovieItem): Promise<'created' | 'updated' | 'skipped'> {
    const externalId = tmdbMovie.id.toString();
    const source = 'TMDB';

    // 1. Chuẩn bị metadata
    const rawTitle = tmdbMovie.title || tmdbMovie.original_title || 'Untitled';
    let baseSlug = slugify(rawTitle);
    if (!baseSlug) baseSlug = `movie-${externalId}`;

    const releaseDate = tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null;
    const releaseYear = releaseDate ? releaseDate.getFullYear() : null;

    const posterUrl = this.externalMovieService.formatImageUrl(tmdbMovie.poster_path, 'w500');
    const backdropUrl = this.externalMovieService.formatImageUrl(tmdbMovie.backdrop_path, 'original');

    // 2. Kiểm tra xem phim đã tồn tại theo externalId + source chưa
    const existing = await this.prisma.movie.findUnique({
      where: {
        externalId_source: {
          externalId,
          source,
        },
      },
    });

    let slug = baseSlug;
    if (!existing) {
      // Đảm bảo slug là duy nhất nếu phim mới
      const sameSlug = await this.prisma.movie.findUnique({ where: { slug } });
      if (sameSlug) {
        slug = `${baseSlug}-${externalId}`;
      }
    } else {
      slug = existing.slug;
    }

    const country = tmdbMovie.production_countries?.[0]?.name || null;

    // 3. Upsert Movie
    const movie = await this.prisma.movie.upsert({
      where: {
        externalId_source: {
          externalId,
          source,
        },
      },
      update: {
        title: rawTitle,
        originalTitle: tmdbMovie.original_title,
        overview: tmdbMovie.overview,
        posterUrl: posterUrl || undefined,
        backdropUrl: backdropUrl || undefined,
        releaseDate,
        releaseYear,
        rating: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        runtime: tmdbMovie.runtime,
        status: tmdbMovie.status || 'Released',
        country,
        originalLanguage: tmdbMovie.original_language,
      },
      create: {
        externalId,
        source,
        title: rawTitle,
        originalTitle: tmdbMovie.original_title,
        slug,
        overview: tmdbMovie.overview,
        posterUrl,
        backdropUrl,
        releaseDate,
        releaseYear,
        rating: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        runtime: tmdbMovie.runtime,
        status: tmdbMovie.status || 'Released',
        country,
        originalLanguage: tmdbMovie.original_language,
      },
    });

    // 4. Liên kết thể loại nếu có
    if (tmdbMovie.genres && tmdbMovie.genres.length > 0) {
      for (const g of tmdbMovie.genres) {
        const genreSlug = slugify(g.name);
        const genre = await this.prisma.genre.upsert({
          where: { slug: genreSlug },
          update: { name: g.name },
          create: { name: g.name, slug: genreSlug },
        });

        await this.prisma.movieGenre.upsert({
          where: {
            movieId_genreId: {
              movieId: movie.id,
              genreId: genre.id,
            },
          },
          update: {},
          create: {
            movieId: movie.id,
            genreId: genre.id,
          },
        });
      }
    }

    // 5. Tạo episode demo ban đầu nếu chưa có tập phim nào
    const episodeCount = await this.prisma.episode.count({ where: { movieId: movie.id } });
    if (episodeCount === 0) {
      await this.prisma.episode.create({
        data: {
          movieId: movie.id,
          externalId: `tmdb-${externalId}-ep-1`,
          episodeNumber: 1,
          seasonNumber: 1,
          title: `Tập 1 - ${rawTitle}`,
          overview: tmdbMovie.overview || 'Tập 1',
          thumbnailUrl: backdropUrl || posterUrl,
          duration: tmdbMovie.runtime || 45,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          source: 'DEMO',
        },
      });
    }

    return existing ? 'updated' : 'created';
  }

  async syncPopular(page: number = 1): Promise<SyncResult> {
    const list = await this.externalMovieService.getPopularMovies(page);
    return this.processBatchSync(list.results);
  }

  async syncTrending(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<SyncResult> {
    const list = await this.externalMovieService.getTrendingMovies(timeWindow, page);
    return this.processBatchSync(list.results);
  }

  async syncByExternalId(externalId: string | number): Promise<SyncResult> {
    const detail = await this.externalMovieService.getMovieDetail(externalId);
    const result = await this.syncMovieItem(detail);

    return {
      success: true,
      created: result === 'created' ? 1 : 0,
      updated: result === 'updated' ? 1 : 0,
      skipped: result === 'skipped' ? 1 : 0,
      totalProcessed: 1,
    };
  }

  private async processBatchSync(movies: TmdbMovieItem[]): Promise<SyncResult> {
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of movies) {
      try {
        const status = await this.syncMovieItem(item);
        if (status === 'created') created++;
        else if (status === 'updated') updated++;
        else skipped++;
      } catch (error) {
        this.logger.error(`Error syncing movie ID ${item.id}: ${(error as Error).message}`);
        skipped++;
      }
    }

    return {
      success: true,
      created,
      updated,
      skipped,
      totalProcessed: movies.length,
    };
  }
}
