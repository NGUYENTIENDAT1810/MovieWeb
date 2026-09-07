export interface TmdbMovieItem {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  status?: string;
  production_countries?: { iso_3166_1: string; name: string }[];
}

export interface TmdbListResponse {
  page: number;
  results: TmdbMovieItem[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbGenreResponse {
  genres: TmdbGenre[];
}

export interface TmdbCreditsResponse {
  id: number;
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
}

export interface TmdbImagesResponse {
  id: number;
  backdrops: { file_path: string }[];
  posters: { file_path: string }[];
}

export interface SyncResult {
  success: boolean;
  message?: string;
  created: number;
  updated: number;
  skipped: number;
  totalProcessed: number;
}
