@echo off
title EcoSort Local Server Launcher
echo ========================================================
echo               STARTING ECOSORT LOCALLY
echo ========================================================
echo.

echo 1. Starting Laravel Backend on http://127.0.0.1:8000 ...
start "EcoSort Backend" cmd /k "cd /d C:\Users\MASU\.gemini\antigravity\scratch\ecosort-backend && php artisan serve"

echo 2. Starting React Vite Frontend on http://localhost:5173 ...
start "EcoSort Frontend" cmd /k "cd /d C:\Users\MASU\.gemini\antigravity\scratch\ecosort-fullstack\frontend && npm run dev"

echo.
echo ========================================================
echo  Both servers are now running in separate windows!
echo  Open your browser at: http://localhost:5173
echo.
echo  Admin Credentials:
echo  Email: admin@ecosort.local
echo  Password: admin1234
echo ========================================================
pause
