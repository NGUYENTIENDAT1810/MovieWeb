'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Film, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Movie } from '../../types';
import { MovieCard } from '../../components/movie-card';
import { MovieGridSkeleton } from '../../components/movie-skeleton';
import { useAuth } from '../../context/auth-context';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
      return;
    }

    async function loadFavorites() {
      if (!user) return;
      try {
        setIsLoading(true);
        const res = await api.getFavorites(1, 50);
        const movieList = res.items.map((item) => item.movie);
        setFavorites(movieList);
      } catch (err) {
        console.error('Failed to load favorites:', err);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadFavorites();
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (isLoading && user)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        <div className="h-8 bg-[#1e1e28] rounded w-64 animate-pulse" />
        <MovieGridSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      <div className="flex items-center justify-between border-b border-[#1e1e28] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-primary fill-primary" />
            <span>Phim Yêu Thích Của Bạn</span>
          </h1>
          <p className="text-xs text-neutral-400">
            Tổng cộng {favorites.length} bộ phim trong bộ sưu tập cá nhân
          </p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-[#121218] rounded-2xl border border-[#222230] space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Chưa có phim yêu thích</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Bạn chưa lưu bộ phim nào. Hãy khám phá và bấm biểu tượng trái tim để lưu phim bạn quan tâm.
          </p>
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            <span>Khám phá kho phim ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
