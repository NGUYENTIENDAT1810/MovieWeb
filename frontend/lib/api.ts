import {
  Movie,
  Genre,
  Episode,
  PaginatedResponse,
  AuthResponse,
  User,
  WatchHistoryItem,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('movie_web_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.message || errorJson.error || errorMsg;
    } catch {
      errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return (await res.json()) as T;
}

export const api = {
  // Movies
  getMovies: (params: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
    year?: number;
    sort?: string;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.genre) query.append('genre', params.genre);
    if (params.year) query.append('year', params.year.toString());
    if (params.sort) query.append('sort', params.sort);
    return request<PaginatedResponse<Movie>>(`/movies?${query.toString()}`);
  },

  getTrending: (page = 1, limit = 10) =>
    request<PaginatedResponse<Movie>>(`/movies/trending?page=${page}&limit=${limit}`),

  getPopular: (page = 1, limit = 10) =>
    request<PaginatedResponse<Movie>>(`/movies/popular?page=${page}&limit=${limit}`),

  getLatest: (page = 1, limit = 10) =>
    request<PaginatedResponse<Movie>>(`/movies/latest?page=${page}&limit=${limit}`),

  getMovieBySlug: (slug: string) => request<Movie>(`/movies/slug/${slug}`),

  getMovieById: (id: string) => request<Movie>(`/movies/${id}`),

  getEpisodes: (movieId: string) => request<Episode[]>(`/movies/${movieId}/episodes`),

  getEpisodeById: (episodeId: string) => request<Episode>(`/episodes/${episodeId}`),

  // Search
  search: (q: string, page = 1, limit = 20) =>
    request<PaginatedResponse<Movie>>(`/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),

  // Genres
  getGenres: () => request<Genre[]>('/genres'),

  getMoviesByGenre: (genreIdOrSlug: string, page = 1, limit = 20) =>
    request<PaginatedResponse<Movie>>(`/genres/${genreIdOrSlug}/movies?page=${page}&limit=${limit}`),

  // Auth
  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => request<User>('/auth/me'),

  // Favorites
  getFavorites: (page = 1, limit = 20) =>
    request<PaginatedResponse<{ favoriteId: string; favoritedAt: string; movie: Movie }>>(
      `/favorites?page=${page}&limit=${limit}`,
    ),

  addFavorite: (movieId: string) =>
    request<{ message: string; favorite: any }>(`/favorites/${movieId}`, {
      method: 'POST',
    }),

  removeFavorite: (movieId: string) =>
    request<{ message: string }>(`/favorites/${movieId}`, {
      method: 'DELETE',
    }),

  checkFavoriteStatus: (movieId: string) =>
    request<{ isFavorite: boolean }>(`/favorites/${movieId}/status`),

  // Watch History
  getHistory: (page = 1, limit = 20) =>
    request<PaginatedResponse<WatchHistoryItem>>(`/history?page=${page}&limit=${limit}`),

  saveHistory: (data: {
    movieId: string;
    episodeId?: string;
    progressSeconds: number;
    completed?: boolean;
  }) =>
    request<{ message: string; history: any }>('/history', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMovieProgress: (movieId: string) =>
    request<{ progressSeconds: number; completed: boolean; episodeId: string | null }>(
      `/history/movie/${movieId}`,
    ),

  // Admin Operations
  getAdminStats: () =>
    request<{
      totalMovies: number;
      totalEpisodes: number;
      totalUsers: number;
      totalGenres: number;
      recentMovies: Movie[];
    }>('/admin/stats'),

  updateMovie: (id: string, data: Partial<Movie>) =>
    request<Movie>(`/admin/movies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteMovie: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/movies/${id}`, {
      method: 'DELETE',
    }),

  // Admin Sync
  syncGenres: () =>
    request<{ success: boolean; totalTMDBGenres: number; createdGenres: number }>(
      '/admin/movies/sync/genres',
      { method: 'POST' },
    ),

  syncPopular: (page = 1) =>
    request<{ success: boolean; created: number; updated: number; skipped: number }>(
      `/admin/movies/sync/popular?page=${page}`,
      { method: 'POST' },
    ),

  syncTrending: (timeWindow: 'day' | 'week' = 'day', page = 1) =>
    request<{ success: boolean; created: number; updated: number; skipped: number }>(
      `/admin/movies/sync/trending?timeWindow=${timeWindow}&page=${page}`,
      { method: 'POST' },
    ),

  syncByExternalId: (externalId: string) =>
    request<{ success: boolean; movie: Movie; created: boolean; updated: boolean }>(
      `/admin/movies/sync/${externalId}`,
      { method: 'POST' },
    ),
};
