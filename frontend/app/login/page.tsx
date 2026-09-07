'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Film, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12 bg-gradient-to-b from-[#0a0a0c] via-[#12121a] to-[#0a0a0c]">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#14141c]/80 border border-[#242434] shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl tracking-wider text-white">
              CINEMA<span className="text-primary">PRO</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white pt-2">Đăng Nhập Tài Khoản</h2>
          <p className="text-xs text-neutral-400">
            Truy cập kho phim, lưu danh sách yêu thích và tiếp tục xem
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1b1b26] text-sm text-white placeholder-neutral-500 rounded-xl pl-10 pr-4 py-2.5 border border-[#2c2c3e] focus:outline-none focus:border-primary"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Mật Khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1b1b26] text-sm text-white placeholder-neutral-500 rounded-xl pl-10 pr-4 py-2.5 border border-[#2c2c3e] focus:outline-none focus:border-primary"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Đăng Nhập</span>
          </button>
        </form>

        <div className="text-center text-xs text-neutral-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
