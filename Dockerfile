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

# Use production env (file-based sessions/cache — no extra DB tables needed on boot)
RUN cp .env.production .env

# Copy built frontend assets into Laravel public directory
COPY --from=frontend-builder /app/frontend/dist/ ./public/

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Ensure storage and database folders exist and have permissions
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache \
             storage/logs bootstrap/cache database \
    && touch database/database.sqlite \
    && chmod -R 777 storage bootstrap/cache database

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
