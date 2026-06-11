<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Dashboard\Mitra\MitraAssetImageController;
use App\Http\Controllers\Api\V1\Location\NearbyMitraController;
use App\Http\Controllers\Api\V1\Location\UserAddressController;
use App\Http\Controllers\Api\V1\Order\PesananController;
use App\Http\Controllers\Api\V1\Page\LandingPageController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public routes (admin, user, mitra)
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('register');
        Route::post('/login',    [AuthController::class, 'login'])->name('login');
    });

    // Public Landing Page
    Route::prefix('landing-page')->name('landing-page.')->group(function () {
        Route::get('/statistic', [LandingPageController::class, 'statistic'])->name('statistic');
        Route::get('/search',    [LandingPageController::class, 'searchLayanan'])->name('search');

        Route::prefix('laundry-express')->name('laundry-express.')->group(function () {
            Route::get('/', [LandingPageController::class, 'laundryExpress'])->name('index');
        });

        Route::prefix('galon-gas')->name('galon-gas.')->group(function () {
            Route::get('/', [LandingPageController::class, 'galonGas'])->name('index');
        });

        Route::prefix('daily-cleaning')->name('daily-cleaning.')->group(function () {
            Route::get('/', [LandingPageController::class, 'dailyCleaning'])->name('index');
        });

        Route::prefix('/mitra')->group(function() {
            Route::get('/nearby', [NearbyMitraController::class, 'index']);
            Route::post('/nearby', [NearbyMitraController::class, 'searchByAddress']);
            Route::get('/nearby/categories', [NearbyMitraController::class, 'categories']);
        });
    });

    //User Address CRUD
    Route::prefix('/user')->middleware('auth:sanctum')->name('address.')->group(function() {
        Route::get('/address', [UserAddressController::class, 'show']);
        Route::put('/address', [UserAddressController::class, 'update']);
        Route::delete('/address', [UserAddressController::class, 'destroy']);
    });

    Route::middleware('auth:sanctum')->group(function () {

        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::get('/me',      [AuthController::class, 'me'])->name('me');
            Route::put('/me',      [AuthController::class, 'updateProfile'])->name('updateProfile');
        });

        // Protected Landing Page (Orders & Estimations)
        Route::prefix('landing-page')->name('landing-page.')->group(function () {

            // Estimasi fee
            Route::post('/generate-fee-pesanan', [PesananController::class, 'estimateFeePesanan'])
                ->name('generate-fee-pesanan');

            // Seeding detail (form order)
            Route::prefix('laundry-express')->name('laundry-express.')->group(function () {
                Route::get('/detail-pesanan', [PesananController::class, 'seedingDetailPesanan'])->name('detail-pesanan');
            });
            Route::prefix('galon-gas')->name('galon-gas.')->group(function () {
                Route::get('/detail-pesanan', [PesananController::class, 'seedingDetailPesanan'])->name('detail-pesanan');
            });
            Route::prefix('daily-cleaning')->name('daily-cleaning.')->group(function () {
                Route::get('/detail-pesanan', [PesananController::class, 'seedingDetailPesanan'])->name('detail-pesanan');
            });

            Route::prefix('pesanan')->name('pesanan.')->group(function () {
                // Buat pesanan baru
                Route::post('/', [PesananController::class, 'createPesanan'])->name('create');

                // Riwayat pesanan milik user yang login
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
        Route::prefix('pesanan')->name('pesanan.')->group(function () {

            // GET /mitra/pesanan/riwayat?status=diproses&per_page=10
            Route::get('/riwayat', [PesananController::class, 'riwayatPesananMitra'])->name('riwayat');

            // Detail pesanan (mitra bisa lihat info user)
            Route::get('/{idUniquePesanan}', [PesananController::class, 'showDetailPesanan'])->name('detail');

            // Cancel pesanan — mitra bisa cancel kecuali status selesai/dibatalkan
            Route::patch('/{idUniquePesanan}/cancel', [PesananController::class, 'cancelPesananMitra'])->name('cancel');
        });

        Route::get('{idMitra}/images', [MitraAssetImageController::class, 'index']);

        Route::prefix('mitra-images')->group(function () {
            Route::get('{id}',    [MitraAssetImageController::class, 'show']);
            Route::post('/',      [MitraAssetImageController::class, 'store']);
            Route::post('{id}',   [MitraAssetImageController::class, 'update']);
            Route::delete('{id}', [MitraAssetImageController::class, 'destroy']);
        });
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
