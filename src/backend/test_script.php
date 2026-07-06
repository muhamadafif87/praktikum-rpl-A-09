<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $service = app(App\Services\PesananService::class);
    $result = $service->seedingDetailPesanan('laundry', '1');
    echo "SUCCESS: \n" . json_encode($result);
} catch (\Exception $e) {
    echo 'EXCEPTION: ' . $e->getMessage();
} catch (\Error $e) {
    echo 'ERROR: ' . $e->getMessage();
}
