'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { Movie, Genre } from '../../types';
import { MovieCard } from '../../components/movie-card';
import { MovieGridSkeleton } from '../../components/movie-skeleton';

function MoviesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentGenre = searchParams.get('genre') || '';
  const currentSort = searchParams.get('sort') || 'latest';
  const currentYear = searchParams.get('year') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const list = await api.getGenres();
        setGenres(list);
      } catch (err) {
        console.error('Failed to load genres:', err);
      }
    }
    fetchGenres();
  }, []);

  useEffect(() => {
    async function loadMovies() {
      try {
        setIsLoading(true);
        const res = await api.getMovies({
          genre: currentGenre || undefined,
          sort: currentSort,
          year: currentYear ? Number(currentYear) : undefined,
          page: currentPage,
          limit: 20,
        });

        setMovies(res.items || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Failed to load movies:', err);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadMovies();
  }, [currentGenre, currentSort, currentYear, currentPage]);

  const updateFilters = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });
    router.push(`/movies?${params.toString()}`);
  };

  const years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e1e28] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Khám Phá Kho Phim
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Hiển thị {movies.length} trên tổng số {total} bộ phim chất lượng cao
          </p>
        </div>

        {/* Filter Badges / Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Genre Filter */}
          <select
            value={currentGenre}
            onChange={(e) => updateFilters({ genre: e.target.value, page: 1 })}
            className="bg-[#161622] text-xs font-medium text-white border border-[#272736] rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="">Tất Cả Thể Loại</option>
            {genres.map((g) => (
              <option key={g.id} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={currentYear}
            onChange={(e) => updateFilters({ year: e.target.value, page: 1 })}
            className="bg-[#161622] text-xs font-medium text-white border border-[#272736] rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="">Tất Cả Năm</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
            className="bg-[#161622] text-xs font-medium text-white border border-[#272736] rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="latest">Mới Nhất</option>
            <option value="popular">Phổ Biến Nhất</option>
            <option value="rating">Đánh Giá Cao</option>
            <option value="title_asc">Tên (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <MovieGridSkeleton count={20} />
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#121218] rounded-2xl border border-[#222230] space-y-4">
          <p className="text-neutral-400 text-base">Không tìm thấy phim phù hợp với bộ lọc.</p>
          <button
            onClick={() => router.push('/movies')}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#1e1e28]">
          <button
            disabled={currentPage <= 1}
            onClick={() => updateFilters({ page: currentPage - 1 })}
            className="px-4 py-2 rounded-xl bg-[#181822] text-white text-xs font-medium border border-[#282836] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#222230] transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang Trước</span>
          </button>

          <span className="text-xs font-medium text-neutral-400 px-3">
            Trang <strong className="text-white">{currentPage}</strong> / {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => updateFilters({ page: currentPage + 1 })}
            className="px-4 py-2 rounded-xl bg-[#181822] text-white text-xs font-medium border border-[#282836] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#222230] transition-colors flex items-center gap-1"
          >
            <span>Trang Sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12"><MovieGridSkeleton count={10} /></div>}>
      <MoviesContent />
    </Suspense>
  );
}
