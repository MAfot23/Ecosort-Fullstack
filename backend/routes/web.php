<?php

use Illuminate\Support\Facades\Route;

// Serve React SPA production build if present, otherwise fallback to welcome view
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api).*$');
