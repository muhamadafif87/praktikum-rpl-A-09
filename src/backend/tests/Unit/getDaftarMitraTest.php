<?php

namespace Tests\Unit;

use App\Services\LandingPageService;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class getDaftarMitraTest extends TestCase
{
    /**
     * A basic unit test example.
     */
    #[Test]
    public function it_should_return_laundry_list_sorted_by_nearest_with_lat_lng()
    {
        // Arrange
        $service = new LandingPageService();

        // Act
        $result = $service->seedingDataLayanan_laundryExpress(
            kategori: ['All'],
            sortBy: 'Terdekat',
            lat: -7.5528565,
            lng: 110.8547437,
        );

        // Assert — hasil tidak kosong
        $this->assertNotEmpty($result);

        // Assert — semua item punya key yang diharapkan
        foreach ($result as $mitra) {
            $this->assertArrayHasKey('id_mitra', $mitra);
            $this->assertArrayHasKey('nama_mitra', $mitra);
            $this->assertArrayHasKey('jenis_jasa', $mitra);
            $this->assertArrayHasKey('rating', $mitra);
            $this->assertArrayHasKey('jumlah_ulasan', $mitra);
            $this->assertArrayHasKey('is_buka', $mitra);
            $this->assertArrayHasKey('layanan', $mitra);
            $this->assertArrayHasKey('jarak_km', $mitra);
            $this->assertArrayHasKey('is_dalam_jangkauan', $mitra);
            $this->assertArrayHasKey('sample_ulasan', $mitra);

            // Assert — jenis_jasa harus laundry
            $this->assertEquals('laundry', $mitra['jenis_jasa']);

            // Assert — jarak_km harus ada karena lat/lng dikirim
            $this->assertNotNull($mitra['jarak_km']);
            $this->assertIsFloat($mitra['jarak_km']);

            // Assert — is_buka harus boolean
            $this->assertIsBool($mitra['is_buka']);

            // Assert — layanan tidak kosong dan punya key yang benar
            $this->assertNotEmpty($mitra['layanan']);
            foreach ($mitra['layanan'] as $layanan) {
                $this->assertArrayHasKey('id_layanan', $layanan);
                $this->assertArrayHasKey('nama_layanan', $layanan);
                $this->assertArrayHasKey('harga_satuan', $layanan);
                $this->assertArrayHasKey('satuan', $layanan);
            }

            // Assert — sample_ulasan max 5
            $this->assertLessThanOrEqual(5, count($mitra['sample_ulasan']));
            foreach ($mitra['sample_ulasan'] as $ulasan) {
                $this->assertArrayHasKey('nama_user', $ulasan);
                $this->assertArrayHasKey('rating', $ulasan);
                $this->assertArrayHasKey('komentar', $ulasan);
                $this->assertArrayHasKey('tgl_ulasan', $ulasan);
            }
        }

        // Assert — urutan terdekat: jarak_km ascending
        $jarakList = array_column($result->toArray(), 'jarak_km');
        $jarakSorted = $jarakList;
        sort($jarakSorted);
        $this->assertEquals($jarakSorted, $jarakList, 'Hasil tidak urut dari yang terdekat');

        // Assert — spot check mitra id_mitra=4 (Laundry Kilat, jarak terdekat pertama)
        $mitraKilat = $result->firstWhere('id_mitra', 4);
        $this->assertNotNull($mitraKilat);
        $this->assertEquals('Laundry Kilat', $mitraKilat['nama_mitra']);
        $this->assertEquals(4.8, $mitraKilat['rating']);
        $this->assertEquals(29, $mitraKilat['jumlah_ulasan']);
        $this->assertTrue($mitraKilat['is_dalam_jangkauan']);
        $this->assertCount(4, $mitraKilat['layanan']);

        // Assert — spot check mitra id_mitra=1 (Laundry Cepat)
        $mitraCepat = $result->firstWhere('id_mitra', 1);
        $this->assertNotNull($mitraCepat);
        $this->assertEquals('Laundry Cepat', $mitraCepat['nama_mitra']);
        $this->assertEquals(4.0, $mitraCepat['rating']);
        $this->assertEquals(20, $mitraCepat['jumlah_ulasan']);
        $this->assertTrue($mitraCepat['is_buka']);
        $this->assertCount(3, $mitraCepat['layanan']);
    }
}
