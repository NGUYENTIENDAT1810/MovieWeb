'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Film,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  PlaySquare,
  Sparkles,
  Layers,
  Save,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Movie, Episode } from '../../../types';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Movie Modal State
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    originalTitle: string;
    overview: string;
    posterUrl: string;
    backdropUrl: string;
    releaseYear: number | undefined;
    rating: number | undefined;
    country: string;
  }>({
    title: '',
    originalTitle: '',
    overview: '',
    posterUrl: '',
    backdropUrl: '',
    releaseYear: undefined,
    rating: undefined,
    country: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Episode Manager Modal State
  const [episodeManagingMovie, setEpisodeManagingMovie] = useState<Movie | null>(null);
  const [movieEpisodes, setMovieEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Partial<Episode> | null>(null);
  const [isSavingEpisode, setIsSavingEpisode] = useState(false);

  const fetchMovies = async (currentPage = 1, searchQuery = search) => {
    try {
      setIsLoading(true);
      const res = await api.getMovies({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        sort: 'latest',
      });
      setMovies(res.items);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch (err: any) {
      console.error('Failed to fetch movies:', err);
      setNotification({ type: 'error', message: err.message || 'Lỗi khi tải danh sách phim' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(page, search);
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMovies(1, search);
  };

  // Movie Edit handlers
  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setEditForm({
      title: movie.title || '',
      originalTitle: movie.originalTitle || '',
      overview: movie.overview || '',
      posterUrl: movie.posterUrl || '',
      backdropUrl: movie.backdropUrl || '',
      releaseYear: movie.releaseYear,
      rating: movie.rating,
      country: movie.country || '',
    });
  };

  const closeEditModal = () => {
    setEditingMovie(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;

    try {
      setIsSaving(true);
      const updated = await api.updateMovie(editingMovie.id, {
        title: editForm.title,
        originalTitle: editForm.originalTitle,
        overview: editForm.overview,
        posterUrl: editForm.posterUrl,
        backdropUrl: editForm.backdropUrl,
        releaseYear: editForm.releaseYear ? Number(editForm.releaseYear) : undefined,
        rating: editForm.rating ? Number(editForm.rating) : undefined,
        country: editForm.country,
      });

      setMovies((prev) =>
        prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)),
      );
      setNotification({ type: 'success', message: `Đã cập nhật phim "${updated.title}"` });
      closeEditModal();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Cập nhật thất bại' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    try {
      setIsDeleting(true);
      await api.deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setDeleteConfirmId(null);
      setNotification({ type: 'success', message: 'Đã xóa phim thành công' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Xóa phim thất bại' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Episode Manager Handlers
  const openEpisodeManager = async (movie: Movie) => {
    setEpisodeManagingMovie(movie);
    setEditingEpisode(null);
    try {
      setIsLoadingEpisodes(true);
      const eps = await api.getEpisodes(movie.id);
      setMovieEpisodes(eps);
    } catch (err) {
      console.error('Failed to load episodes:', err);
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  const closeEpisodeManager = () => {
    setEpisodeManagingMovie(null);
    setEditingEpisode(null);
  };

  const handlePresetDemoStreams = async () => {
    if (!episodeManagingMovie) return;
    try {
      setIsLoadingEpisodes(true);
      const res = await api.presetDemoEpisodes(episodeManagingMovie.id);
      const eps = await api.getEpisodes(episodeManagingMovie.id);
      setMovieEpisodes(eps);
      setNotification({ type: 'success', message: res.message });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Nạp demo stream thất bại' });
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!episodeManagingMovie || !editingEpisode) return;

    try {
      setIsSavingEpisode(true);
      if (editingEpisode.id) {
        // Update
        await api.updateEpisode(editingEpisode.id, {
          title: editingEpisode.title,
          episodeNumber: editingEpisode.episodeNumber,
          seasonNumber: editingEpisode.seasonNumber || 1,
          videoUrl: editingEpisode.videoUrl || undefined,
          subtitleUrl: editingEpisode.subtitleUrl || undefined,
          duration: editingEpisode.duration ? Number(editingEpisode.duration) : undefined,
          overview: editingEpisode.overview,
        });
        setNotification({ type: 'success', message: 'Đã cập nhật nguồn phát tập phim' });
      } else {
        // Create
        await api.createEpisode({
          movieId: episodeManagingMovie.id,
          title: editingEpisode.title || `Tập ${(movieEpisodes.length || 0) + 1}`,
          episodeNumber: editingEpisode.episodeNumber || (movieEpisodes.length || 0) + 1,
          seasonNumber: editingEpisode.seasonNumber || 1,
          videoUrl: editingEpisode.videoUrl || undefined,
          subtitleUrl: editingEpisode.subtitleUrl || undefined,
          duration: editingEpisode.duration ? Number(editingEpisode.duration) : undefined,
          overview: editingEpisode.overview,
        });
        setNotification({ type: 'success', message: 'Đã tạo tập phim mới thành công' });
      }

      const refreshed = await api.getEpisodes(episodeManagingMovie.id);
      setMovieEpisodes(refreshed);
      setEditingEpisode(null);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Lưu tập phim thất bại' });
    } finally {
      setIsSavingEpisode(false);
    }
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!episodeManagingMovie) return;
    try {
      await api.deleteEpisode(episodeId);
      setMovieEpisodes((prev) => prev.filter((ep) => ep.id !== episodeId));
      setNotification({ type: 'success', message: 'Đã xóa tập phim' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Xóa tập phim thất bại' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c28] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Quản Lý Danh Sách Phim
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tìm kiếm, chỉnh sửa metadata và quản lý nguồn phát video HLS/MP4 ({totalCount} phim)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/sync"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Đồng Bộ Thêm Phim</span>
          </Link>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="hover:opacity-70 text-neutral-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm phim theo tên, tên gốc..."
            className="w-full bg-[#12121c] border border-[#222234] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#1e1e2c] hover:bg-[#28283c] text-white text-xs font-bold rounded-xl border border-[#2c2c40] transition-colors"
        >
          Tìm Kiếm
        </button>
      </form>

      {/* Movie Table */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#12121c] border border-[#202030]">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Đang tải danh sách phim...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#202030] text-neutral-400">
                <tr>
                  <th className="py-3 px-3">Phim</th>
                  <th className="py-3 px-3">Năm</th>
                  <th className="py-3 px-3">Điểm Đánh Giá</th>
                  <th className="py-3 px-3">Nguồn</th>
                  <th className="py-3 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181824]">
                {movies.map((movie) => (
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
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            ID: {movie.id.slice(0, 8)}...
                          </div>
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
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#1e1e2c] text-neutral-300 font-mono text-[10px] uppercase">
                        {movie.source || 'TMDB'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEpisodeManager(movie)}
                          className="p-2 rounded-lg bg-[#1a1a26] hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                          title="Quản lý tập & Nguồn phát video"
                        >
                          <PlaySquare className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline text-[11px] font-semibold">Nguồn Video</span>
                        </button>
                        <Link
                          href={`/movies/${movie.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg bg-[#1a1a26] hover:bg-[#242436] text-neutral-300 hover:text-white transition-colors"
                          title="Xem trên web"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(movie)}
                          className="p-2 rounded-lg bg-[#1a1a26] hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-colors"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(movie.id)}
                          className="p-2 rounded-lg bg-[#1a1a26] hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                          title="Xóa phim"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-neutral-400">
            Không tìm thấy phim nào phù hợp với từ khóa tìm kiếm.
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#1e1e2c] mt-4 text-xs">
            <span className="text-neutral-400">
              Trang {page} / {totalPages} (Tổng {totalCount} phim)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] text-white disabled:opacity-40 disabled:cursor-not-allowed border border-[#282838] flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] text-white disabled:opacity-40 disabled:cursor-not-allowed border border-[#282838] flex items-center gap-1 transition-colors"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Episode & Video Source Manager Modal */}
      {episodeManagingMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#12121c] border border-[#26263a] rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-[#202030] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlaySquare className="w-5 h-5 text-amber-400" />
                  <span>Quản Lý Tập Phim & Nguồn Video</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Phim: <strong className="text-white">{episodeManagingMovie.title}</strong>
                </p>
              </div>
              <button
                onClick={closeEpisodeManager}
                className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1a26]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#181824] border border-[#28283c]">
              <div className="text-xs text-neutral-300">
                <span>Hiện có: <strong>{movieEpisodes.length}</strong> tập phim</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePresetDemoStreams}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Nạp Demo HLS/MP4 Hợp Pháp</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingEpisode({
                      episodeNumber: (movieEpisodes.length || 0) + 1,
                      seasonNumber: 1,
                      title: `Tập ${(movieEpisodes.length || 0) + 1}`,
                      videoUrl: '',
                      subtitleUrl: '',
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Tập Mới</span>
                </button>
              </div>
            </div>

            {/* Episode Edit Form (If opened) */}
            {editingEpisode && (
              <form onSubmit={handleSaveEpisode} className="p-4 rounded-xl bg-[#161622] border border-primary/30 space-y-4 text-xs animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#242436] pb-2">
                  <span className="font-bold text-white text-sm">
                    {editingEpisode.id ? 'Chỉnh Sửa Tập Phim' : 'Thêm Tập Phim Mới'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingEpisode(null)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-neutral-300 font-semibold">Tên Tập</label>
                    <input
                      type="text"
                      required
                      value={editingEpisode.title || ''}
                      onChange={(e) => setEditingEpisode({ ...editingEpisode, title: e.target.value })}
                      placeholder="Ví dụ: Tập 1: Mở đầu"
                      className="w-full bg-[#1c1c2a] border border-[#2c2c40] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-300 font-semibold">Số Tập (Episode #)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editingEpisode.episodeNumber || 1}
                      onChange={(e) =>
                        setEditingEpisode({ ...editingEpisode, episodeNumber: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-[#1c1c2a] border border-[#2c2c40] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-300 font-semibold">Thời Lượng (Phút)</label>
                    <input
                      type="number"
                      min="1"
                      value={editingEpisode.duration || ''}
                      onChange={(e) =>
                        setEditingEpisode({
                          ...editingEpisode,
                          duration: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="Ví dụ: 45"
                      className="w-full bg-[#1c1c2a] border border-[#2c2c40] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold flex items-center justify-between">
                    <span>HLS (.m3u8) hoặc MP4 Video Stream URL</span>
                    <span className="text-[10px] text-neutral-500 font-normal">Hỗ trợ HLS Multi-bitrate & MP4 Fallback</span>
                  </label>
                  <input
                    type="url"
                    value={editingEpisode.videoUrl || ''}
                    onChange={(e) => setEditingEpisode({ ...editingEpisode, videoUrl: e.target.value })}
                    placeholder="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8 hoặc .mp4..."
                    className="w-full bg-[#1c1c2a] border border-[#2c2c40] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">WebVTT (.vtt) Subtitle URL (Tùy chọn)</label>
                  <input
                    type="url"
                    value={editingEpisode.subtitleUrl || ''}
                    onChange={(e) => setEditingEpisode({ ...editingEpisode, subtitleUrl: e.target.value })}
                    placeholder="https://example.com/subtitles/vi.vtt"
                    className="w-full bg-[#1c1c2a] border border-[#2c2c40] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingEpisode(null)}
                    className="px-3 py-1.5 rounded-lg bg-[#202030] text-neutral-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEpisode}
                    className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold flex items-center gap-1.5 shadow-md shadow-primary/20"
                  >
                    {isSavingEpisode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Lưu Tập Phim</span>
                  </button>
                </div>
              </form>
            )}

            {/* Episodes List Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Danh Sách Tập Phim
              </h4>

              {isLoadingEpisodes ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <span>Đang tải danh sách tập...</span>
                </div>
              ) : movieEpisodes.length > 0 ? (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {movieEpisodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="p-3 rounded-xl bg-[#161622] border border-[#242436] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold text-[10px]">
                            Tập {ep.episodeNumber}
                          </span>
                          <span className="font-bold text-white truncate">{ep.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono truncate">
                          {ep.videoUrl ? (
                            <span className="text-emerald-400 truncate max-w-md">
                              ▶ {ep.videoUrl}
                            </span>
                          ) : (
                            <span className="text-amber-400">⚠ Chưa có video URL</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/watch/${episodeManagingMovie.id}/${ep.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-[#202030] hover:bg-[#2a2a40] text-neutral-300 hover:text-white"
                          title="Xem thử tập này"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setEditingEpisode(ep)}
                          className="p-1.5 rounded-lg bg-[#202030] hover:bg-cyan-500/20 text-cyan-400"
                          title="Sửa nguồn phát"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEpisode(ep.id)}
                          className="p-1.5 rounded-lg bg-[#202030] hover:bg-rose-500/20 text-rose-400"
                          title="Xóa tập này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500 border border-dashed border-[#26263a] rounded-xl">
                  Chưa có tập phim nào. Bấm "Nạp Demo HLS/MP4 Hợp Pháp" hoặc "Thêm Tập Mới" để tạo luồng phát.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#202030] flex justify-end">
              <button
                type="button"
                onClick={closeEpisodeManager}
                className="px-4 py-2 rounded-xl bg-[#202030] hover:bg-[#2a2a40] text-white text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Movie Metadata Modal */}
      {editingMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#12121c] border border-[#26263a] rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-[#202030] pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                <span>Chỉnh Sửa Metadata Phim</span>
              </h3>
              <button
                onClick={closeEditModal}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-[#1a1a26]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold">Tên Phim</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-[#181824] border border-[#28283c] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold">Tên Gốc (Original Title)</label>
                <input
                  type="text"
                  value={editForm.originalTitle}
                  onChange={(e) => setEditForm({ ...editForm, originalTitle: e.target.value })}
                  className="w-full bg-[#181824] border border-[#28283c] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-semibold">Năm Phát Hành</label>
                  <input
                    type="number"
                    value={editForm.releaseYear ?? ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        releaseYear: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-[#181824] border border-[#28283c] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-semibold">Điểm Đánh Giá (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editForm.rating ?? ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        rating: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-[#181824] border border-[#28283c] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold">URL Poster</label>
                <input
                  type="url"
                  value={editForm.posterUrl}
                  onChange={(e) => setEditForm({ ...editForm, posterUrl: e.target.value })}
                  placeholder="https://image.tmdb.org/t/p/..."
                  className="w-full bg-[#181824] border border-[#28283c] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold">URL Backdrop</label>
                <input
                  type="url"
                  value={editForm.backdropUrl}
                  onChange={(e) => setEditForm({ ...editForm, backdropUrl: e.target.value })}
                  placeholder="https://image.tmdb.org/t/p/..."
                  className="w-full bg-[#181824] border border-[#28283c] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold">Tóm Tắt Nội Dung (Overview)</label>
                <textarea
                  rows={4}
                  value={editForm.overview}
                  onChange={(e) => setEditForm({ ...editForm, overview: e.target.value })}
                  className="w-full bg-[#181824] border border-[#28283c] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#202030]">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl bg-[#1e1e2c] hover:bg-[#28283c] text-neutral-300 font-semibold transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12121c] border border-rose-500/30 rounded-2xl p-6 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Xác Nhận Xóa Phim?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Hành động này sẽ xóa hoàn toàn bộ phim và toàn bộ dữ liệu tập phim, lịch sử xem và yêu thích liên quan. Thao tác không thể hoàn tác!
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#1e1e2c] hover:bg-[#28283c] text-neutral-300 text-xs font-semibold transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                disabled={isDeleting}
                onClick={() => handleDeleteMovie(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Xóa Vĩnh Viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
