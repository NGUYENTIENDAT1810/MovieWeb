# 🎬 Movie Web — Fullstack NestJS & Next.js 14 Cinematic Platform

Một nền tảng web phim hoàn chỉnh từ số 0, kết hợp kiến trúc Backend mạnh mẽ bằng **NestJS** và giao diện người dùng **Next.js 14 App Router** phong cách Dark Cinematic hiện đại.

---

## 🌟 Tính Năng Nổi Bật

- **Kiến trúc Monorepo**: Quản lý tập trung Backend & Frontend với npm workspaces.
- **RESTful API Chuẩn Mực**: NestJS 10, Prisma ORM, PostgreSQL, Global ValidationPipe, Centralized Exception Filter.
- **Tài liệu Swagger / OpenAPI 3.0**: Trực quan hóa và thử nghiệm toàn bộ API tại `/api/docs`.
- **Đồng Bộ Dữ Liệu TMDB (The Movie Database)**: Hệ thống Sync 2 chiều (Popular, Trending, theo ID, Thể loại) có cơ chế phòng chống trùng lặp dữ liệu.
- **Bảo Mật & Phân Quyền Đa Tầng**: JWT Authentication (Passport), mã hóa mật khẩu bcrypt (10 rounds), Phân quyền Role-based (`ADMIN` / `USER`).
- **Cá Nhân Hóa Người Dùng**: Quản lý danh sách Yêu thích (Favorites) và Lịch sử xem phim (Watch History / Continue Watching).
- **Trình Phát Video Cinematic Tùy Biến**: HTML5 Video Player với đầy đủ Play/Pause, Scrubber seek bar, Tua ±10s, Volume, Fullscreen, Tự động khôi phục vị trí xem trước đó (Auto Resume) và định kỳ lưu tiến độ xem ngầm.
- **Trang Quản Trị Hệ Thống (Admin Portal)**: Thống kê số liệu thời gian thực (`/admin`), Quản lý & chỉnh sửa metadata phim (`/admin/movies`), Bảng điều khiển kích hoạt đồng bộ TMDB kèm Sync Console Log (`/admin/sync`).
- **Tuân Thủ Pháp Lý & Bản Quyền**: Không phân phối video lậu; tích hợp luồng phát video mẫu bản quyền mở (Big Buck Bunny) và thông báo cảnh báo bản quyền chuẩn mực.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend
- **Framework**: [NestJS 10](https://nestjs.com/) (TypeScript)
- **Database ORM**: [Prisma ORM 5](https://www.prisma.io/)
- **Cơ sở dữ liệu**: [PostgreSQL 16](https://www.postgresql.org/) (Docker Container)
- **Xác thực**: Passport JWT (`@nestjs/jwt`, `@nestjs/passport`, `bcryptjs`)
- **Tài liệu API**: Swagger UI (`@nestjs/swagger`)
- **Validation**: `class-validator`, `class-transformer`

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Dark Cinematic Theme)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Session**: React Context API (`AuthProvider`) + LocalStorage Token Persistence

---

## 📁 Cấu Trúc Dự Án (Project Structure)

```
phim/
├── backend/                              # NestJS Backend Application
│   ├── prisma/
│   │   ├── migrations/                  # Lịch sử SQL Migrations
│   │   ├── schema.prisma                # Định nghĩa 7 Database Models
│   │   └── seed.ts                      # Script seed Admin, User, Genres & Demo Movie
│   ├── src/
│   │   ├── admin/                       # Admin Stats, Movies CRUD & TMDB Sync
│   │   ├── auth/                        # Register, Login, JWT Strategies & Guards
│   │   ├── common/                      # DTOs, Pagination, Filters & Utilities
│   │   ├── episodes/                    # Episode Endpoints & Metadata
│   │   ├── external-movies/             # TMDB API Client Service
│   │   ├── favorites/                   # Quản lý phim yêu thích
│   │   ├── genres/                      # Thể loại phim
│   │   ├── health/                      # Health check endpoint (GET /health)
│   │   ├── history/                     # Lưu trữ tiến độ và lịch sử xem
│   │   ├── movies/                      # Movie Query, Filter, Sort & Details
│   │   ├── prisma/                      # Prisma Global Module & Service
│   │   ├── users/                       # Quản lý User Profile
│   │   ├── app.module.ts
│   │   └── main.ts                      # Bootstrap NestJS & Swagger
│   ├── .env.example
│   └── package.json
│
├── frontend/                             # Next.js 14 Frontend Application
│   ├── app/
│   │   ├── admin/                       # Admin Dashboard, Movies & Sync Center
│   │   ├── favorites/                   # Bộ sưu tập phim yêu thích
│   │   ├── login/ & register/           # Trang xác thực người dùng
│   │   ├── movies/ & movies/[slug]/     # Danh mục phim & Chi tiết phim
│   │   ├── search/                      # Trang tìm kiếm tức thời
│   │   ├── watch/[movieId]/[episodeId]/ # Trang xem phim & Video Player
│   │   ├── globals.css                  # Custom styling & Scrollbar
│   │   ├── layout.tsx                   # Root Layout & Auth Provider Wrapper
│   │   └── page.tsx                     # Trang chủ (Hero Banner & Movie Rows)
│   ├── components/                      # Navbar, Footer, VideoPlayer, MovieCard, ...
│   ├── context/                         # AuthContext (login, register, logout)
│   ├── lib/                             # Centralized API Fetcher
│   ├── types/                           # TypeScript Interfaces
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml                    # PostgreSQL Container Service
├── .env.example                          # Biến môi trường mẫu cho toàn bộ dự án
├── implement_note.html                   # Nhật ký chi tiết 10 Milestones
├── MOVIE_WEB_SPEC.md                     # Bản đặc tả kỹ thuật dự án
└── README.md                             # Hướng dẫn khởi chạy & Vận hành
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Từng Bước (Step-by-Step)

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản 18 trở lên (Khuyến nghị Node 20 LTS).
- **npm**: Phiên bản 9 trở lên.
- **Docker & Docker Compose**: Để chạy PostgreSQL database container.

---

### 2. Cài đặt Dependencies
Từ thư mục gốc dự án:
```bash
# Cài đặt toàn bộ dependencies cho cả Backend và Frontend
npm install
```

---

### 3. Cấu hình biến môi trường (.env)

Tạo file `.env` tại thư mục `backend/` từ file mẫu:
```bash
# Windows PowerShell:
Copy-Item backend\.env.example backend\.env

# Linux / MacOS:
cp backend/.env.example backend/.env
```

Nội dung file `backend/.env`:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movieweb?schema=public"
JWT_SECRET=super_secret_jwt_key_movie_web_2026
JWT_EXPIRES_IN=7d
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```
*(Lưu ý: Để đồng bộ phim trực tiếp từ TMDB, bạn có thể đăng ký API Key miễn phí tại [themoviedb.org](https://www.themoviedb.org/settings/api) và điền vào `TMDB_API_KEY`)*.

---

### 4. Khởi động PostgreSQL Container
```bash
docker compose up -d
```
Kiểm tra trạng thái container:
```bash
docker ps
```

---

### 5. Khởi tạo Database Schema & Seed Dữ liệu Mẫu

```bash
# Sinh Prisma Client
npm run prisma:generate

# Chạy migration tạo bảng
npm run prisma:migrate

# Chạy seed dữ liệu mẫu (17 Thể loại, Admin, User, Phim demo)
npm run prisma:seed
```

---

### 6. Khởi chạy Ứng dụng

Bạn có thể chạy cả hai ứng dụng đồng thời bằng 2 cửa sổ terminal:

**Terminal 1 — Chạy Backend (NestJS)**:
```bash
npm run dev:backend
# Backend khởi chạy tại: http://localhost:4000
# Swagger API Docs: http://localhost:4000/api/docs
# Health Check: http://localhost:4000/health
```

**Terminal 2 — Chạy Frontend (Next.js)**:
```bash
npm run dev:frontend
# Website khởi chạy tại: http://localhost:3000
```

---

## 🔑 Tài Khoản Đăng Nhập Mẫu

Sau khi chạy lệnh `npm run prisma:seed`, hệ thống đã chuẩn bị sẵn 2 tài khoản mẫu:

| Loại tài khoản | Email | Mật khẩu | Quyền hạn (Role) |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@movieweb.com` | `Admin@123456` | **ADMIN** (Truy cập `/admin`, Đồng bộ TMDB, Quản lý phim) |
| **Thành viên (User)** | `user@movieweb.com` | `User@123456` | **USER** (Xem phim, Yêu thích, Lịch sử xem) |

---

## 🌐 Danh Mục Đường Dẫn Chính

### Frontend Routes
- **Trang chủ**: [http://localhost:3000](http://localhost:3000)
- **Khám phá phim**: [http://localhost:3000/movies](http://localhost:3000/movies)
- **Tìm kiếm**: [http://localhost:3000/search](http://localhost:3000/search)
- **Phim yêu thích**: [http://localhost:3000/favorites](http://localhost:3000/favorites)
- **Đăng nhập / Đăng ký**: [http://localhost:3000/login](http://localhost:3000/login) & [http://localhost:3000/register](http://localhost:3000/register)
- **Trang Quản trị Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Quản lý danh sách phim**: [http://localhost:3000/admin/movies](http://localhost:3000/admin/movies)
- **Đồng bộ TMDB**: [http://localhost:3000/admin/sync](http://localhost:3000/admin/sync)

### Backend Endpoints
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

---

## 📋 Danh Sách Milestones Hoàn Thành (10/10)

- [x] **Milestone 1**: Project Setup, Docker Compose, PostgreSQL, Prisma & Health Check (`GET /health`)
- [x] **Milestone 2**: Movie/Genre/Episode Database Schema, Migrations & Seed Script
- [x] **Milestone 3**: Movie RESTful API (Filter, Sort, Pagination) & Swagger OpenAPI Documentation
- [x] **Milestone 4**: Third-party TMDB API Client & Backend Sync Engine
- [x] **Milestone 5**: Authentication & JWT (Register, Login, Me, Role Guards: ADMIN/USER)
- [x] **Milestone 6**: Favorites & Watch History Management (Continue Watching & Resume)
- [x] **Milestone 7**: Next.js 14 Dark Cinematic UI (Home, Movies, Detail, Search & Auth Context)
- [x] **Milestone 8**: Watch Page & Custom HTML5 Video Player (Auto Resume, Progress Sync)
- [x] **Milestone 9**: Admin Dashboard & Management Portal (Stats, Movies CRUD & TMDB Sync Center)
- [x] **Milestone 10**: Testing, Code Cleanup, Docker Configuration & Final Documentation

---

## 📜 Giấy Phép & Tuyên Bố Bản Quyền
Dự án được xây dựng phục vụ mục đích học tập và nghiên cứu kỹ thuật phát triển ứng dụng Fullstack hiện đại. Tất cả metadata và hình ảnh thuộc bản quyền của **The Movie Database (TMDB)**. Nguồn video demo sử dụng stream mã nguồn mở công khai (Big Buck Bunny - Blender Foundation).
