<?php

namespace App\Services\Mitra;
use App\Models\TransaksiKeuangan;
use App\Models\MitraLoginAccess;
use Illuminate\Pagination\LengthAwarePaginator;


class TransaksiKeuanganService
{
    // Map query param → nilai enum DB
    private const STATUS_MAP = [
        'tersedia' => TransaksiKeuangan::STATUS_TERSEDIA,
        'tertahan' => TransaksiKeuangan::STATUS_TERTAHAN,
    ];

    /**
     * List transaksi dengan filter status_dana + search + pagination.
     */
    public function index(MitraLoginAccess $mitraUser, array $filters): LengthAwarePaginator
    {
        $idMitra    = $mitraUser->id_mitra;
        $search     = $filters['search'] ?? null;
        $statusDana = $filters['status_dana'] ?? 'all';
        $limit      = (int) ($filters['limit'] ?? 10);

        $query = TransaksiKeuangan::where('id_mitra', $idMitra)
            ->orderByDesc('tanggal_transaksi');

        // Filter status dana
        if ($statusDana && $statusDana !== 'all') {
            $dbStatus = self::STATUS_MAP[$statusDana] ?? null;
            if ($dbStatus) {
                $query->where('status_dana', $dbStatus);
            }
        }

        // Search: id_transaksi atau nama_pelanggan (snapshot)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id_transaksi', 'ILIKE', "%{$search}%")
                  ->orWhere('nama_pelanggan', 'ILIKE', "%{$search}%");
            });
        }

        return $query->paginate($limit);
    }

    /**
     * Ringkasan finansial untuk widget dashboard:
     * total tersedia, total tertahan, dan grand total.
     */
    public function ringkasan(MitraLoginAccess $mitraUser): array
    {
        $idMitra = $mitraUser->id_mitra;

        $totals = TransaksiKeuangan::where('id_mitra', $idMitra)
            ->selectRaw("
                SUM(CASE WHEN status_dana = ? THEN jumlah ELSE 0 END) as total_tersedia,
                SUM(CASE WHEN status_dana = ? THEN jumlah ELSE 0 END) as total_tertahan,
                SUM(jumlah) as grand_total,
                COUNT(*) as total_transaksi
            ", [
                TransaksiKeuangan::STATUS_TERSEDIA,
                TransaksiKeuangan::STATUS_TERTAHAN,
            ])
            ->first();

        return [
            'total_tersedia'   => (float) ($totals->total_tersedia ?? 0),
            'total_tertahan'   => (float) ($totals->total_tertahan ?? 0),
            'grand_total'      => (float) ($totals->grand_total ?? 0),
            'total_transaksi'  => (int)   ($totals->total_transaksi ?? 0),
        ];
    }
}
