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

    Route::middleware('auth:sanctum')->group(function () {

        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::get('/me',      [AuthController::class, 'me'])->name('me');
        });

        // Landing Page
        Route::prefix('landing-page')->name('landing-page.')->group(function () {

            Route::get('/statistic', [LandingPageController::class, 'statistic'])->name('statistic');
            Route::get('/search',    [LandingPageController::class, 'searchLayanan'])->name('search');

            // Estimasi fee
            Route::post('/generate-fee-pesanan', [PesananController::class, 'estimateFeePesanan'])
                ->name('generate-fee-pesanan');

            // Seeding detail (form order)
            Route::prefix('laundry-express')->name('laundry-express.')->group(function () {
                Route::get('/',               [LandingPageController::class, 'laundryExpress'])->name('index');
                Route::get('/detail-pesanan', [PesananController::class, 'seedingDetailPesanan'])->name('detail-pesanan');
            });

            Route::prefix('galon-gas')->name('galon-gas.')->group(function () {
                Route::get('/',               [LandingPageController::class, 'galonGas'])->name('index');
                Route::get('/detail-pesanan', [PesananController::class, 'seedingDetailPesanan'])->name('detail-pesanan');
            });

            Route::prefix('daily-cleaning')->name('daily-cleaning.')->group(function () {
                Route::get('/',               [LandingPageController::class, 'dailyCleaning'])->name('index');
                Route::get('/detail-pesanan', [PesananController::class, 'seedingDetailPesanan'])->name('detail-pesanan');
            });

            Route::prefix('pesanan')->name('pesanan.')->group(function () {

                // Buat pesanan baru
                Route::post('/', [PesananController::class, 'createPesanan'])->name('create');

                // Riwayat pesanan milik user yang login
                // GET /landing-page/pesanan/riwayat?status=pending&tgl_dari=2025-01-01&per_page=10
                Route::get('/riwayat', [PesananController::class, 'riwayatPesananUser'])->name('riwayat');

                // Detail pesanan by id_unique_pesanan
                Route::get('/{idUniquePesanan}', [PesananController::class, 'showDetailPesanan'])->name('detail');

                // Cancel pesanan — user hanya bisa saat status pending
                Route::patch('/{idUniquePesanan}/cancel', [PesananController::class, 'cancelPesananUser'])->name('cancel');
            });
        });
    });

    // -------------------------------------------------------------------------
    // Protected — auth:sanctum,guard:mitra (Mitra)
    // -------------------------------------------------------------------------
    Route::prefix('mitra')->middleware('auth:sanctum,guard:mitra')->name('mitra.')->group(function () {

        // ----------------------------------------------------------------
        // Pesanan — aksi mitra
        // ----------------------------------------------------------------
        Route::prefix('pesanan')->name('pesanan.')->group(function () {

            // Riwayat pesanan masuk ke mitra yang login
            // GET /mitra/pesanan/riwayat?status=diproses&per_page=10
            Route::get('/riwayat', [PesananController::class, 'riwayatPesananMitra'])->name('riwayat');

            // Detail pesanan (mitra bisa lihat info user)
            Route::get('/{idUniquePesanan}', [PesananController::class, 'showDetailPesanan'])->name('detail');

            // Cancel pesanan — mitra bisa cancel kecuali status selesai/dibatalkan
            Route::patch('/{idUniquePesanan}/cancel', [PesananController::class, 'cancelPesananMitra'])->name('cancel');
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
