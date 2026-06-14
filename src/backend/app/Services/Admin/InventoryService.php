<?php

namespace App\Services\Admin;

use App\Models\Layanan;
use App\Models\Mitra;
use Illuminate\Pagination\LengthAwarePaginator;

class InventoryService
{
    /**
     * Daftar inventaris lintas mitra dengan filter dan pagination.
     * Hasil dikelompokkan per mitra beserta list layanannya.
     *
     * @param  array{filter_mitra?: string, filter_status_stok?: string} $filters
     * @param  int $perPage
     * @return LengthAwarePaginator
     */
    public function getInventoryList(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $LOW_STOCK_THRESHOLD = 10;

        $query = Mitra::with(['Layanan' => function ($q) use ($filters, $LOW_STOCK_THRESHOLD) {
            $statusStok = $filters['filter_status_stok'] ?? 'All';

            if ($statusStok === 'In Stock') {
                $q->where('stok_tersedia', '>', $LOW_STOCK_THRESHOLD);
            } elseif ($statusStok === 'Low Stock') {
                $q->where('stok_tersedia', '>', 0)
                  ->where('stok_tersedia', '<=', $LOW_STOCK_THRESHOLD);
            } elseif ($statusStok === 'Out of Stock') {
                $q->where('stok_tersedia', 0);
            }
        }]);

        // Filter nama mitra
        if (!empty($filters['filter_mitra']) && $filters['filter_mitra'] !== 'All') {
            $query->where('nama_mitra', $filters['filter_mitra']);
        }

        // Hanya tampilkan mitra yang memiliki layanan sesuai filter
        if (!empty($filters['filter_status_stok']) && $filters['filter_status_stok'] !== 'All') {
            $statusStok = $filters['filter_status_stok'];
            $query->whereHas('Layanan', function ($q) use ($statusStok, $LOW_STOCK_THRESHOLD) {
                if ($statusStok === 'In Stock') {
                    $q->where('stok_tersedia', '>', $LOW_STOCK_THRESHOLD);
                } elseif ($statusStok === 'Low Stock') {
                    $q->where('stok_tersedia', '>', 0)
                        ->where('stok_tersedia', '<=', $LOW_STOCK_THRESHOLD);
                } elseif ($statusStok === 'Out of Stock') {
                    $q->where('stok_tersedia', 0);
                }
            });
        }

        return $query->paginate($perPage)->through(function (Mitra $mitra) use ($LOW_STOCK_THRESHOLD) {
            return [
                'id_mitra'     => $mitra->id_mitra,
                'nama_mitra'   => $mitra->nama_mitra,
                'list_layanan' => $mitra->Layanan->map(fn (Layanan $l) => [
                    'id_layanan'   => $l->id_layanan,
                    'nama_layanan' => $l->nama_layanan,
                    'jumlah_stok'  => $l->stok_tersedia,
                    'status_stok'  => $this->resolveStokStatus($l->stok_tersedia ?? 0, $LOW_STOCK_THRESHOLD),
                ])->values()->toArray(),
            ];
        });
    }

    private function resolveStokStatus(int $jumlahStok, int $lowThreshold): string
    {
        if ($jumlahStok === 0) {
            return 'Stok Habis';
        }

        if ($jumlahStok <= $lowThreshold) {
            return 'Stok Rendah';
        }

        return 'In Stock';
    }
}
