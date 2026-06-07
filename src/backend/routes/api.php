<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Order\PesananController;
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
    // Routes Landing Page - User Access
    //------
    Route::prefix('landing-page')->name('landing-page.')->group(function () {
        Route::get('/statistic', [LandingPageController::class, 'statistic'])->name('statistic');

        Route::middleware('auth:sanctum')->group(function(){
            Route::get('/search', [LandingPageController::class, 'searchLayanan'])->name('search');

            Route::post('/generate-fee-pesanan', [PesananController::class, 'estimateFeePesanan'])->name('generatefeepesanan');

            //Pesanan
            Route::prefix('laundry-express')->name('laundry-express.')->group(function () {
                Route::get('/', [LandingPageController::class, 'laundryExpress'])->name('index');
                Route::get('/detail-pesanan', [PesananController::class, 'seedingDetailPesanan'])->name('detail-pesanan');
            });

            Route::prefix('galon-gas')->name('galon-gas.')->group(function (){
                Route::get('/', [LandingPageController::class, 'galonGas'])->name('index');
                Route::get('/detail-pesanan', [PesananController::class, 'seedingDetailPesanan'])->name('detail-pesanan');
            });

            Route::prefix('daily-cleaning')->name('daily-cleaning.')->group(function (){
                Route::get('/', [LandingPageController::class, 'dailyCleaning'])->name('index');
                Route::get('/detail-pesanan', [PesananController::class, 'seedingDetailPesanan'])->name('detail-pesanan');
            });

        });
    });

    //----------------
    // Routes Dashboard Mitra
    //----------------
    Route::prefix('mitra')->middleware('auth:sanctum,guard:mitra')->name('mitra.')->group(function() {
        //
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
