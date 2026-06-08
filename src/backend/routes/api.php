<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Dashboard\Mitra\MitraAssetImageController;
use App\Http\Controllers\Api\V1\Page\LandingPageController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public routes (admin, user, mitra)
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('register');
        Route::post('/login',    [AuthController::class, 'login'])->name('login');
    });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::get('/me',      [AuthController::class, 'me'])->name('me');
        });
    });

    //------
    // Routes Landing Page - Public Access
    //------
    Route::prefix('landing-page')->name('landing-page.')->group(function () {
        Route::get('/statistic', [LandingPageController::class, 'statistic'])->name('statistic');
        Route::middleware('auth:sanctum')->group(function(){
            Route::get('/search', [LandingPageController::class, 'searchLayanan'])->name('search');
            Route::get('/laundry-express', [LandingPageController::class, 'laundryExpress'])->name('laundry-express');
            Route::get('/galon-gas', [LandingPageController::class, 'galonGas'])->name('galon-gas');
            Route::get('/daily-cleaning', [LandingPageController::class, 'dailyCleaning'])->name('daily-cleaning');
        });
    });

    Route::get('mitra/{idMitra}/images', [MitraAssetImageController::class, 'index']);

    Route::prefix('mitra-images')->group(function () {
        Route::get('{id}',    [MitraAssetImageController::class, 'show']);
        Route::post('/',      [MitraAssetImageController::class, 'store']);
        Route::post('{id}',   [MitraAssetImageController::class, 'update']);
        Route::delete('{id}', [MitraAssetImageController::class, 'destroy']);
    });


    //------
    // Routes get list layanan
    //--------
    //semua layanan
    //layanan tertentu
    //layanan tertentu dengan filter kategori

    //------
    // Routes get ulasan
    //--------

});
