<?php

return [

    /*
    |--------------------------------------------------------------------------
    | View Storage Paths
    |--------------------------------------------------------------------------
    |
    | Di sini kamu bisa menentukan path tempat view disimpan. Biasanya
    | Laravel akan mencari view di folder resources/views.
    |
    */

    'paths' => [
        resource_path('views'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Compiled View Path
    |--------------------------------------------------------------------------
    |
    | Semua Blade template akan dikompilasi menjadi PHP biasa dan disimpan
    | di folder storage/framework/views. Kamu bisa mengubah path ini jika perlu.
    |
    */

    'compiled' => env('APP_ENV') === 'production'
    ? '/tmp/storage/framework/views'
    : realpath(storage_path('framework/views')),

];
