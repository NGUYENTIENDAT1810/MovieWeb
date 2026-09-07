'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon, Film, X } from 'lucide-react';
import { api } from '../../lib/api';
import { Movie } from '../../types';
import { MovieCard } from '../../components/movie-card';
import { MovieGridSkeleton } from '../../components/movie-skeleton';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setSearchQuery(queryParam);
    if (!queryParam.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    async function performSearch() {
      try {
        setIsLoading(true);
        const res = await api.search(queryParam.trim());
        setResults(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [queryParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Search Header Form */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Tìm Kiếm Phim
        </h1>
        <p className="text-sm text-neutral-400">
          Khám phá hàng ngàn bộ phim theo tựa đề, tên gốc hoặc nội dung
        </p>

        <form onSubmit={handleSearch} className="relative mt-4">
          <input
            type="text"
            placeholder="Nhập tên phim cần tìm (VD: Spider-Man, Batman, Bunny)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14141c] text-sm text-white placeholder-neutral-500 rounded-2xl pl-12 pr-12 py-3.5 border border-[#272736] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xl transition-all"
          />
          <SearchIcon className="w-5 h-5 text-neutral-400 absolute left-4 top-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                router.push('/search');
              }}
              className="absolute right-4 top-3.5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>

      {/* Results Header */}
      {queryParam && (
        <div className="flex items-center justify-between border-b border-[#1e1e28] pb-4">
          <p className="text-sm text-neutral-300">
            Kết quả tìm kiếm cho: <strong className="text-white">&ldquo;{queryParam}&rdquo;</strong>
          </p>
          <span className="text-xs text-neutral-500">Tìm thấy {total} kết quả</span>
        </div>
      )}

      {/* Results Grid */}
      {isLoading ? (
        <MovieGridSkeleton count={10} />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : queryParam ? (
        <div className="text-center py-20 bg-[#121218] rounded-2xl border border-[#222230] space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Film className="w-6 h-6" />
          </div>
          <p className="text-neutral-400 text-base">Không tìm thấy phim.</p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả.
          </p>
        </div>
      ) : (
        <div className="text-center py-16 text-neutral-500 text-xs">
          Nhập từ khóa phía trên để bắt đầu tìm kiếm phim.
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12"><MovieGridSkeleton count={10} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
