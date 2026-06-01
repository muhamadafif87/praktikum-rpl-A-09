<?php

use Illuminate\Support\Facades\Route;

// Redirect root to the decoupled frontend (Vite)
Route::get('/', function () {
    return redirect('http://localhost:5173');
});

// Any other non-API routes also redirect to frontend
Route::get('/{any}', function () {
    return redirect('http://localhost:5173');
})->where('any', '^(?!api).*$');
