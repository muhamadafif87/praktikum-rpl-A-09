<?php

namespace App\Services\Mitra;

use App\Models\Mitra;
use App\Models\Pesanan;
use App\Models\MitraLoginAccess;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PesananService
{
    // Map query param → enum value di DB
    private const STATUS_MAP = [
        'pending' => Pesanan::STATUS_MENUNGGU,
        'diproses'       => Pesanan::STATUS_PROSES,
        'siap'          => Pesanan::STATUS_SIAP,
        'selesai'             => Pesanan::STATUS_SELESAI,
        'dibatalkan'          => Pesanan::STATUS_DIBATALKAN,
    ];

    /**
     * List pesanan milik mitra dengan filter + search + pagination.
     */
    public function index(Mitra $mitraUser, array $filters): LengthAwarePaginator
    {
        $idMitra = $mitraUser->id_mitra;
        $search  = $filters['search'] ?? null;
        $status  = $filters['status'] ?? 'all';
        $limit   = (int) ($filters['limit'] ?? 10);

        $query = Pesanan::with(['DetailPesanan.Layanan','User'])
            ->where('id_mitra', $idMitra)
            ->orderByDesc('tgl_pesanan');

        // Filter status
        if ($status && $status !== 'all') {
            $dbStatus = self::STATUS_MAP[$status] ?? null;
            if (!$dbStatus) {
                throw new InvalidArgumentException("Status tidak valid: {$status}");
            }
            $query->where('status_pesanan', $dbStatus);
        }

        // Search: id_unique_pesanan atau nama_lengkap dari relasi User
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id_unique_pesanan', 'ILIKE', "%{$search}%")
                ->orWhereHas('User', function ($uq) use ($search) {
                    $uq->where('nama_lengkap', 'ILIKE', "%{$search}%");
                });
            });
        }

        return $query->paginate($limit);
    }

    public function stats(Mitra $mitraUser, ?string $date = null): array
    {
        $idMitra = $mitraUser->id_mitra;
        $date = $date ?? now()->toDateString();

        // 1. Hitung statistik yang spesifik untuk "Hari Ini" (Total, Selesai, Dibatalkan)
        $countsToday = Pesanan::where('id_mitra', $idMitra)
            ->whereDate('tgl_pesanan', $date)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status_pesanan = ? THEN 1 ELSE 0 END) as selesai,
                SUM(CASE WHEN status_pesanan = ? THEN 1 ELSE 0 END) as dibatalkan
            ", [Pesanan::STATUS_SELESAI, Pesanan::STATUS_DIBATALKAN])
            ->first();

        // 2. Hitung statistik untuk pesanan aktif/pending tanpa batas waktu (All-Time Active)
        $countsAllTime = Pesanan::where('id_mitra', $idMitra)
            ->selectRaw("
                SUM(CASE WHEN status_pesanan = ? THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status_pesanan = ? THEN 1 ELSE 0 END) as diproses,
                SUM(CASE WHEN status_pesanan = ? THEN 1 ELSE 0 END) as siap,
                SUM(CASE WHEN status_pesanan IN (?, ?) THEN 1 ELSE 0 END) as aktif
            ", [
                Pesanan::STATUS_MENUNGGU,
                Pesanan::STATUS_PROSES,
                Pesanan::STATUS_SIAP,
                Pesanan::STATUS_PROSES, Pesanan::STATUS_SIAP
            ])
            ->first();

        return [
            'total'      => (int) ($countsToday->total ?? 0),
            'selesai'    => (int) ($countsToday->selesai ?? 0),
            'dibatalkan' => (int) ($countsToday->dibatalkan ?? 0),
            'pending'    => (int) ($countsAllTime->pending ?? 0),
            'diproses'   => (int) ($countsAllTime->diproses ?? 0),
            'siap'       => (int) ($countsAllTime->siap ?? 0),
            'aktif'      => (int) ($countsAllTime->aktif ?? 0),
        ];
    }

    /**
     * Detail satu pesanan — pastikan milik mitra yang login.
     */
    public function show(Mitra $mitraUser, int $id): Pesanan
    {
        $pesanan = Pesanan::with(['DetailPesanan.Layanan', 'Ulasan', 'Pembayaran', 'User'])
            ->where('id_mitra', $mitraUser->id_mitra)
            ->find($id);

        if (!$pesanan) {
            throw new ModelNotFoundException("Pesanan #{$id} tidak ditemukan.");
        }

        return $pesanan;
    }

    /**
     * Update status pesanan dengan validasi transisi alur kerja.
     *
     * Transisi yang diizinkan:
     *   Menunggu Konfirmasi → Proses Jemput | Dibatalkan
     *   Proses Jemput       → Siap Kirim    | Dibatalkan
     *   Siap Kirim          → Selesai
     *   Selesai / Dibatalkan → (terminal, tidak bisa diubah)
     */
    public function updateStatus(Mitra $mitraUser, int $id, string $newStatus): Pesanan
    {
        $pesanan = $this->show($mitraUser, $id);

        $allowedTransitions = [
            Pesanan::STATUS_MENUNGGU => [Pesanan::STATUS_PROSES, Pesanan::STATUS_DIBATALKAN],
            Pesanan::STATUS_PROSES   => [Pesanan::STATUS_SIAP,   Pesanan::STATUS_DIBATALKAN],
            Pesanan::STATUS_SIAP     => [Pesanan::STATUS_SELESAI],
        ];

        $currentStatus = $pesanan->status_pesanan;

        if (!isset($allowedTransitions[$currentStatus])) {
            throw new InvalidArgumentException(
                "Pesanan dengan status '{$currentStatus}' sudah final dan tidak dapat diubah."
            );
        }

        if (!in_array($newStatus, $allowedTransitions[$currentStatus])) {
            throw new InvalidArgumentException(
                "Transisi dari '{$currentStatus}' ke '{$newStatus}' tidak diizinkan."
            );
        }

        DB::transaction(function () use ($pesanan, $newStatus) {
            $pesanan->update(['status_pesanan' => $newStatus]);

            if ($newStatus === Pesanan::STATUS_SELESAI) {
                foreach ($pesanan->DetailPesanan as $detail) {
                    if ($detail->id_layanan) {
                        $detail->Layanan()->decrement('stok_tersedia', $detail->jumlah);
                    }
                }
            }
        });

        return $pesanan->fresh(['DetailPesanan.Layanan']);
    }
}
