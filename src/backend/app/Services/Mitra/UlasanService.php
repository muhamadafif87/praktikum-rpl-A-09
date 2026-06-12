<?php

namespace App\Services\Mitra;

use App\Models\Mitra;
use App\Models\Ulasan;
use Illuminate\Pagination\LengthAwarePaginator;

class UlasanService
{
    /**
     * List ulasan milik mitra dengan filter rating + search + pagination.
     */
    public function index(Mitra $mitraUser, array $filters): LengthAwarePaginator
    {
        $idMitra = $mitraUser->id_mitra;
        $rating  = $filters['rating'] ?? null;
        $search  = $filters['search'] ?? null;
        $limit   = (int) ($filters['limit'] ?? 10);

        $query = Ulasan::with(['Pesanan.User', 'Pesanan.DetailPesanan.Layanan'])
            ->whereHas('Pesanan', fn($q) => $q->where('id_mitra', $idMitra))
            ->orderByDesc('created_at');

        if ($rating) {
            $query->where('rating', (int) $rating);
        }

        // 2. Search: Mencari berdasarkan nama user atau nama layanan di tabel relasi
        if ($search) {
            $query->whereHas('Pesanan', function ($qPesanan) use ($search) {
                // Cari di tabel User
                $qPesanan->whereHas('User', function ($qUser) use ($search) {
                    $qUser->where('nama_lengkap', 'LIKE', "%{$search}%");
                })
                // Atau cari di tabel Layanan via DetailPesanan
                ->orWhereHas('DetailPesanan.Layanan', function ($qLayanan) use ($search) {
                    $qLayanan->where('nama_layanan', 'LIKE', "%{$search}%");
                });
            });
        }

        $paginator = $query->paginate($limit);

        // 3. Mapping data agar format response sesuai dengan skema penamaan data dasar
        $paginator->getCollection()->transform(function ($ulasan) {
            $user = $ulasan->Pesanan->User ?? null;
            $layanan = $ulasan->Pesanan->DetailPesanan->first()?->Layanan;

            return [
                'id'             => $ulasan->id_ulasan,
                'nama_pelanggan' => $user->nama_lengkap ?? 'Pelanggan',
                'nama_layanan'   => $layanan->nama_layanan ?? 'Layanan',
                'rating'         => (int) $ulasan->rating,
                'komentar'       => $ulasan->komentar,
                'created_at'     => $ulasan->created_at,
            ];
        });

        return $paginator;
    }

    /**
     * Statistik agregat untuk widget performa mitra:
     * - rata-rata rating
     * - total ulasan
     * - distribusi per bintang (1–5)
     * - persentase bintang 5
     */
    public function statistik(Mitra $mitraUser): array
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
