# 🛡️ PHASE 3 — STEP 1: SECURITY & PRODUCTION AUDIT REPORT

**Dự án:** Movie Web (CinemaPro)  
**Ngày thực hiện:** 08/09/2026  
**Phạm vi:** Backend (NestJS 10, Prisma ORM), Frontend (Next.js 14 App Router), Database (PostgreSQL), Video Streaming Architecture, Network & Deployment Readiness.

---

## 📊 TỔNG QUAN PHÂN LOẠI MỨC ĐỘ RỦI RO (SEVERITY MATRIX)

| Mức độ | Định nghĩa | Số lượng phát hiện |
| :--- | :--- | :---: |
| 🔴 **CRITICAL** | Lỗ hổng bảo mật trực tiếp, rò rỉ credential/bí mật, bypass phân quyền nghiêm trọng | **0** |
| 🟠 **HIGH** | Thiếu bảo vệ tấn công brute-force, CORS mở toàn bộ (`*`) trong production, lộ internal stack trace khi lỗi 500, thiếu URL schema validation | **4** |
| 🟡 **MEDIUM** | Thiếu HTTP security headers (Helmet), thiếu Graceful Shutdown hooks, Swagger chưa toggleable theo env, thiếu index foreign keys cho database | **4** |
| 🔵 **LOW** | Thiếu robots.txt/sitemap.ts cho SEO, thiếu biến môi trường tài liệu hóa chi tiết trong `.env.example` | **2** |
| ℹ️ **INFO** | Đánh giá kiến trúc JWT token storage (localStorage vs HttpOnly Cookie), phân tách Embedded Postgres vs Production PostgreSQL | **2** |

---

## 📋 DANH SÁCH CHI TIẾT CÁC PHÁT HIỆN & ĐỀ XUẤT XỬ LÝ

### 1. 🟠 [HIGH] — CORS Origin cấu hình wildcard `*`
* **File:** `backend/src/main.ts` (Dòng 27–31)
* **Problem:** Hiện tại `app.enableCors({ origin: '*', credentials: true })` cho phép bất kỳ domain nào gửi request có credentials.
* **Risk:** Khi deploy Internet thật, các trang web độc hại có thể thực hiện Cross-Origin requests tới API nếu cookie/credentials được bật.
* **Recommended fix:** Đọc danh sách allowed origins từ biến môi trường `CORS_ORIGIN` (hỗ trợ nhiều domain phân tách bởi dấu phẩy, mặc định hỗ trợ localhost cho development).
* **Status:** 🛠️ **Đang khắc phục trong Step 1**

---

### 2. 🟠 [HIGH] — Thiếu Rate Limiting (Throttler) chống tấn công Brute-Force & DoS
* **File:** `backend/src/app.module.ts`, `backend/src/auth/auth.controller.ts`
* **Problem:** Chưa có rate limit giới hạn tần suất gọi API, đặc biệt là các endpoint nhạy cảm như `POST /auth/login`, `POST /auth/register`, `POST /admin/sync`.
* **Risk:** Kẻ tấn công có thể spam dò mật khẩu (Credential Stuffing) hoặc spam TMDB sync làm cạn kiệt tài nguyên máy chủ và quota API bên ngoài.
* **Recommended fix:** Cấu hình `@nestjs/throttler` (ThrottlerModule) toàn cục với giới hạn cấu hình được qua env (`THROTTLE_TTL`, `THROTTLE_LIMIT`), áp dụng `ThrottlerGuard`.
* **Status:** 🛠️ **Đang khắc phục trong Step 1**

---

### 3. 🟠 [HIGH] — Lộ chi tiết lỗi nội bộ (Internal Stack/Error Message) khi gặp HTTP 500
* **File:** `backend/src/common/filters/http-exception.filter.ts` (Dòng 35–38)
* **Problem:** Khi gặp unhandled exception (`exception instanceof Error`), filter gán `message = exception.message` trả về client.
* **Risk:** Trong production, thông báo lỗi unhandled có thể chứa đường dẫn file hệ thống, chi tiết truy vấn DB hoặc cấu trúc hạ tầng.
* **Recommended fix:** Kiểm tra `NODE_ENV === 'production'`. Nếu là production và gặp lỗi unhandled 500, ẩn message nội bộ và trả về thông báo chuẩn `"Internal server error"`, đồng thời ghi log chi tiết trên server.
* **Status:** 🛠️ **Đang khắc phục trong Step 1**

---

### 4. 🟠 [HIGH] — Validation URL Video Stream & Subtitle chưa kiểm tra Protocol an toàn
* **File:** `backend/src/episodes/dto/create-episode.dto.ts`, `backend/src/episodes/dto/update-episode.dto.ts`
* **Problem:** `videoUrl` và `subtitleUrl` sử dụng `@IsString()`, chưa ràng buộc URL protocol (`http:`, `https:`).
* **Risk:** Có thể bị lợi dụng để chèn chuỗi URI độc hại (`javascript:...`, `data:...`).
* **Recommended fix:** Bổ sung `@IsUrl({ protocols: ['http', 'https'], require_protocol: true })` kết hợp `@IsOptional()`.
* **Status:** 🛠️ **Đang khắc phục trong Step 1**

---

### 5. 🟡 [MEDIUM] — Thiếu HTTP Security Headers (Helmet)
* **File:** `backend/src/main.ts`
* **Problem:** Backend chưa tích hợp middleware `helmet` để thiết lập các headers phòng thủ như `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`.
* **Risk:** Dễ bị tấn công clickjacking, MIME-sniffing trên các trình duyệt cũ hoặc thiếu các header bảo mật theo tiêu chuẩn OWASP.
* **Recommended fix:** Tích hợp `helmet()` trong `main.ts`.
* **Status:** 🛠️ **Đang khắc phục trong Step 1**

---

### 6. 🟡 [MEDIUM] — Thiếu Graceful Shutdown Hooks cho Database & Server
* **File:** `backend/src/main.ts`, `backend/src/prisma/prisma.service.ts`
* **Problem:** Chưa gọi `app.enableShutdownHooks()`.
* **Risk:** Khi container/service dừng (SIGTERM/SIGINT trong Kubernetes/Docker), các kết nối PostgreSQL đang thực thi có thể bị ngắt đột ngột gây gián đoạn transaction.
* **Recommended fix:** Bổ sung `app.enableShutdownHooks()` trong `main.ts`.
* **Status:** 🛠️ **Đang khắc phục trong Step 1**

---

### 7. 🟡 [MEDIUM] — Swagger UI chưa có tùy chọn ẩn/tắt trong Production
* **File:** `backend/src/main.ts`
* **Problem:** Swagger UI tự động khởi tạo tại `/api/docs` mà không kiểm tra cờ môi trường `ENABLE_SWAGGER`.
* **Risk:** Để lộ sơ đồ API chi tiết cho công chúng trong trường hợp muốn ẩn API documentation trên môi trường Production.
* **Recommended fix:** Kiểm tra biến môi trường `ENABLE_SWAGGER === 'true'` hoặc tự động kích hoạt khi `NODE_ENV !== 'production'`.
* **Status:** 🛠️ **Đang khắc phục trong Step 1**

---

### 8. 🟡 [MEDIUM] — Thiếu Database Indexes trên các Foreign Keys (PostgreSQL)
* **File:** `backend/prisma/schema.prisma`
* **Problem:** Model `Episode` thiếu index trên `movieId`; Model `Favorite` thiếu index trên `userId`, `movieId`; Model `WatchHistory` thiếu index trên `movieId`.
* **Risk:** Khi số lượng phim và người dùng tăng lên hàng chục nghìn bản ghi, các câu lệnh JOIN, DELETE CASCADE hoặc tra cứu danh sách tập theo phim sẽ bị quét toàn bảng (Full Table Scan), làm giảm hiệu năng.
* **Recommended fix:** Thêm `@@index([movieId])` cho `Episode`, `@@index([userId])`, `@@index([movieId])` cho `Favorite`, `WatchHistory`.
* **Status:** 🛠️ **Đang khắc phục trong Step 1**

---

### 9. 🔵 [LOW] — Thiếu Robots.txt và Sitemap.ts cho SEO trên Frontend
* **File:** `frontend/app/robots.ts`, `frontend/app/sitemap.ts`
* **Problem:** Frontend Next.js 14 App Router chưa có cấu hình `robots.ts` và `sitemap.ts` động cho search engine bot.
* **Risk:** Bot tìm kiếm (Googlebot) không thu thập dữ liệu hiệu quả hoặc lập chỉ mục các trang nội bộ không mong muốn.
* **Recommended fix:** Tạo `frontend/app/robots.ts` và `frontend/app/sitemap.ts`.
* **Status:** 🛠️ **Đang khắc phục trong Step 1**

---

### 10. 🔵 [LOW] — `.env.example` chưa tài liệu hóa đầy đủ các biến Production
* **File:** `.env.example`, `backend/.env.example`, `frontend/.env.example`
* **Problem:** Thiếu các biến cấu hình: `ENABLE_SWAGGER`, `CORS_ORIGIN`, `THROTTLE_TTL`, `THROTTLE_LIMIT`, `JWT_EXPIRES_IN`.
* **Risk:** Khó khăn cho việc bàn giao và cấu hình CI/CD / Production Server.
* **Recommended fix:** Đồng bộ và chú thích chi tiết toàn bộ các biến môi trường trong tất cả các file `.env.example`.
* **Status:** 🛠️ **Đang khắc phục trong Step 1**

---

### 11. ℹ️ [INFO] — Đánh Giá Kiến Trúc Lưu Trữ JWT Token (localStorage vs HttpOnly Cookie)
* **Hiện trạng:**
  - Frontend lưu trữ JWT Bearer Token trong `localStorage` và gửi qua header `Authorization: Bearer <token>`.
  - Backend sử dụng `Passport-JWT` trích xuất token qua `ExtractJwt.fromAuthHeaderAsBearerToken()`.
* **Phân tích kỹ thuật & Đánh giá rủi ro:**
  - *Ưu điểm của Bearer Token (Hiện tại):* Hoàn toàn tương thích đa nền tảng (Web, Mobile App React Native/Flutter, Postman, API QA automation, microservices), không bị ràng buộc bởi chính sách Third-Party Cookie khi Backend và Frontend đặt ở 2 domain/subdomain khác nhau trên cloud.
  - *Rủi ro XSS:* Token trong `localStorage` có thể bị đánh cắp nếu trang web có lỗ hổng XSS. Tuy nhiên, toàn bộ Frontend Movie Web sử dụng React JSX tự động escape output, **hoàn toàn KHÔNG sử dụng `dangerouslySetInnerHTML`**, và đã được bảo vệ bổ sung bởi HTTP Security Headers (`helmet`), Content-Type Sniffing Protection và CSP.
  - *Chiến lược tối ưu:* Giữ vững kiến trúc Bearer Token chuẩn mực, đảm bảo 0% lỗ hổng XSS, đồng thời duy trì khả năng mở rộng cho API clients / mobile apps mà không làm vỡ các API test và luồng xác thực hiện có.

---

### 12. ℹ️ [INFO] — Chiến Lược Cơ Sở Dữ Liệu PostgreSQL Môi Trường Production
* **Hiện trạng:**
  - Local development sử dụng script tự khởi chạy `backend/scripts/start-db.js` với `embedded-postgres` để lập trình offline.
* **Chiến lược Production:**
  - Trên môi trường Production (Docker / AWS RDS / DigitalOcean Managed Postgres / Supabase / Neon):
    - Đặt chuỗi kết nối thực tế trong `DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public&sslmode=prefer`.
    - Chạy lệnh migration chuẩn: `npx prisma migrate deploy` hoặc `npx prisma db push` trong CI/CD pipeline.
    - Script `start-db.js` chỉ được kích hoạt trong development (`NODE_ENV !== 'production'`).

---

## 🎯 KẾ HOẠCH HÀNH ĐỘNG (ACTION PLAN)
1. Cập nhật `backend/src/main.ts`: Tích hợp `helmet`, `app.enableShutdownHooks()`, `CORS_ORIGIN` động, `ENABLE_SWAGGER` configurable.
2. Cập nhật `backend/src/app.module.ts`: Tích hợp `ThrottlerModule` (Rate limiting).
3. Cập nhật `backend/src/common/filters/http-exception.filter.ts`: Ẩn internal stack trace khi `NODE_ENV === 'production'`.
4. Cập nhật DTO `backend/src/episodes/dto/create-episode.dto.ts` & `update-episode.dto.ts`: Validate URL protocol chặt chẽ.
5. Cập nhật `backend/prisma/schema.prisma`: Bổ sung indexes cho các khóa ngoại.
6. Cập nhật Frontend: Bổ sung `robots.ts` và `sitemap.ts`.
7. Đồng bộ `.env.example` ở root, backend, frontend.
8. Chạy kiểm thử hồi quy: `npm run build` (Backend + Frontend) và chạy toàn bộ 28 Runtime QA Tests.
