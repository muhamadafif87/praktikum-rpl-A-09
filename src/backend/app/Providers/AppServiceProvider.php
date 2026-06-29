<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Pesanan;
use App\Observers\PesananObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Pesanan::observe(PesananObserver::class);
    }
}
