import React from 'react';

export function MovieSkeleton() {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-[#14141c] border border-[#222230] animate-pulse">
      <div className="aspect-[2/3] w-full bg-[#1b1b26]" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-[#232332] rounded w-3/4" />
        <div className="h-3 bg-[#1e1e2b] rounded w-1/2" />
        <div className="h-3 bg-[#191924] rounded w-full pt-1" />
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <MovieSkeleton key={index} />
      ))}
    </div>
  );
}
