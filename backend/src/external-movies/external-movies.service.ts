import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TmdbCreditsResponse,
  TmdbGenreResponse,
  TmdbImagesResponse,
  TmdbListResponse,
  TmdbMovieItem,
} from './interfaces/tmdb.interface';

@Injectable()
export class ExternalMovieService {
  private readonly logger = new Logger(ExternalMovieService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly imageBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY', '');
    this.baseUrl = this.configService.get<string>('TMDB_BASE_URL', 'https://api.themoviedb.org/3');
    this.imageBaseUrl = this.configService.get<string>(
      'TMDB_IMAGE_BASE_URL',
      'https://image.tmdb.org/t/p',
    );
  }

  private async fetchFromTmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.apiKey) {
      this.logger.warn('TMDB_API_KEY is not configured in environment variables.');
      throw new HttpException(
        'TMDB_API_KEY is not configured on the server. Please provide TMDB_API_KEY in .env',
        HttpStatus.BAD_REQUEST,
      );
    }

    const queryParams = new URLSearchParams({
      api_key: this.apiKey,
      language: 'vi-VN',
      ...params,
    });

    const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        // Fallback to English if Vietnamese language is unavailable
        if (response.status === 404 && params.language === 'vi-VN') {
          return this.fetchFromTmdb<T>(endpoint, { ...params, language: 'en-US' });
        }
        const errorText = await response.text();
        this.logger.error(`TMDB API request failed [${response.status}]: ${endpoint}`);
        throw new HttpException(
          `Third-party movie API returned error status ${response.status}`,
          response.status === 401 ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_GATEWAY,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Network error calling TMDB API: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to communicate with external movie metadata service',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getPopularMovies(page: number = 1): Promise<TmdbListResponse> {
    return this.fetchFromTmdb<TmdbListResponse>('/movie/popular', { page: page.toString() });
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<TmdbListResponse> {
    return this.fetchFromTmdb<TmdbListResponse>(`/trending/movie/${timeWindow}`, {
      page: page.toString(),
    });
  }

  async searchMovies(query: string, page: number = 1): Promise<TmdbListResponse> {
    return this.fetchFromTmdb<TmdbListResponse>('/search/movie', {
      query,
      page: page.toString(),
    });
  }

  async getMovieDetail(externalId: string | number): Promise<TmdbMovieItem> {
    return this.fetchFromTmdb<TmdbMovieItem>(`/movie/${externalId}`);
  }

  async getMovieCredits(externalId: string | number): Promise<TmdbCreditsResponse> {
    return this.fetchFromTmdb<TmdbCreditsResponse>(`/movie/${externalId}/credits`);
  }

  async getMovieGenres(): Promise<TmdbGenreResponse> {
    return this.fetchFromTmdb<TmdbGenreResponse>('/genre/movie/list');
  }

  async getMovieImages(externalId: string | number): Promise<TmdbImagesResponse> {
    return this.fetchFromTmdb<TmdbImagesResponse>(`/movie/${externalId}/images`, {
      include_image_language: 'vi,en,null',
    });
  }

  formatImageUrl(path: string | null, size: 'w500' | 'original' = 'original'): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${this.imageBaseUrl}/${size}${path}`;
  }
}
