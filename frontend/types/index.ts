export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Episode {
  id: string;
  movieId: string;
  externalId?: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  overview?: string;
  thumbnailUrl?: string;
  duration?: number;
  videoUrl?: string;
  subtitleUrl?: string;
  source?: string;
}

export interface Movie {
  id: string;
  externalId?: string;
  title: string;
  originalTitle?: string;
  slug: string;
  overview?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseDate?: string;
  releaseYear?: number;
  rating?: number;
  voteCount?: number;
  runtime?: number;
  status?: string;
  country?: string;
  originalLanguage?: string;
  source?: string;
  genres?: Genre[];
  episodes?: Episode[];
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  genre?: Genre;
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  _count?: {
    favorites: number;
    watchHistory: number;
  };
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  movieId: string;
  episodeId?: string;
  progressSeconds: number;
  completed: boolean;
  updatedAt: string;
  movie: Movie;
  episode?: Episode;
}
