'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Film, Compass, Play, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { Movie, Genre, WatchHistoryItem } from '../types';
import { HeroBanner } from '../components/hero-banner';
import { MovieRow } from '../components/movie-row';
import { MovieCard } from '../components/movie-card';
import { MovieGridSkeleton } from '../components/movie-skeleton';
import { useAuth } from '../context/auth-context';

export default function HomePage() {
  const { user } = useAuth();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [trendingRes, popularRes, latestRes, genresRes] = await Promise.all([
          api.getTrending(1, 10).catch(() => ({ items: [] })),
          api.getPopular(1, 10).catch(() => ({ items: [] })),
          api.getLatest(1, 10).catch(() => ({ items: [] })),
          api.getGenres().catch(() => []),
        ]);

        setTrendingMovies(trendingRes.items || []);
        setPopularMovies(popularRes.items || []);
        setLatestMovies(latestRes.items || []);
        setGenres(genresRes || []);

        if (user) {
          const historyRes = await api.getHistory(1, 5).catch(() => ({ items: [] }));
          setContinueWatching(historyRes.items || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  const heroMovie = trendingMovies.length > 0 ? trendingMovies[0] : null;

  return (
    <main className="space-y-12 pb-16">
      {/* 1. Hero Movie Banner */}
      <HeroBanner movie={heroMovie} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* 2. Quick Genre Filter Tags */}
        {genres.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
              <Compass className="w-4 h-4 text-primary" />
              <span>Thể Loại Phổ Biến</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Link
                href="/movies"
                className="shrink-0 px-4 py-2 rounded-full bg-[#1e1e28] hover:bg-primary text-xs font-semibold text-white transition-all shadow-md"
              >
                Tất cả phim
              </Link>
              {genres.slice(0, 12).map((genre) => (
                <Link
                  key={genre.id}
                  href={`/movies?genre=${genre.slug}`}
                  className="shrink-0 px-4 py-2 rounded-full bg-[#14141c] hover:bg-[#20202c] hover:text-primary text-xs font-medium text-neutral-300 border border-[#252534] transition-all"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 3. Continue Watching (for logged in users with history) */}
        {user && continueWatching.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Tiếp Tục Xem</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {continueWatching.map((item) => (
                <Link
                  key={item.id}
                  href={`/watch/${item.movieId}/${item.episodeId || 'ep-1'}`}
                  className="group relative rounded-xl overflow-hidden bg-[#14141c] border border-[#242434] hover:border-amber-500/50 transition-all hover:scale-[1.02]"
                >
                  <div className="aspect-video w-full bg-[#101016] relative overflow-hidden">
                    <img
                      src={
                        item.movie.backdropUrl ||
                        item.movie.posterUrl ||
                        'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&q=80'
                      }
                      alt={item.movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-xs text-white truncate group-hover:text-amber-400">
                      {item.movie.title}
                    </h4>
                    <p className="text-[10px] text-neutral-400 pt-0.5">
                      Đã xem {Math.floor(item.progressSeconds / 60)} phút
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. Trending Movies Row */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-6 bg-[#1a1a24] rounded w-48 animate-pulse" />
            <MovieGridSkeleton count={5} />
          </div>
        ) : (
          <MovieRow
            title="Phim Thịnh Hành Hôm Nay"
            movies={trendingMovies}
            viewAllHref="/movies?sort=popular"
          />
        )}

        {/* 5. Popular Movies Row */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-6 bg-[#1a1a24] rounded w-48 animate-pulse" />
            <MovieGridSkeleton count={5} />
          </div>
        ) : (
          <MovieRow
            title="Được Đánh Giá Cao Nhất"
            movies={popularMovies}
            viewAllHref="/movies?sort=rating"
          />
        )}

        {/* 6. Latest Movies Row */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-6 bg-[#1a1a24] rounded w-48 animate-pulse" />
            <MovieGridSkeleton count={5} />
          </div>
        ) : (
          <MovieRow
            title="Phim Mới Cập Nhật"
            movies={latestMovies}
            viewAllHref="/movies?sort=latest"
          />
        )}
      </div>
    </main>
  );
}
