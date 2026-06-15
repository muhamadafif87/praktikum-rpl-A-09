<?php

namespace App\Services\Admin;

use App\Models\Layanan;
use App\Models\Mitra;
use App\Models\Pesanan;
use Illuminate\Support\Carbon;

class StatisticService
{
    /**
     * Ringkasan total transaksi dan info mitra aktif.
     *
     * @return array{
     *     total_transaksi: int,
     *     mitra: array{total_mitra_aktif: int, penambahan_mitra: int}
     * }
     */
    public function getOverviewSummary(): array
    {
        $totalTransaksi   = Pesanan::count();
        $totalMitraAktif  = Mitra::where('status_verifikasi', 'TRUE')->count();

        // Penambahan mitra = mitra baru dalam 15 hari terakhir
        $penambahanMitra  = Mitra::where('verified_at', '>=', Carbon::now()->subDays(15))->count();

        return [
            'total_transaksi' => $totalTransaksi,
            'mitra'           => [
                'total_mitra_aktif' => $totalMitraAktif,
                'penambahan_mitra'  => $penambahanMitra,
            ],
        ];
    }

    /**
     * Ringkasan inventaris: total layanan, stok rendah, stok habis,
     * dan persentase ketersediaan layanan.
     *
     * Stok rendah : jumlah_stok > 0 && jumlah_stok <= LOW_STOCK_THRESHOLD
     * Stok habis  : jumlah_stok = 0
     *
     * @return array{
     *     total_layanan: int,
     *     persentase_ketersediaan: float,
     *     layanan_stok_rendah: array,
     *     layanan_stok_habis: array
     * }
     */
    public function getInventorySummary(): array
    {
        $LOW_STOCK_THRESHOLD = 10;

        $totalLayanan = Layanan::count();

        $stokRendah = Layanan::with('mitra:id_mitra,nama_mitra')
            ->where('stok_tersedia', '>', 0)
            ->where('stok_tersedia', '<=', $LOW_STOCK_THRESHOLD)
            ->get()
            ->map(fn (Layanan $l) => [
                'id_mitra'     => $l->id_mitra,
                'id_layanan'   => $l->id_layanan,
                'nama_layanan' => $l->nama_layanan,
                'jumlah_stok'  => $l->stok_tersedia,
            ])
            ->toArray();

        $stokHabis = Layanan::with('mitra:id_mitra,nama_mitra')
            ->where('stok_tersedia', 0)
            ->get()
            ->map(fn (Layanan $l) => [
                'id_mitra'     => $l->id_mitra,
                'id_layanan'   => $l->id_layanan,
                'nama_layanan' => $l->nama_layanan,
                'jumlah_stok'  => $l->stok_tersedia,
            ])
            ->toArray();

        $layananTersedia      = $totalLayanan - count($stokHabis);
        $persentase           = $totalLayanan > 0
            ? round(($layananTersedia / $totalLayanan) * 100, 2)
            : 0.0;

        return [
            'total_layanan'           => $totalLayanan,
            'persentase_ketersediaan' => $persentase,
            'layanan_stok_rendah'     => $stokRendah,
            'layanan_stok_habis'      => $stokHabis,
        ];
    }

    /**
     * Ringkasan mitra: total, aktif, baru (15 hari terakhir), suspend.
     *
     * @return array{
     *     total_mitra: int,
     *     total_mitra_aktif: int,
     *     jumlah_mitra_baru: int,
     *     mitra_disuspend: int
     * }
     */
    public function getMitraSummary(): array
    {
        return [
            'total_mitra'       => Mitra::count(),
            'total_mitra_aktif' => Mitra::where('status_verifikasi', 'TRUE')->count(),
            'jumlah_mitra_baru' => Mitra::where('verified_at', '>=', Carbon::now()->subDays(15))->count(),
            'mitra_disuspend'   => Mitra::where('status_verifikasi', 'FALSE')->count(),
        ];
    }
}
