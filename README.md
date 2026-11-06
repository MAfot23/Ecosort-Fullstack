# EcoSort — React + Laravel

A split frontend/backend version of EcoSort:

- **frontend/** — React (Vite) app: login/register, the Sort/Play/Quiz tabs
- **backend/** — Laravel API: user accounts (Sanctum tokens), the waste-item
  database, a `/detect` endpoint, and score storage

## Important: how detection actually works

The camera scan still runs **TensorFlow.js + COCO-SSD in the browser** —
PHP has no practical way to run that image model. What moved to the server
is the *authoritative* logic: the frontend sends the detected object class
(e.g. `"banana"`) to `POST /api/detect`, and Laravel looks up the correct
bin from its own database and returns it. This means:

- The bin-matching rules live in one place (the database), not hardcoded
  in frontend JS that anyone could edit in devtools.
- Every scan is server-validated before the result is shown.
- You can add/edit waste items without touching the frontend at all.

## 1. Set up the backend (Laravel)

This `backend/` folder has the app-specific files (models, controllers,
migrations, routes) but not a full fresh Laravel install. Create one and
drop these files in:

```bash
composer create-project laravel/laravel ecosort-backend
cd ecosort-backend
composer require laravel/sanctum
```

Then copy this project's `backend/app`, `backend/database`, `backend/routes`,
and `backend/config/cors.php` into that fresh project, overwriting the
matching files/folders.

**Enable Sanctum** in `bootstrap/app.php` (Laravel 11+) by adding the API
middleware if it isn't already there, or follow Sanctum's install docs for
your Laravel version: https://laravel.com/docs/sanctum

**Set up the database** (SQLite is easiest for local dev):

```bash
touch database/database.sqlite
```

In `.env`, set:
```
DB_CONNECTION=sqlite
```

**Run migrations and seed the waste items:**

```bash
php artisan migrate
php artisan db:seed
```

**Start the API:**

```bash
php artisan serve
```

This runs at `http://localhost:8000`, so the API is at
`http://localhost:8000/api`.

## 2. Set up the frontend (React)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

This runs at `http://localhost:5173`. The `.env` file points it at your
Laravel API (`VITE_API_URL=http://localhost:8000/api`) — change this if
your backend runs somewhere else.

## 3. CORS

`backend/config/cors.php` already allows `http://localhost:5173`. If you
run the frontend on a different port, add it to `allowed_origins` there.

## What's stored in the database now

- **users** — accounts, created via `/api/register`
- **waste_items** — the name/icon/bin/tip for every item, plus which
  COCO-SSD class (if any) maps to it
- **game_scores** / **quiz_scores** — one row per completed round, tied
  to the logged-in user, so "best score" persists across devices/browsers
  instead of living in `localStorage`

## API summary

| Method | Endpoint             | Auth required | Purpose                          |
|--------|-----------------------|:---:|-----------------------------------|
| POST   | /api/register          |    | Create an account, returns a token |
| POST   | /api/login             |    | Log in, returns a token            |
| POST   | /api/logout            | ✅ | Revoke the current token           |
| GET    | /api/user              | ✅ | Get the logged-in user             |
| GET    | /api/waste-items       |    | List all items (tap list)          |
| POST   | /api/detect            |    | Look up the bin for a detected class |
| POST   | /api/scores/game       | ✅ | Save a Sorting Sprint result       |
| POST   | /api/scores/quiz       | ✅ | Save a quiz result                 |
| GET    | /api/scores/best       | ✅ | Get the user's best game/quiz score |

The frontend sends the saved token as `Authorization: Bearer <token>` on
every request (see `frontend/src/api.js`).
