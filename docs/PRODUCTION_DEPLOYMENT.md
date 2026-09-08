# 🚀 PRODUCTION DEPLOYMENT GUIDE — MOVIE WEB (CINEMAPRO)

**Dự án:** Movie Web / CinemaPro Monolith System  
**Phiên bản:** 1.0.0 (Phase 3 — Step 2)  
**Ngày phát hành:** 08/09/2026  

---

## 1. 🏗️ KIẾN TRÚC TRIỂN KHAI PRODUCTION (RECOMMENDED ARCHITECTURE)

Hệ thống được thiết kế theo mô hình **Modern Monolith** tinh gọn, chi phí thấp, độ ổn định cao và dễ vận hành:

```
[ Clients / Trình duyệt ]
         │ (HTTPS / WSS)
         ▼
[ Cloudflare / CDN / Reverse Proxy (Nginx) ]
    ├──► Frontend (Next.js 14 App Router) [Port 3000]
    └──► Backend API (NestJS 10 Framework) [Port 4000]
              │
              ├──► Managed PostgreSQL Database (AWS RDS / Supabase / Neon)
              ├──► TMDB API (Metadata Source - Server-to-Server)
              └──► Video CDN / Object Storage (HLS .m3u8, MP4, WebVTT)
```

* **Frontend:** Next.js 14 App Router (Node.js 20 Alpine Container / Standalone Server).
* **Backend:** NestJS 10 + Prisma ORM 5 (Node.js 20 Alpine Container).
* **Database:** Managed PostgreSQL 15+ (AWS RDS / DigitalOcean / Supabase / Neon).
* **Video Delivery:** S3-compatible Object Storage + Cloudflare CDN hoặc Video Provider được cấp phép.
* **Không sử dụng:** Kubernetes, Microservices, Redis (chưa cần thiết ở quy mô ban đầu), Kafka/Message Queue.

---

## 2. 🔑 BIẾN MÔI TRƯỜNG PRODUCTION (ENVIRONMENT VARIABLES)

### Backend Environment Variables (`backend/.env` hoặc Container Env)

| Biến môi trường | Bắt buộc | Ví dụ giá trị Production | Ý nghĩa / Ghi chú |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Có | `production` | Bật chế độ tối ưu hóa production, ẩn stack trace khi lỗi 500. |
| `PORT` | Có | `4000` | Cổng HTTP mà NestJS lắng nghe. |
| `DATABASE_URL` | Có | `postgresql://user:pass@db-host:5432/movieweb?schema=public&sslmode=require` | Chuỗi kết nối PostgreSQL Production thực tế (có SSL). |
| `JWT_SECRET` | Có | `k8F#9vL2$pQ7!zX5@mN4^wR1*tY6(bC3` | Chuỗi ký JWT bí mật (tối thiểu 32 ký tự ngẫu nhiên). |
| `JWT_EXPIRES_IN` | Không | `7d` | Thời hạn hiệu lực của Access Token. |
| `CORS_ORIGIN` | Có | `https://cinemapro.vn,https://www.cinemapro.vn` | Danh sách domain Frontend được phép truy cập (ngăn chặn CORS trái phép). |
| `TMDB_API_KEY` | Có | `your_tmdb_v3_api_key` | Khóa API TMDB (chỉ lưu trên Backend, không lộ ra Client). |
| `TMDB_BASE_URL` | Không | `https://api.themoviedb.org/3` | URL gốc API TMDB. |
| `TMDB_IMAGE_BASE_URL` | Không | `https://image.tmdb.org/t/p` | URL CDN ảnh của TMDB. |
| `THROTTLE_TTL` | Không | `60000` | Thời gian cửa sổ giới hạn Rate Limit (ms). |
| `THROTTLE_LIMIT` | Không | `120` | Số lượng request tối đa trong cửa sổ TTL. |
| `SWAGGER_ENABLED` | Không | `false` | Đặt `false` để tắt Swagger UI trên Production. |

### Frontend Environment Variables (`frontend/.env.production` hoặc Container Env)

| Biến môi trường | Bắt buộc | Ví dụ giá trị Production | Ý nghĩa / Ghi chú |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Có | `https://api.cinemapro.vn` | URL công khai của Backend API. |
| `NEXT_PUBLIC_SITE_URL`| Có | `https://cinemapro.vn` | URL công khai của trang web (phục vụ Sitemap/Robots). |
| `NODE_ENV` | Có | `production` | Chế độ chạy Next.js tối ưu. |

> ⚠️ **LƯU Ý BẢO MẬT:** Tuyệt đối không commit bất kỳ file `.env` chứa thông tin thực vào Git. Chỉ sử dụng `.env.example` làm mẫu.

---

## 3. 🗄️ QUY TRÌNH MIGRATION & THIẾT LẬP DATABASE PRODUCTION

### Quy tắc bất khả xâm phạm:
1. **LUÔN DÙNG:** `npx prisma migrate deploy` trong deployment pipeline.
2. **TUYỆT ĐỐI KHÔNG DÙNG:** `npx prisma db push` trên Production database.
3. **KHÔNG SEED TỰ ĐỘNG:** Không chạy `prisma/seed.ts` tự động trên database Production để tránh tạo tài khoản mẫu development (`admin@movieweb.com` / `user@movieweb.com`).

### Các bước khởi tạo Database Production sạch:
```bash
# 1. Truy cập thư mục backend
cd backend

# 2. Xuất biến DATABASE_URL trỏ tới PostgreSQL Production
export DATABASE_URL="postgresql://db_user:secure_password@db_host:5432/movieweb_prod?schema=public&sslmode=require"

# 3. Chạy migration an toàn (áp dụng toàn bộ schema và indexes)
npx prisma migrate deploy

# 4. Kiểm tra trạng thái migration
npx prisma migrate status
```

---

## 4. 🐳 DOCKER PRODUCTION DEPLOYMENT

### 1. Build & Run Backend
```bash
# Build Backend Image
docker build -t movieweb-backend:1.0.0 -f backend/Dockerfile ./backend

# Chạy Backend Container
docker run -d \
  --name movieweb-api \
  --restart always \
  -p 4000:4000 \
  --env-file /path/to/backend.production.env \
  movieweb-backend:1.0.0
```

### 2. Build & Run Frontend
```bash
# Build Frontend Image
docker build \
  --build-arg NEXT_PUBLIC_API_URL="https://api.cinemapro.vn" \
  --build-arg NEXT_PUBLIC_SITE_URL="https://cinemapro.vn" \
  -t movieweb-frontend:1.0.0 \
  -f frontend/Dockerfile ./frontend

# Chạy Frontend Container
docker run -d \
  --name movieweb-web \
  --restart always \
  -p 3000:3000 \
  movieweb-frontend:1.0.0
```

---

## 5. 🎬 KIẾN TRÚC VIDEO PRODUCTION & NGUYÊN TẮC BẢN QUYỀN

### Nguyên tắc tuân thủ pháp lý:
* **TMDB:** Đóng vai trò là **Metadata Source** (tiêu đề, poster, backdrop, diễn viên, điểm đánh giá). TMDB **KHÔNG** cung cấp luồng video xem phim.
* **Video Stream (`Episode.videoUrl`):** Phải là các nguồn do nhà phát triển sở hữu bản quyền, tự host (Object Storage/CDN) hoặc các luồng phát mã nguồn mở / public-domain hợp pháp (Blender Foundation, Creative Commons).
* **Tuyệt đối không:**
  - Không scrape từ các website phim lậu.
  - Không bypass các hệ thống DRM (Widevine, FairPlay).
  - Không phân phối hoặc rehost stream bản quyền trái phép.

### Khuyến nghị lưu trữ Video Production:
* Định dạng chuẩn: **HLS (`.m3u8`)** đa bitrate kèm phân đoạn `.ts`/`.m4s`.
* Fallback: File **MP4 (`.mp4`)** chuẩn nén H.264 / AAC.
* Phụ đề: Chuẩn **WebVTT (`.vtt`)**.
* Hạ tầng phân phối: AWS S3 + CloudFront hoặc Cloudflare R2 + CDN với CORS Header `Access-Control-Allow-Origin: *`.

---

## 6. 🔒 ĐÁNH GIÁ BẢO MẬT & KNOWN TRADE-OFFS

### 1. JWT Storage trong `localStorage`:
* **Known Security Trade-off:** Việc lưu JWT trong `localStorage` giúp ứng dụng dễ dàng tương thích đa nền tảng (Web, Mobile App React Native/Flutter, Headless clients), tuy nhiên có rủi ro nếu ứng dụng bị tấn công XSS.
* **Biện pháp giảm thiểu rủi ro:**
  - Frontend sử dụng React JSX tự động escape mã độc (100% không dùng `dangerouslySetInnerHTML`).
  - Backend kích hoạt `helmet` thiết lập CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`.
  - Giới hạn thời gian token hợp lý (`JWT_EXPIRES_IN=7d`).

### 2. CORS Production:
* Chỉ cho phép domain thực tế của website.
* Development localhost (`http://localhost:3000`) chỉ kích hoạt khi `NODE_ENV !== 'production'`.

### 3. Production Health Check:
* Endpoint `GET /health` trả về `200 OK` với thông tin kết nối DB, **không để lộ mật khẩu, URL kết nối hoặc secret**. Phù hợp làm Liveness/Readiness probe cho Load Balancer.

---

## 7. 💾 CHIẾN LƯỢC SAO LƯU DỮ LIỆU (BACKUP & RESTORE)

### 1. PostgreSQL Backup Schedule:
* **Daily Full Snapshot:** Tự động sao lưu toàn bộ cơ sở dữ liệu mỗi ngày vào 02:00 AM UTC.
* **WAL (Write-Ahead Logging) Archiving:** Lưu trữ log thay đổi để hỗ trợ phục hồi theo thời điểm (Point-in-Time Recovery - PITR).
* **Retention Policy:** Lưu giữ bản sao lưu trong 30 ngày gần nhất.

### 2. Lệnh Backup & Restore Thủ Công:
```bash
# Tạo bản sao lưu (Dump)
pg_dump -h db-host -U postgres -d movieweb -F c -b -v -f "movieweb_backup_$(date +%Y%m%d_%H%M%S).dump"

# Phục hồi dữ liệu (Restore)
pg_restore -h db-host -U postgres -d movieweb_prod -v "movieweb_backup_YYYYMMDD_HHMMSS.dump"
```

---

## 8. 🔄 CHIẾN LƯỢC ROLLBACK (ROLLBACK PROCEDURE)

Nếu bản phát hành mới gặp sự cố trong quá trình triển khai:

1. **Application Rollback:**
   ```bash
   # Quay lại container phiên bản trước đó
   docker stop movieweb-api movieweb-web
   docker run -d --name movieweb-api -p 4000:4000 movieweb-backend:PREVIOUS_VERSION
   docker run -d --name movieweb-web -p 3000:3000 movieweb-frontend:PREVIOUS_VERSION
   ```
2. **Git Commit Rollback:**
   ```bash
   git revert <commit-hash>
   git push origin master
   ```
3. **Database Migration Caution:**
   - Tuyệt đối không tự động rollback database nếu migration chứa các thay đổi không phá hủy (Non-destructive).
   - Nếu cần hạ cấp schema, phải viết migration đảo ngược thủ công để bảo vệ toàn vẹn dữ liệu người dùng.

---

## 9. ✅ CHECKLIST SẴN SÀNG TRIỂN KHAI PRODUCTION (PRODUCTION READINESS CHECKLIST)

- [ ] **Cơ sở dữ liệu:** PostgreSQL Managed Database đã sẵn sàng và kích hoạt SSL (`sslmode=require`).
- [ ] **Biến môi trường:** `DATABASE_URL` chính xác và bảo mật.
- [ ] **Khóa JWT:** `JWT_SECRET` đã đổi thành chuỗi ngẫu nhiên mạnh (tối thiểu 32 ký tự).
- [ ] **Khóa TMDB:** `TMDB_API_KEY` đã được cấu hình trên backend server.
- [ ] **CORS:** `CORS_ORIGIN` đã cập nhật đúng domain Production của Frontend.
- [ ] **API URL:** `NEXT_PUBLIC_API_URL` trên Frontend trỏ về đúng domain API.
- [ ] **HTTPS / SSL:** Chứng chỉ SSL/TLS (Let's Encrypt hoặc Cloudflare) đã kích hoạt trên tất cả domain.
- [ ] **Health Check:** `GET /health` phản hồi `200 OK`.
- [ ] **Database Migration:** `npx prisma migrate deploy` đã chạy thành công trên database sạch.
- [ ] **Tài khoản Quản trị:** Tạo tài khoản Admin đầu tiên trực tiếp qua script an toàn, không dùng mật khẩu mặc định dev.
- [ ] **Video CDN:** Nguồn phát video HLS/MP4 hợp pháp đã cấu hình CORS `*` và tải mượt mà.
- [ ] **Swagger:** `SWAGGER_ENABLED=false` trong production.
- [ ] **Rate Limiting:** `Throttler` đang hoạt động ngăn chặn spam/brute-force.
- [ ] **Sao lưu:** Kế hoạch tự động snapshot PostgreSQL đã được bật.
- [ ] **Giám sát:** Log hệ thống không in mật khẩu, token hay API key.
- [ ] **Không lộ Secret:** Kiểm tra Git không có file `.env` chứa credential thật.
