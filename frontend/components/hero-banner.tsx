'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Info, Star, Calendar, Clock } from 'lucide-react';
import { Movie } from '../types';

interface HeroBannerProps {
  movie: Movie | null;
}

export function HeroBanner({ movie }: HeroBannerProps) {
  if (!movie) {
    return (
      <div className="relative w-full h-[65vh] min-h-[480px] max-h-[700px] bg-[#111118] animate-pulse flex items-end p-8">
        <div className="max-w-2xl space-y-4">
          <div className="h-10 bg-[#222230] rounded w-3/4" />
          <div className="h-4 bg-[#1b1b26] rounded w-full" />
          <div className="h-4 bg-[#1b1b26] rounded w-2/3" />
        </div>
      </div>
    );
  }

  const backdropSrc =
    movie.backdropUrl ||
    movie.posterUrl ||
    'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1600&q=80';

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden">
      {/* Backdrop Image */}
      <img
        src={backdropSrc}
        alt={movie.title}
        className="w-full h-full object-cover object-center scale-105 filter brightness-75"
      />

      {/* Cinematic Gradients Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 pt-20">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            {movie.rating ? (
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{movie.rating.toFixed(1)} Điểm</span>
              </span>
            ) : null}

            {movie.releaseYear && (
              <span className="px-2.5 py-1 rounded-md bg-neutral-800/80 text-neutral-300 border border-neutral-700/60 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{movie.releaseYear}</span>
              </span>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-primary/20 text-primary border border-primary/30">
                {movie.genres.map((g) => g.name).slice(0, 2).join(' • ')}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            {movie.title}
          </h1>

          {/* Overview */}
          {movie.overview && (
            <p className="text-sm sm:text-base text-neutral-300 line-clamp-3 leading-relaxed drop-shadow">
              {movie.overview}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/movies/${movie.slug}`}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-primary/30 transition-all duration-200 hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Xem Phim</span>
            </Link>

            <Link
              href={`/movies/${movie.slug}`}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-md border border-white/20 flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <Info className="w-5 h-5" />
              <span>Thông Tin Chi Tiết</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
