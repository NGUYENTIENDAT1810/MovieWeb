'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  RefreshCw,
  Home,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';

export function AdminNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: 'Tổng Quan',
      href: '/admin',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      name: 'Quản Lý Phim',
      href: '/admin/movies',
      icon: Film,
      active: pathname.startsWith('/admin/movies'),
    },
    {
      name: 'Đồng Bộ TMDB',
      href: '/admin/sync',
      icon: RefreshCw,
      active: pathname === '/admin/sync',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#101018] border-b lg:border-b-0 lg:border-r border-[#202030] p-4 sm:p-6 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Brand / Role */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wide">ADMIN PANEL</h2>
            <p className="text-[10px] text-neutral-400 font-mono">Movie Web v1.0</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  item.active
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-neutral-400 hover:text-white hover:bg-[#181824]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-[#1c1c28] mt-6 flex lg:flex-col justify-between items-center lg:items-stretch gap-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#181824] transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Về Trang Chủ</span>
        </Link>

        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
}
