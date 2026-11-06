FROM php:8.4-cli-alpine

# Install dependencies and sqlite extension
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

WORKDIR /app

# Copy project files
COPY . .

# Ensure storage and database folders exist and have permissions
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache database \
    && touch database/database.sqlite \
    && chmod -R 777 storage bootstrap/cache database

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

EXPOSE 8000

# Run migrations, seed, and start the server
CMD php artisan migrate --force && \
    php artisan db:seed --force && \
    php artisan serve --host 0.0.0.0 --port ${PORT:-8000}
