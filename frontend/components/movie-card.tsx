'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Star, Film } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
}

export function MovieCard({ movie }: MovieCardProps) {
  const posterSrc =
    movie.posterUrl ||
    movie.backdropUrl ||
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80';

  const ratingFormatted = movie.rating ? movie.rating.toFixed(1) : 'N/A';

  return (
    <Link
      href={`/movies/${movie.slug}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-[#14141c] border border-[#222230] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* Poster Image & Overlay Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#101016]">
        <img
          src={posterSrc}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Rating Badge */}
        {movie.rating ? (
          <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-amber-500/30 flex items-center gap-1 text-[11px] font-bold text-amber-400 shadow-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{ratingFormatted}</span>
          </div>
        ) : null}

        {/* Hover Overlay with Play Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg shadow-primary/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-3 space-y-1 bg-[#14141c] flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm text-neutral-100 line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="text-[11px] text-neutral-500 line-clamp-1 italic">
              {movie.originalTitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-[#1c1c28]">
          <span>{movie.releaseYear || 'Chưa rõ'}</span>
          {movie.genres && movie.genres.length > 0 && (
            <span className="text-neutral-400 truncate max-w-[100px]">
              {movie.genres[0].name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
