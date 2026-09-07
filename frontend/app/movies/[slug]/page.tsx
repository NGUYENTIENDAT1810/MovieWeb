'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Heart,
  Star,
  Calendar,
  Clock,
  Globe,
  Film,
  ArrowLeft,
  Check,
  Share2,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Movie, Episode } from '../../../types';
import { useAuth } from '../../../context/auth-context';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMovie() {
      try {
        setIsLoading(true);
        setError(null);
        const movieData = await api.getMovieBySlug(slug);
        setMovie(movieData);

        const epList = await api.getEpisodes(movieData.id).catch(() => []);
        setEpisodes(epList);

        if (user) {
          const favStatus = await api.checkFavoriteStatus(movieData.id).catch(() => ({ isFavorite: false }));
          setIsFavorite(favStatus.isFavorite);
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin bộ phim');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      loadMovie();
    }
  }, [slug, user]);

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!movie) return;

    try {
      setIsFavLoading(true);
      if (isFavorite) {
        await api.removeFavorite(movie.id);
        setIsFavorite(false);
      } else {
        await api.addFavorite(movie.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsFavLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 animate-pulse space-y-8">
        <div className="h-8 bg-[#1e1e28] rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="aspect-[2/3] bg-[#1a1a24] rounded-2xl" />
          <div className="md:col-span-2 space-y-4">
            <div className="h-10 bg-[#222230] rounded w-3/4" />
            <div className="h-5 bg-[#1a1a24] rounded w-1/2" />
            <div className="h-24 bg-[#161620] rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-32 pb-20 text-center space-y-6">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 w-16 h-16 mx-auto flex items-center justify-center">
          <Film className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Không tìm thấy phim</h2>
        <p className="text-neutral-400 text-sm">{error || 'Bộ phim này không tồn tại hoặc đã bị gỡ.'}</p>
        <Link
          href="/movies"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về danh sách phim</span>
        </Link>
      </div>
    );
  }

  const backdropSrc =
    movie.backdropUrl ||
    movie.posterUrl ||
    'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1600&q=80';

  const posterSrc =
    movie.posterUrl ||
    movie.backdropUrl ||
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80';

  const firstEpisodeId = episodes.length > 0 ? episodes[0].id : 'ep-1';

  return (
    <div className="relative min-h-screen pb-20">
      {/* Background Cinematic Backdrop with Glow */}
      <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden -z-10">
        <img
          src={backdropSrc}
          alt={movie.title}
          className="w-full h-full object-cover object-center filter blur-md opacity-25 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-12">
        {/* Back Link */}
        <Link
          href="/movies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại kho phim</span>
        </Link>

        {/* Main Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Poster Column */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a38] aspect-[2/3] bg-[#121218]">
              <img src={posterSrc} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2.5">
              <Link
                href={`/watch/${movie.id}/${firstEpisodeId}`}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-center flex items-center justify-center gap-2 shadow-xl shadow-primary/30 transition-all hover:scale-[1.02]"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Xem Phim Ngay</span>
              </Link>

              <button
                onClick={toggleFavorite}
                disabled={isFavLoading}
                className={`w-full py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  isFavorite
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-[#181824] text-neutral-200 border-[#2a2a3a] hover:bg-[#222232]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
                <span>{isFavorite ? 'Đã Lưu Yêu Thích' : 'Thêm Vào Yêu Thích'}</span>
              </button>
            </div>
          </div>

          {/* Metadata & Overview Column */}
          <div className="md:col-span-2 lg:col-span-3 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="text-sm sm:text-base text-neutral-400 italic">
                  {movie.originalTitle}
                </p>
              )}
            </div>

            {/* Badges & Statistics */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              {movie.rating ? (
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{movie.rating.toFixed(1)} / 10 ({movie.voteCount || 0} lượt)</span>
                </div>
              ) : null}

              {movie.releaseYear && (
                <div className="px-3 py-1.5 rounded-lg bg-[#181824] text-neutral-300 border border-[#282838] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{movie.releaseYear}</span>
                </div>
              )}

              {movie.runtime && (
                <div className="px-3 py-1.5 rounded-lg bg-[#181824] text-neutral-300 border border-[#282838] flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{movie.runtime} phút</span>
                </div>
              )}

              {movie.country && (
                <div className="px-3 py-1.5 rounded-lg bg-[#181824] text-neutral-300 border border-[#282838] flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>{movie.country}</span>
                </div>
              )}
            </div>

            {/* Genre Pills */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Thể Loại:
                </span>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <Link
                      key={g.id}
                      href={`/movies?genre=${g.slug}`}
                      className="px-3 py-1 rounded-full bg-[#1c1c28] hover:bg-primary text-xs font-medium text-neutral-200 border border-[#2e2e40] transition-colors"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Tóm Tắt Nội Dung
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {movie.overview || 'Chưa có thông tin tóm tắt cho bộ phim này.'}
              </p>
            </div>

            {/* Episodes List Section */}
            <div className="space-y-4 pt-6 border-t border-[#1e1e28]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-primary" />
                  <span>Danh Sách Tập Phim ({episodes.length})</span>
                </h3>
              </div>

              {episodes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {episodes.map((ep) => (
                    <Link
                      key={ep.id}
                      href={`/watch/${movie.id}/${ep.id}`}
                      className="p-3 rounded-xl bg-[#14141c] hover:bg-[#1e1e2a] border border-[#242434] hover:border-primary/50 transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white group-hover:text-primary">
                          Tập {ep.episodeNumber}
                        </span>
                        <p className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                          {ep.title}
                        </p>
                      </div>
                      <Play className="w-4 h-4 text-neutral-500 group-hover:text-primary group-hover:fill-primary" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#14141c] border border-[#222230] text-xs text-neutral-400">
                  Phim đang được cập nhật tập mới. Bấm &quot;Xem Phim Ngay&quot; để phát nội dung demo.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
