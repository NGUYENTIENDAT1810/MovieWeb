'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Film,
  Star,
  Calendar,
  Share2,
  Heart,
  List,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Movie, Episode } from '../../../../types';
import { VideoPlayer } from '../../../../components/video-player';
import { useAuth } from '../../../../context/auth-context';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const movieId = params.movieId as string;
  const episodeId = params.episodeId as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function loadWatchData() {
      try {
        setIsLoading(true);
        // Load movie
        const movieData = await api.getMovieById(movieId).catch(() => null);
        if (!movieData) {
          router.push('/movies');
          return;
        }
        setMovie(movieData);

        // Load episodes
        const epList = await api.getEpisodes(movieId).catch(() => []);
        setEpisodes(epList);

        // Find current episode
        let targetEp = epList.find((ep) => ep.id === episodeId);
        if (!targetEp && epList.length > 0) {
          targetEp = epList[0];
        }
        setCurrentEpisode(targetEp || null);

        // Check favorite
        if (user) {
          const fav = await api.checkFavoriteStatus(movieId).catch(() => ({ isFavorite: false }));
          setIsFavorite(fav.isFavorite);
        }
      } catch (err) {
        console.error('Failed to load watch data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (movieId) {
      loadWatchData();
    }
  }, [movieId, episodeId, user, router]);

  // Previous and Next Episode logic
  const currentEpIndex = episodes.findIndex((ep) => ep.id === currentEpisode?.id);
  const prevEpisode = currentEpIndex > 0 ? episodes[currentEpIndex - 1] : null;
  const nextEpisode =
    currentEpIndex >= 0 && currentEpIndex < episodes.length - 1
      ? episodes[currentEpIndex + 1]
      : null;

  const handleNextEpisode = () => {
    if (nextEpisode) {
      router.push(`/watch/${movieId}/${nextEpisode.id}`);
    }
  };

  if (isLoading || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 space-y-6 animate-pulse">
        <div className="aspect-video w-full bg-[#14141c] rounded-2xl" />
        <div className="h-8 bg-[#1e1e28] rounded w-1/3" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href={`/movies/${movie.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chi tiết: <strong className="text-white">{movie.title}</strong></span>
        </Link>
      </div>

      {/* Main Video Player & Next Episode Navigation */}
      <div className="space-y-4">
        <VideoPlayer
          videoUrl={currentEpisode?.videoUrl}
          thumbnailUrl={currentEpisode?.thumbnailUrl || movie.backdropUrl || movie.posterUrl}
          movieId={movie.id}
          episodeId={currentEpisode?.id || episodeId}
          onEnded={handleNextEpisode}
        />

        {/* Episode Quick Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#14141c] border border-[#222230]">
          <div>
            <span className="text-xs text-neutral-400">Đang phát:</span>
            <h3 className="text-sm font-bold text-white">
              {currentEpisode ? `Tập ${currentEpisode.episodeNumber}: ${currentEpisode.title}` : movie.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!prevEpisode}
              onClick={() => prevEpisode && router.push(`/watch/${movieId}/${prevEpisode.id}`)}
              className="px-3 py-1.5 rounded-lg bg-[#1e1e2a] hover:bg-[#282838] text-white text-xs font-medium border border-[#2c2c3e] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Tập trước</span>
            </button>

            <button
              disabled={!nextEpisode}
              onClick={handleNextEpisode}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all hover:scale-105"
            >
              <span>Tập tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Movie Details & Episode Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Movie Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2 border-b border-[#1e1e28] pb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {movie.title}
            </h1>
            {movie.originalTitle && (
              <p className="text-xs text-neutral-400 italic">{movie.originalTitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold">
              {movie.rating ? (
                <div className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
              ) : null}

              {movie.releaseYear && (
                <span className="px-2.5 py-1 rounded-md bg-[#181824] text-neutral-300 border border-[#282838]">
                  {movie.releaseYear}
                </span>
              )}

              {movie.country && (
                <span className="px-2.5 py-1 rounded-md bg-[#181824] text-neutral-300 border border-[#282838]">
                  {movie.country}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Nội Dung Phim
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {movie.overview || 'Chưa có thông tin nội dung.'}
            </p>
          </div>
        </div>

        {/* Right Column: Episode Selector Grid */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#121218] border border-[#222230] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c1c26] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <List className="w-4 h-4 text-primary" />
                <span>Danh Sách Tập ({episodes.length})</span>
              </h3>
            </div>

            {episodes.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {episodes.map((ep) => {
                  const isCurrent = ep.id === currentEpisode?.id;
                  return (
                    <Link
                      key={ep.id}
                      href={`/watch/${movie.id}/${ep.id}`}
                      className={`p-2.5 rounded-xl text-center font-bold text-xs border transition-all ${
                        isCurrent
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105'
                          : 'bg-[#181824] text-neutral-300 border-[#282838] hover:bg-[#222234] hover:text-white'
                      }`}
                    >
                      Tập {ep.episodeNumber}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 py-4 text-center">
                Chưa có danh sách tập.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
