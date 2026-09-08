# 🐧 SINGLE VPS DEPLOYMENT GUIDE — MOVIE WEB (CINEMAPRO)

**Kiến trúc:** Single Linux VPS + Docker Compose + Caddy Reverse Proxy (Auto-HTTPS)  
**Ngày cập nhật:** 08/09/2026  
**Trạng thái:** Sẵn sàng triển khai khi có hạ tầng máy chủ  

---

## 1. 🖥️ YÊU CẦU CẤU HÌNH VPS (VPS HARDWARE REQUIREMENTS)

| Thành phần | Cấu hình tối thiểu (Minimum) | Cấu hình khuyến nghị (Recommended) |
| :--- | :--- | :--- |
| **Hệ điều hành** | Ubuntu 22.04 / 24.04 LTS (x86_64 / ARM64) | Ubuntu 24.04 LTS (x86_64) |
| **CPU** | 2 vCPU | 2–4 vCPU |
| **RAM** | 2 GB RAM + 2 GB Swap | 4 GB RAM + 2 GB Swap |
| **Ổ cứng** | 30 GB SSD / NVMe | 50+ GB SSD / NVMe |
| **Băng thông** | 100 Mbps (1 TB / tháng) | 1 Gbps (Không giới hạn) |

> 💡 **Lưu ý về Video Storage:** Video streaming (`.m3u8`, `.mp4`) được phân phối qua **Object Storage / CDN độc lập** (như Cloudflare R2, AWS S3, BunnyCDN), **KHÔNG** lưu trực tiếp các file video dung lượng lớn vào ổ cứng VPS hoặc Git repository.

---

## 2. 🌐 SƠ ĐỒ KIẾN TRÚC MẠNG TRÊN VPS (NETWORK TOPOLOGY)

```
[ Internet Traffic ]
        │
        ▼ (Port 80 HTTP & Port 443 HTTPS)
┌────────────────────────────────────────────────────────┐
│ LINUX VPS HOST                                         │
│                                                        │
│  [ UFW Firewall: Chỉ mở Port 22 (SSH), 80, 443 ]       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ DOCKER BRIDGE NETWORK (movieweb_network)          │  │
│  │                                                  │  │
│  │  [ Caddy Reverse Proxy :80/:443 ] (Auto SSL)     │  │
│  │          ├──► Frontend Next.js :3000             │  │
│  │          └──► Backend NestJS API :4000           │  │
│  │                    │                             │  │
│  │                    └──► PostgreSQL :5432         │  │
│  │                         (Private — Không Public) │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 3. 🛡️ BƯỚC 1: CẤU HÌNH BẢO MẬT & FIREWALL (UFW) TRÊN LINUX VPS

Sau khi kết nối SSH vào VPS mới (`ssh user@vps_ip`), thực hiện cấu hình tường lửa:

```bash
# 1. Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# 2. Cấu hình UFW Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # Cổng SSH quản trị
sudo ufw allow 80/tcp    # Cổng HTTP (ACME Challenge)
sudo ufw allow 443/tcp   # Cổng HTTPS
sudo ufw allow 443/udp   # Cổng HTTP/3 QUIC

# 3. Kích hoạt tường lửa
sudo ufw enable
sudo ufw status verbose
```
> ⚠️ **Tuyệt đối KHÔNG mở** các cổng `5432` (PostgreSQL), `3000` (Next.js), `4000` (NestJS) trên tường lửa UFW.

---

## 4. 🐳 BƯỚC 2: CÀI ĐẶT DOCKER & DOCKER COMPOSE TRÊN VPS

```bash
# 1. Gỡ cài đặt các gói cũ nếu có
sudo apt remove -y docker docker-engine docker.io containerd runc

# 2. Cài đặt Docker Official Repository
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Cài đặt Docker Engine và Docker Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Cấp quyền chạy Docker không cần sudo cho user hiện tại
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

---

## 5. 🌍 BƯỚC 3: CẤU HÌNH DNS TÊN MIỀN

Truy cập trang quản trị DNS của nhà cung cấp tên miền (Cloudflare, Namecheap, v.v.) và trỏ 2 bản ghi `A`:

| Loại bản ghi (Type) | Tên bản ghi (Name) | Giá trị (Value / IPv4) | Proxy Status |
| :--- | :--- | :--- | :--- |
| **A** | `@` (hoặc `cinemapro.vn`) | `<IP_CỦA_VPS>` | DNS Only (hoặc Proxied) |
| **A** | `api` (hoặc `api.cinemapro.vn`) | `<IP_CỦA_VPS>` | DNS Only (hoặc Proxied) |

---

## 6. 📦 BƯỚC 4: CLONE REPOSITORY & THIẾT LẬP FILE MÔI TRƯỜNG

```bash
# 1. Clone mã nguồn vào thư mục /var/www/movieweb
sudo mkdir -p /var/www/movieweb
sudo chown -R $USER:$USER /var/www/movieweb
git clone https://github.com/NGUYENTIENDAT1810/MovieWeb.git /var/www/movieweb
cd /var/www/movieweb

# 2. Tạo file cấu hình môi trường Production .env.prod từ mẫu
cp .env.example .env.prod
```

Chỉnh sửa file `.env.prod` (`nano .env.prod`):
```env
# Domain & SSL Caddy
DOMAIN=cinemapro.vn
API_DOMAIN=api.cinemapro.vn
ACME_EMAIL=admin@cinemapro.vn

# Database Credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=generate_a_very_secure_password_here_123!
POSTGRES_DB=movieweb

# Backend Secrets
PORT=4000
NODE_ENV=production
JWT_SECRET=super_random_32_character_secret_key_production_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://cinemapro.vn,https://www.cinemapro.vn
SWAGGER_ENABLED=false
THROTTLE_TTL=60000
THROTTLE_LIMIT=120

# TMDB API
TMDB_API_KEY=your_real_tmdb_api_key

# Frontend Config
NEXT_PUBLIC_API_URL=https://api.cinemapro.vn
NEXT_PUBLIC_SITE_URL=https://cinemapro.vn
```

---

## 7. 🚀 BƯỚC 5: TRIỂN KHAI VỚI DOCKER COMPOSE

Sử dụng script triển khai tự động hoặc lệnh Docker Compose:

```bash
# Cách 1: Sử dụng script tự động (Khuyến nghị)
chmod +x scripts/deploy.sh scripts/backup-db.sh
./scripts/deploy.sh

# Hoặc Cách 2: Triển khai thủ công từng bước
# 1. Build & Start services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# 2. Áp dụng Prisma Database Migration
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T backend npx prisma migrate deploy

# 3. Kiểm tra trạng thái containers
docker compose -f docker-compose.prod.yml ps
```

---

## 8. 🩺 BƯỚC 6: KIỂM TRA SỨC KHỎE DỊCH VỤ (HEALTH CHECK)

```bash
# Kiểm tra Health endpoint của Backend
curl -i http://localhost:4000/health
# Kết quả mong đợi: HTTP/1.1 200 OK -> {"status":"ok","database":"connected"}

# Kiểm tra qua Domain HTTPS
curl -i https://api.cinemapro.vn/health
curl -i https://cinemapro.vn/
```

---

## 9. 💾 BƯỚC 7: CẤU HÌNH TỰ ĐỘNG SAO LƯU DATABASE (CRONJOB)

Thiết lập sao lưu cơ sở dữ liệu tự động vào 02:00 AM mỗi ngày:

```bash
# Mở crontab
crontab -e

# Thêm dòng sau vào cuối file:
0 2 * * * cd /var/www/movieweb && ./scripts/backup-db.sh >> /var/log/movieweb_backup.log 2>&1
```

### Hướng dẫn khôi phục dữ liệu khi cần (Restore):
```bash
# Giải nén và restore vào container PostgreSQL
gunzip -c /var/www/movieweb/backups/movieweb_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d movieweb
```

---

## 10. 🔄 QUY TRÌNH CẬP NHẬT MÃ NGUỒN (ZERO-DOWNTIME UPDATE)

Mỗi khi có cập nhật mới từ Git repository:

```bash
cd /var/www/movieweb
./scripts/deploy.sh
```

---

## 11. 🛠️ XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

### 1. Xem Logs thời gian thực:
```bash
# Xem log toàn bộ hệ thống
docker compose -f docker-compose.prod.yml logs -f --tail=100

# Xem log riêng Backend / Frontend / Caddy
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f reverse-proxy
```

### 2. Caddy không cấp được chứng chỉ SSL:
* **Nguyên nhân:** Bản ghi DNS `A` chưa trỏ đúng IP của VPS hoặc UFW đang chặn cổng `80`/`443`.
* **Khắc phục:** Kiểm tra `dig +short yourdomain.com` và mở cổng `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`.

### 3. Backend không kết nối được Database:
* **Nguyên nhân:** Container PostgreSQL chưa sẵn sàng hoặc `DATABASE_URL` sai mật khẩu.
* **Khắc phục:** Kiểm tra `docker compose -f docker-compose.prod.yml logs postgres`.

---

## 12. ✅ BẢNG TÓM TẮT TRẠNG THÁI KIỂM CHỨNG (VERIFICATION MATRIX)

| Hạng mục | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| **Docker Production Config** | ✅ PASS | `docker-compose.prod.yml` cấu hình mạng nội bộ, memory limits, healthchecks. |
| **PostgreSQL Isolation** | ✅ PASS | Không expose port 5432 ra ngoài, lưu trữ qua volume `postgres_data`. |
| **Backend Multi-stage** | ✅ PASS | `backend/Dockerfile` chạy compiled NestJS với user `nestjs:nodejs`. |
| **Frontend Multi-stage** | ✅ PASS | `frontend/Dockerfile` tối ưu hóa Next.js 14 App Router. |
| **Reverse Proxy (Caddy)** | ✅ PASS | Tự động sinh SSL Let's Encrypt qua `caddy/Caddyfile`. |
| **Database Migrations** | ✅ PASS | `npx prisma migrate deploy` kiểm thử sạch 100%. |
| **Automated Deploy & Backup** | ✅ PASS | `scripts/deploy.sh` và `scripts/backup-db.sh` sẵn sàng. |
| **Development Isolation** | ✅ PASS | `docker-compose.yml` nguyên bản vẫn hoạt động cho local dev. |
