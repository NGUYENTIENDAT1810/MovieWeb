#!/usr/bin/env bash
# ==============================================================================
# MOVIE WEB — POSTGRESQL AUTOMATED BACKUP SCRIPT
# ==============================================================================
set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/movieweb_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "💾 Đang tiến hành sao lưu PostgreSQL Database..."

# Đọc cấu hình từ .env.prod hoặc biến môi trường
if [ -f ".env.prod" ]; then
    export $(grep -v '^#' .env.prod | xargs)
fi

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-movieweb}"

# Thực thi pg_dump từ bên trong container postgres
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Kiểm tra file sao lưu
if [ -f "$BACKUP_FILE" ]; then
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Sao lưu thành công: $BACKUP_FILE ($FILE_SIZE)"
else
    echo "❌ Lỗi: Không tạo được file sao lưu!"
    exit 1
fi

# Tự động dọn dẹp các bản sao lưu cũ hơn 14 ngày
echo "🧹 Dọn dẹp bản sao lưu cũ hơn 14 ngày..."
find "$BACKUP_DIR" -type f -name "movieweb_backup_*.sql.gz" -mtime +14 -exec rm -f {} \;

echo "✨ Hoàn tất quy trình sao lưu!"
