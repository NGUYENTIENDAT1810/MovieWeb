'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Film, Search, Heart, User as UserIcon, LogOut, ShieldAlert, Menu, X } from 'lucide-react';
import { useAuth } from '../context/auth-context';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Trang Chủ', href: '/' },
    { label: 'Khám Phá Phim', href: '/movies' },
    { label: 'Yêu Thích', href: '/favorites', requireAuth: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0a0c]/90 backdrop-blur-md border-b border-[#1e1e28] shadow-lg'
          : 'bg-gradient-to-b from-[#0a0a0c]/90 via-[#0a0a0c]/40 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-rose-600 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
            CINEMA<span className="text-primary font-black">PRO</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            if (link.requireAuth && !user) return null;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex items-center flex-1 max-w-xs relative"
        >
          <input
            type="text"
            placeholder="Tìm kiếm phim, diễn viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16161f]/80 text-xs text-white placeholder-neutral-500 rounded-full pl-9 pr-4 py-2 border border-[#272736] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
        </form>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                href="/favorites"
                className="p-2 rounded-full text-neutral-300 hover:text-primary hover:bg-[#1a1a24] transition-colors relative"
                title="Danh sách yêu thích"
              >
                <Heart className="w-5 h-5" />
              </Link>
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-medium text-neutral-200 truncate max-w-[120px]">
                  {user.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full text-neutral-400 hover:text-rose-400 hover:bg-[#1a1a24] transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-200 hover:text-white hover:bg-[#1a1a24] transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 transition-all hover:scale-105"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d12] border-b border-[#1e1e28] px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16161f] text-sm text-white placeholder-neutral-500 rounded-lg pl-9 pr-4 py-2.5 border border-[#272736]"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              if (link.requireAuth && !user) return null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:bg-[#181822] hover:text-white"
                >
                  {link.label}
                </Link>
              );
            })}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-[#181822]"
              >
                Trang Quản Trị (Admin)
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
