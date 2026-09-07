'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Layers,
  Users,
  Tag,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Movie } from '../../types';

interface AdminStats {
  totalMovies: number;
  totalEpisodes: number;
  totalUsers: number;
  totalGenres: number;
  recentMovies: Movie[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Tổng Số Phim',
      value: stats?.totalMovies ?? 0,
      icon: Film,
      color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'Tổng Số Tập Phim',
      value: stats?.totalEpisodes ?? 0,
      icon: Layers,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      title: 'Người Dùng Đăng Ký',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Thể Loại Phim',
      value: stats?.totalGenres ?? 0,
      icon: Tag,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c28] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Bảng Điều Khiển Quản Trị</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tổng quan số liệu và hoạt động dữ liệu phim thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/sync"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Đồng Bộ TMDB</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#12121c] border border-[#202030] flex items-center justify-between shadow-lg"
            >
              <div className="space-y-1">
                <span className="text-xs font-medium text-neutral-400">{card.title}</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {isLoading ? '...' : card.value.toLocaleString()}
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} border flex items-center justify-center shadow-inner`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#181826] to-[#12121c] border border-[#26263a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Trung Tâm Đồng Bộ Phim</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Cập nhật kho phim từ The Movie Database (TMDB)
          </h3>
          <p className="text-xs text-neutral-400">
            Đồng bộ metadata chuẩn quốc tế, poster chất lượng cao và thể loại tự động.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/sync"
            className="px-4 py-2.5 rounded-xl bg-[#222234] hover:bg-[#2c2c44] text-white text-xs font-semibold border border-[#34344c] flex items-center gap-1.5 transition-colors"
          >
            <span>Mở Bảng Đồng Bộ</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Synced Movies Table */}
      <div className="p-6 rounded-2xl bg-[#12121c] border border-[#202030] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Phim Mới Được Thêm Gần Đây</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Danh sách các bản ghi phim mới nhất trong hệ thống
            </p>
          </div>
          <Link
            href="/admin/movies"
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
          >
            <span>Xem tất cả phim</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-neutral-500">Đang tải số liệu...</div>
        ) : stats?.recentMovies && stats.recentMovies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#202030] text-neutral-400">
                <tr>
                  <th className="py-3 px-3">Phim</th>
                  <th className="py-3 px-3">Năm</th>
                  <th className="py-3 px-3">Điểm</th>
                  <th className="py-3 px-3">Thể loại</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a26]">
                {stats.recentMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-[#161622] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded bg-[#1c1c28] overflow-hidden shrink-0">
                          {movie.posterUrl ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600">
                              <Film className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white line-clamp-1">{movie.title}</div>
                          {movie.originalTitle && (
                            <div className="text-[11px] text-neutral-400 italic line-clamp-1">
                              {movie.originalTitle}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-neutral-300 font-mono">
                      {movie.releaseYear || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                        {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-300">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {movie.genres && movie.genres.length > 0 ? (
                          movie.genres.slice(0, 2).map((g) => (
                            <span
                              key={g.id}
                              className="px-1.5 py-0.5 rounded bg-[#1c1c28] text-[10px] text-neutral-400"
                            >
                              {g.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/movies/${movie.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202030] hover:bg-[#2c2c40] text-neutral-300 hover:text-white transition-colors"
                      >
                        <span>Xem</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-neutral-500">
            Chưa có phim nào trong hệ thống. Hãy truy cập trang Đồng Bộ TMDB để nạp phim!
          </div>
        )}
      </div>
    </div>
  );
}
