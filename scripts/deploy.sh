#!/usr/bin/env bash
# ==============================================================================
# MOVIE WEB — SINGLE VPS AUTOMATED PRODUCTION DEPLOYMENT SCRIPT
# ==============================================================================
set -e

echo "🚀 [1/5] Bắt đầu quy trình triển khai Production..."

# Kiểm tra file cấu hình môi trường .env.prod
if [ ! -f ".env.prod" ]; then
    echo "❌ LỖI: Không tìm thấy file .env.prod. Vui lòng tạo .env.prod từ .env.example trước khi deploy."
    exit 1
fi

# 1. Kéo mã nguồn mới nhất từ Git
echo "📥 [2/5] Kéo mã nguồn mới nhất từ Git..."
git fetch --all
git pull origin master

# 2. Xây dựng và khởi chạy các Docker containers
echo "🐳 [3/5] Xây dựng và khởi chạy Docker Compose Services..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# 3. Chạy Prisma Database Migrations
echo "🗄️ [4/5] Áp dụng Prisma Database Migrations..."
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T backend npx prisma migrate deploy

# 4. Kiểm tra sức khỏe hệ thống (Health Check)
echo "🩺 [5/5] Kiểm tra trạng thái Health Check..."
sleep 5

HEALTH_STATUS=$(docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T backend wget -qO- http://localhost:4000/health || echo "FAIL")

if [[ "$HEALTH_STATUS" == *"ok"* ]]; then
    echo "✅ TRIỂN KHAI PRODUCTION THÀNH CÔNG!"
    echo "📊 Trạng thái dịch vụ:"
    docker compose -f docker-compose.prod.yml ps
else
    echo "⚠️ CẢNH BÁO: Healthcheck không phản hồi như mong đợi: $HEALTH_STATUS"
    echo "🔍 Kiểm tra logs bằng: docker compose -f docker-compose.prod.yml logs backend"
fi
