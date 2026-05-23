<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Serve the React SPA for all auth-related frontend routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
