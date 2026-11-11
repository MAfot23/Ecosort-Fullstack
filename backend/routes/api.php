<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DetectController;
use App\Http\Controllers\Api\ScoreController;
use App\Http\Controllers\Api\WasteItemController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

// ── Public ────────────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/waste-items', [WasteItemController::class, 'index']);

// Camera detection (logs scan; user_id nullable so works while unauthenticated too)
Route::post('/detect',        [DetectController::class, 'store']);
Route::post('/detect/manual', [DetectController::class, 'manual']);
Route::get('/detect/count',   [DetectController::class, 'count']);
Route::get('/scans/weekly',   [DetectController::class, 'weeklyStats']);

// ── Requires a logged-in user (Bearer token from login/register) ──────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);

    Route::post('/scores/game', [ScoreController::class, 'storeGame']);
    Route::post('/scores/quiz', [ScoreController::class, 'storeQuiz']);
    Route::get('/scores/best',  [ScoreController::class, 'best']);

    // ── Admin only ───────────────────────────────────────────────────────────
    Route::middleware(AdminMiddleware::class)->prefix('admin')->group(function () {
        Route::get('/stats',       [AdminController::class, 'stats']);
        Route::get('/scan-logs',   [AdminController::class, 'scanLogs']);
        Route::get('/users',       [AdminController::class, 'users']);
        Route::patch('/users/{user}/toggle-admin', [AdminController::class, 'toggleAdmin']);

        Route::get('/waste-items',          [AdminController::class, 'wasteItems']);
        Route::post('/waste-items',         [AdminController::class, 'storeWasteItem']);
        Route::patch('/waste-items/{wasteItem}',   [AdminController::class, 'updateWasteItem']);
        Route::delete('/waste-items/{wasteItem}',  [AdminController::class, 'destroyWasteItem']);
    });
});
