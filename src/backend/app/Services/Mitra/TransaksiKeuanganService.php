<?php

namespace App\Services\Mitra;
use App\Models\TransaksiKeuangan;
use App\Models\Mitra;
use App\Models\Pesanan;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

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
    public function index(Mitra $mitraUser, array $filters): LengthAwarePaginator
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
    public function ringkasan(Mitra $mitraUser): array
    {
        $idMitra = $mitraUser->id_mitra;

        $totalsKeuangan = TransaksiKeuangan::where('id_mitra', $idMitra)
            ->selectRaw("
                SUM(CASE WHEN status_dana = ? THEN jumlah ELSE 0 END) as saldo_tersedia,
                SUM(CASE WHEN status_dana = ? THEN jumlah ELSE 0 END) as saldo_tertahan
            ", [
                TransaksiKeuangan::STATUS_TERSEDIA,
                TransaksiKeuangan::STATUS_TERTAHAN,
            ])
            ->first();

        $statusSelesai = 'selesai';

        $totalsPesanan = DB::table('pesanan') // atau Pesanan::where(...) jika menggunakan Model
            ->where('id_mitra', $idMitra)
            ->selectRaw("
                SUM(CASE WHEN status_pesanan = ? THEN (catatan->>'total_pembayaran')::numeric ELSE 0 END) as total_pendapatan,
                COUNT(CASE WHEN status_pesanan = ? THEN 1 END) as pesanan_selesai
            ", [$statusSelesai, $statusSelesai])
            ->first();

        return [
            'total_pendapatan' => (float) ($totalsPesanan->total_pendapatan ?? 0),
            'saldo_tersedia'   => (float) ($totalsKeuangan->saldo_tersedia ?? 0),
            'pesanan_selesai'  => (int)   ($totalsPesanan->pesanan_selesai ?? 0),
            'saldo_tertahan'   => (float) ($totalsKeuangan->saldo_tertahan ?? 0),
        ];
    }

    public function getTrenPendapatanMingguan($mitraId)
    {
        if (is_object($mitraId)) {
            if (property_exists($mitraId, 'id')) {
                $mitraId = $mitraId->id;
            } elseif (method_exists($mitraId, 'getKey')) {
                $mitraId = $mitraId->getKey();
            }
        } elseif (is_array($mitraId) && isset($mitraId['id'])) {
            $mitraId = $mitraId['id'];
        } elseif (is_string($mitraId)) {
            $decoded = json_decode($mitraId, true);
            if (json_last_error() === JSON_ERROR_NONE && isset($decoded['id'])) {
                $mitraId = $decoded['id'];
            }
        }

        if (!is_numeric($mitraId) && !is_string($mitraId)) {
            throw new \InvalidArgumentException('mitraId harus berupa integer, UUID, atau array/object yang berisi id.');
        }

        if (is_numeric($mitraId)) {
            $mitraId = (int) $mitraId;
        }

        $startDate = Carbon::now()->subDays(6)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        $pendapatanHarian = Pesanan::where('id_mitra', $mitraId)
            ->whereBetween('tgl_pesanan', [$startDate, $endDate])
            ->where('status_pesanan', 'selesai')
            ->select(
                DB::raw("TO_CHAR(tgl_pesanan::date, 'YYYY-MM-DD') as tanggal"),
                DB::raw("SUM( COALESCE( NULLIF( (catatan->>'total_pembayaran'), '' )::numeric, 0 ) ) as total_pendapatan")
            )
            ->groupBy(DB::raw("tgl_pesanan::date"))
            ->orderBy('tanggal', 'asc')
            ->get()
            ->keyBy('tanggal');

        $labels = [];
        $data = [];
        $totalSaldo = 0; // Kalkulasi total saldo untuk seeding

        for ($i = 6; $i >= 0; $i--) {
            $dateObj = Carbon::now()->subDays($i);
            $dateString = $dateObj->format('Y-m-d');

            $labels[] = $dateObj->translatedFormat('D');

            $total = isset($pendapatanHarian[$dateString])
                ? (float) $pendapatanHarian[$dateString]->total_pendapatan
                : 0;

            $data[] = $total;
            $totalSaldo += $total;
        }

        return [
            // Mengubah key agar match dengan state chartData di React (x_labels & series)
            'saldo'    => $totalSaldo,
            'x_labels' => $labels,
            'series'   => $data,
        ];
    }
}
