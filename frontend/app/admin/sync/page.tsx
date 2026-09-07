'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  TrendingUp,
  Flame,
  Tag,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Terminal,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../../../lib/api';

interface SyncLog {
  id: string;
  action: string;
  timestamp: string;
  status: 'success' | 'error' | 'loading';
  details: string;
}

export default function AdminSyncPage() {
  // Action loading states
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Form states
  const [popularPage, setPopularPage] = useState<number>(1);
  const [trendingTimeWindow, setTrendingTimeWindow] = useState<'day' | 'week'>('day');
  const [trendingPage, setTrendingPage] = useState<number>(1);
  const [tmdbId, setTmdbId] = useState<string>('');

  // Logs
  const [logs, setLogs] = useState<SyncLog[]>([
    {
      id: 'init',
      action: 'Khởi tạo hệ thống đồng bộ',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      status: 'success',
      details: 'Sẵn sàng kết nối với TMDB API.',
    },
  ]);

  const addLog = (log: Omit<SyncLog, 'id' | 'timestamp'>) => {
    setLogs((prev) => [
      {
        ...log,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      },
      ...prev,
    ]);
  };

  // 1. Sync Genres
  const handleSyncGenres = async () => {
    try {
      setLoadingAction('genres');
      const res = await api.syncGenres();
      addLog({
        action: 'Đồng bộ Thể loại Phim',
        status: 'success',
        details: `Thành công! Đã xử lý ${res.totalTMDBGenres} thể loại TMDB, tạo mới ${res.createdGenres} thể loại.`,
      });
    } catch (err: any) {
      addLog({
        action: 'Đồng bộ Thể loại Phim',
        status: 'error',
        details: `Thất bại: ${err.message}`,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // 2. Sync Popular
  const handleSyncPopular = async () => {
    try {
      setLoadingAction('popular');
      const res = await api.syncPopular(popularPage);
      addLog({
        action: `Đồng bộ Phim Phổ Biến (Trang ${popularPage})`,
        status: 'success',
        details: `Thành công! Tạo mới: ${res.created} phim, Cập nhật: ${res.updated} phim, Bỏ qua: ${res.skipped}.`,
      });
    } catch (err: any) {
      addLog({
        action: `Đồng bộ Phim Phổ Biến (Trang ${popularPage})`,
        status: 'error',
        details: `Thất bại: ${err.message}`,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Sync Trending
  const handleSyncTrending = async () => {
    try {
      setLoadingAction('trending');
      const res = await api.syncTrending(trendingTimeWindow, trendingPage);
      addLog({
        action: `Đồng bộ Thịnh Hành (${trendingTimeWindow === 'day' ? 'Hôm nay' : 'Tuần này'}, Trang ${trendingPage})`,
        status: 'success',
        details: `Thành công! Tạo mới: ${res.created} phim, Cập nhật: ${res.updated} phim, Bỏ qua: ${res.skipped}.`,
      });
    } catch (err: any) {
      addLog({
        action: `Đồng bộ Thịnh Hành (${trendingTimeWindow})`,
        status: 'error',
        details: `Thất bại: ${err.message}`,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // 4. Sync by ID
  const handleSyncById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbId.trim()) return;

    try {
      setLoadingAction('id');
      const res = await api.syncByExternalId(tmdbId.trim());
      addLog({
        action: `Đồng bộ phim theo TMDB ID #${tmdbId}`,
        status: 'success',
        details: `Thành công! Phim: "${res.movie.title}" (${res.created ? 'Đã tạo mới' : 'Đã cập nhật'}).`,
      });
      setTmdbId('');
    } catch (err: any) {
      addLog({
        action: `Đồng bộ phim theo TMDB ID #${tmdbId}`,
        status: 'error',
        details: `Thất bại: ${err.message}`,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#1c1c28] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <RefreshCw className="w-7 h-7 text-primary" />
          <span>Trung Tâm Đồng Bộ TMDB</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Đồng bộ metadata chính thức từ The Movie Database (TMDB) vào PostgreSQL, tự động chuẩn hóa dữ liệu và phòng chống trùng lặp.
        </p>
      </div>

      {/* Info notice */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
        <p className="leading-relaxed">
          Tất cả yêu cầu đồng bộ được xử lý an toàn tại tầng Backend (NestJS). Frontend không bao giờ tiếp xúc trực tiếp với API key TMDB.
        </p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Sync Popular */}
        <div className="p-5 rounded-2xl bg-[#12121c] border border-[#202030] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Flame className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Đồng Bộ Phim Phổ Biến (Popular)</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Lấy danh sách các bộ phim đang được chú ý và có lượt tương tác cao nhất trên TMDB.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-neutral-400">Trang TMDB (1-10):</label>
              <select
                value={popularPage}
                onChange={(e) => setPopularPage(Number(e.target.value))}
                className="bg-[#181824] border border-[#28283c] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                  <option key={p} value={p}>
                    Trang {p} (20 phim)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSyncPopular}
              disabled={loadingAction !== null}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingAction === 'popular' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Flame className="w-4 h-4" />
              )}
              <span>Đồng Bộ Phim Phổ Biến</span>
            </button>
          </div>
        </div>

        {/* Card 2: Sync Trending */}
        <div className="p-5 rounded-2xl bg-[#12121c] border border-[#202030] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Đồng Bộ Phim Thịnh Hành (Trending)</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Lấy bảng xếp hạng phim thịnh hành theo ngày hoặc tuần từ thuật toán TMDB.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">Khung thời gian:</label>
                <select
                  value={trendingTimeWindow}
                  onChange={(e) => setTrendingTimeWindow(e.target.value as 'day' | 'week')}
                  className="w-full bg-[#181824] border border-[#28283c] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-primary"
                >
                  <option value="day">Trong Ngày (Day)</option>
                  <option value="week">Trong Tuần (Week)</option>
                </select>
              </div>
              <div>
                <label className="text-neutral-400 text-[11px] block mb-1">Trang TMDB:</label>
                <select
                  value={trendingPage}
                  onChange={(e) => setTrendingPage(Number(e.target.value))}
                  className="w-full bg-[#181824] border border-[#28283c] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-primary"
                >
                  {[1, 2, 3, 4, 5].map((p) => (
                    <option key={p} value={p}>
                      Trang {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSyncTrending}
              disabled={loadingAction !== null}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingAction === 'trending' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span>Đồng Bộ Phim Thịnh Hành</span>
            </button>
          </div>
        </div>

        {/* Card 3: Sync by TMDB ID */}
        <div className="p-5 rounded-2xl bg-[#12121c] border border-[#202030] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Search className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Đồng Bộ Theo ID Phim TMDB</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Nhập mã TMDB ID cụ thể của một bộ phim (Ví dụ: 550 cho Fight Club, 27205 cho Inception, 157336 cho Interstellar).
            </p>
          </div>

          <form onSubmit={handleSyncById} className="space-y-3 pt-2">
            <input
              type="text"
              required
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              placeholder="Nhập TMDB ID (ví dụ: 157336)..."
              className="w-full bg-[#181824] border border-[#28283c] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-primary font-mono"
            />
            <button
              type="submit"
              disabled={loadingAction !== null || !tmdbId.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingAction === 'id' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Đồng Bộ Phim Này</span>
            </button>
          </form>
        </div>

        {/* Card 4: Sync Genres */}
        <div className="p-5 rounded-2xl bg-[#12121c] border border-[#202030] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-400">
              <Tag className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Đồng Bộ Danh Mục Thể Loại</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Cập nhật toàn bộ các thể loại phim chuẩn từ TMDB (Hành động, Phiêu lưu, Hoạt hình, Khoa học viễn tưởng,...).
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSyncGenres}
              disabled={loadingAction !== null}
              className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingAction === 'genres' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Tag className="w-4 h-4" />
              )}
              <span>Đồng Bộ Toàn Bộ Thể Loại</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Console & Log History */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#101018] border border-[#222234] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c1c2c] pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span>Nhật Ký Thực Thi Đồng Bộ (Sync Console)</span>
          </h3>
          <span className="text-[11px] text-neutral-500 font-mono">
            {logs.length} sự kiện gần nhất
          </span>
        </div>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-[#141420] border border-[#1e1e2e] flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : log.status === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
                  )}
                  <span className="font-bold text-white">{log.action}</span>
                </div>
                <p className="text-neutral-400 text-[11px] pl-5">{log.details}</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-neutral-500 shrink-0 font-mono">
                <Clock className="w-3 h-3" />
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
