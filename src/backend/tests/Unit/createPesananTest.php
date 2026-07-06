<?php

namespace Tests\Unit;

use App\Services\PesananService;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class createPesananTest extends TestCase
{
    protected PesananService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PesananService();
    }

     #[Test]
    public function it_should_return_correct_detail_pesanan_for_laundry()
    {
        // Arrange
        $idUniquePesanan = 'ORD-LAUNDRY-20260628-OUZ3H2';
        $idUser = 2;

        // Act
        $result = $this->service->showDetailPesanan(
            idUniquePesanan: $idUniquePesanan,
            idUser: $idUser,
        );

        // Assert — identitas pesanan
        $this->assertEquals(714, $result['id_pesanan']);
        $this->assertEquals('ORD-LAUNDRY-20260628-OUZ3H2', $result['id_unique_pesanan']);
        $this->assertEquals('pending', $result['status_pesanan']);

        // Assert — mitra
        $this->assertEquals(1, $result['mitra']['id_mitra']);
        $this->assertEquals('Laundry Cepat', $result['mitra']['nama_mitra']);
        $this->assertEquals('laundry', $result['mitra']['jenis_jasa']);

        // Assert — user
        $this->assertEquals(2, $result['user']['id_user']);
        $this->assertEquals('muhamad akbar kurniawan', $result['user']['nama_lengkap']);
        $this->assertEquals('0882005916362', $result['user']['nomor_telepon']);

        // Assert — detail layanan
        $this->assertCount(1, $result['detail_layanan']);
        $detailLayanan = $result['detail_layanan'][0];
        $this->assertEquals(219, $detailLayanan['id_detail_pesanan']);
        $this->assertEquals('Laundry Kiloan Reguler', $detailLayanan['nama_layanan']);
        $this->assertEquals('kg', $detailLayanan['satuan']);
        $this->assertEquals(10000, $detailLayanan['harga']);
        $this->assertEquals(2, $detailLayanan['jumlah']);
        $this->assertEquals(20000, $detailLayanan['subtotal']);

        // Assert — ringkasan biaya
        $ringkasan = $result['ringkasan_biaya'];
        $this->assertNull($ringkasan['subtotal']);
        $this->assertEquals(4000, $ringkasan['biaya_ongkir']);
        $this->assertEquals(1000, $ringkasan['biaya_aplikasi']);
        $this->assertNull($ringkasan['biaya_tambahan_alat']);
        $this->assertEquals(25000, $ringkasan['total_pembayaran']);

        // Assert — lainnya
        $this->assertEquals('09:00', $result['jadwal_layanan'][0]['jam']);
        $this->assertNull($result['jadwal_layanan'][0]['tanggal']);
        $this->assertNull($result['catatan_pengiriman']);
        $this->assertNull($result['pembayaran']);
        $this->assertNull($result['ulasan']);
    }
}
