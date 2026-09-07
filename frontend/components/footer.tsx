import React from 'react';
import Link from 'next/link';
import { Film, Github, Shield, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#08080a] border-t border-[#181822] mt-20 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base tracking-wider">
                CINEMA<span className="text-primary font-black">PRO</span>
              </span>
            </div>
            <p className="text-neutral-500 leading-relaxed">
              Trang web xem phim trực tuyến hiện đại, thiết kế theo tiêu chuẩn Cinematic Dark UI,
              tích hợp NestJS & Next.js.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-200 mb-3 uppercase tracking-wider text-[11px]">
              Khám Phá
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/movies?sort=popular" className="hover:text-white transition-colors">
                  Phim Phổ Biến
                </Link>
              </li>
              <li>
                <Link href="/movies?sort=latest" className="hover:text-white transition-colors">
                  Phim Mới Phát Hành
                </Link>
              </li>
              <li>
                <Link href="/movies?sort=rating" className="hover:text-white transition-colors">
                  Phim Đánh Giá Cao
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Tìm Kiếm Phim
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-200 mb-3 uppercase tracking-wider text-[11px]">
              Tài Khoản
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Đăng Nhập
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Đăng Ký
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-white transition-colors">
                  Phim Yêu Thích
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-200 mb-3 uppercase tracking-wider text-[11px]">
              Bản Quyền & Pháp Lý
            </h4>
            <div className="flex items-start gap-2 text-neutral-500">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>Metadata & hình ảnh được đồng bộ từ TMDB API theo điều khoản chính thức.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#14141c] flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500">
          <p>© {new Date().getFullYear()} Movie Web Project. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Xây dựng với</span>
            <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
            <span>chuẩn kiến trúc Fullstack</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
