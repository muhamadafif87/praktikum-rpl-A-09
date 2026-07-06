<?php

namespace Tests\Unit;

use App\Models\Mitra;
use App\Services\PesananService;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class estimateFeePesananTest extends TestCase
{
    /**
     * A basic unit test example.
     */
    protected PesananService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PesananService();
    }

     #[Test]
    public function it_should_calculate_correct_total_for_daily_cleaning_with_extra_tools_fee_within_06km()
    {
        // Arrange
        $mitra = Mitra::find(6);

        // Act
        $result = $this->service->estimateFeePesanan(
            idMitra: (string) $mitra->id_mitra,
            typeLayanan: 'daily_cleaning',
            layananList: [
                ['idLayanan' => 81, 'qty' => 1],
            ],
            jarakOngkir: 0.6,
            biayaTambahan: [],
            biayaTambahanAlat: [
                'Sabun & Cairan Kaca'       => 10000,
                'Obat Pel & Karbol Premium' => 10000,
            ]
        );

        $ringkasan = $result['ringkasan'];

        // Assert
        $this->assertEquals(15000, $ringkasan['subtotal']);
        $this->assertEquals(20000, $ringkasan['biaya_tambahan_alat']);
        $this->assertEquals(4000,  $ringkasan['biaya_transportasi']);
        $this->assertEquals(1000,  $ringkasan['biaya_layanan_aplikasi']);
        $this->assertEquals(40000, $ringkasan['total_pembayaran']);
    }
}
