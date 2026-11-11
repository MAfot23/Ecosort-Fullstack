# ── Stage 1: Build React Vite Frontend ──
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ── Stage 2: PHP 8.4 Laravel Backend ──
FROM php:8.4-cli-alpine
WORKDIR /app

# Install system dependencies and sqlite extension
RUN apk add --no-cache \
    curl \
    git \
    unzip \
    libzip-dev \
    sqlite \
    sqlite-dev \
    && docker-php-ext-install bcmath zip pdo pdo_sqlite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy backend source
COPY backend/ .

# Copy built frontend assets into Laravel public directory
COPY --from=frontend-builder /app/frontend/dist/ ./public/

# Ensure storage and database folders exist and have permissions
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache database \
    && touch database/database.sqlite \
    && chmod -R 777 storage bootstrap/cache database

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

EXPOSE 8000

# Run migrations, seed, and start Laravel built-in web server
CMD php artisan migrate --force && \
    php artisan db:seed --force && \
    php artisan serve --host 0.0.0.0 --port ${PORT:-8000}
