#!/bin/sh
set -e

echo "=== EcoSort Startup ==="

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
  echo "[WARN] APP_KEY not set — generating one now..."
  php artisan key:generate --force
fi

# Ensure SQLite database file exists and is writable
mkdir -p /app/database
touch /app/database/database.sqlite
chmod 664 /app/database/database.sqlite

# Ensure storage directories exist and are writable
mkdir -p /app/storage/framework/sessions \
         /app/storage/framework/views \
         /app/storage/framework/cache \
         /app/storage/logs \
         /app/bootstrap/cache

chmod -R 777 /app/storage /app/bootstrap/cache

# Clear any stale config/route cache from build
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true

# Run migrations (creates all tables including personal_access_tokens, sessions, cache)
echo "[INFO] Running migrations..."
php artisan migrate --force

# Run seeders (58 waste items + admin user)
echo "[INFO] Running seeders..."
php artisan db:seed --force

echo "[INFO] Starting Laravel server on 0.0.0.0:${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
