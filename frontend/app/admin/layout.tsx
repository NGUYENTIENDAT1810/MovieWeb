'use client';

import React from 'react';
import { useAuth } from '../../context/auth-context';
import { AdminNav } from '../../components/admin-nav';
import Link from 'next/link';
import { ShieldAlert, LogIn, Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#12121c] border border-[#222234] text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Yêu Cầu Quyền Quản Trị Viên</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Khu vực này chỉ dành riêng cho tài khoản quản trị (Role: ADMIN). Vui lòng đăng nhập bằng tài khoản Quản trị để tiếp tục.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập Admin</span>
            </Link>
            <Link
              href="/"
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Trở về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col lg:flex-row">
      <AdminNav />
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
