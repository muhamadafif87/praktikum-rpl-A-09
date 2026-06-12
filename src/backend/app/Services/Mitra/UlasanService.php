<?php

namespace App\Services\Mitra;

use App\Models\Ulasan;
use App\Models\MitraLoginAccess;
use Illuminate\Pagination\LengthAwarePaginator;

class UlasanService
{
    /**
     * List ulasan milik mitra dengan filter rating + search + pagination.
     */
    public function index(MitraLoginAccess $mitraUser, array $filters): LengthAwarePaginator
    {
        $idMitra = $mitraUser->id_mitra;
        $rating  = $filters['rating'] ?? null;
        $search  = $filters['search'] ?? null;
        $limit   = (int) ($filters['limit'] ?? 10);

        $query = Ulasan::whereHas('Pesanan', fn($q) => $q->where('id_mitra', $idMitra))
            ->orderByDesc('created_at');

        if ($rating) {
            $query->where('rating', (int) $rating);
        }

        // Search: nama pelanggan atau nama layanan
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_pelanggan', 'ILIKE', "%{$search}%")
                  ->orWhere('nama_layanan',  'ILIKE', "%{$search}%");
            });
        }

        return $query->paginate($limit);
    }

    /**
     * Statistik agregat untuk widget performa mitra:
     * - rata-rata rating
     * - total ulasan
     * - distribusi per bintang (1–5)
     * - persentase bintang 5
     */
    public function statistik(MitraLoginAccess $mitraUser): array
    {
        $idMitra = $mitraUser->id_mitra;

        $baseQuery = Ulasan::whereHas('Pesanan', fn($q) => $q->where('id_mitra', $idMitra));

        $totalUlasan = (clone $baseQuery)->count();

        if ($totalUlasan === 0) {
            return [
                'rata_rata_rating'    => 0,
                'total_ulasan'        => 0,
                'persentase_bintang5' => 0,
                'distribusi'          => array_fill_keys(range(1, 5), 0),
            ];
        }

        $avgRating = (clone $baseQuery)->avg('rating');

        // Distribusi per bintang dalam satu query
        $distribusiRaw = (clone $baseQuery)
            ->selectRaw('rating, COUNT(*) as jumlah')
            ->groupBy('rating')
            ->pluck('jumlah', 'rating');

        // Pastikan semua bintang 1–5 ada di response (fill 0 kalau kosong)
        $distribusi = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribusi[$i] = (int) ($distribusiRaw[$i] ?? 0);
        }

        return [
            'rata_rata_rating'    => round((float) $avgRating, 2),
            'total_ulasan'        => $totalUlasan,
            'persentase_bintang5' => round(($distribusi[5] / $totalUlasan) * 100, 1),
            'distribusi'          => $distribusi,
        ];
    }
}
