<?php

namespace App\Services\Mitra;

use App\Models\Mitra;
use App\Models\Pesanan;
use App\Models\MitraLoginAccess;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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

        $statusMap = [
            'pending' => Pesanan::STATUS_MENUNGGU,
            'diproses' => Pesanan::STATUS_PROSES,
            'siap' => Pesanan::STATUS_SIAP,
            'selesai' => Pesanan::STATUS_SELESAI,
            'dibatalkan' => Pesanan::STATUS_DIBATALKAN,
        ];

        $cases = [];
        $bindings = [];

        foreach ($statusMap as $key => $statusValue) {
            $cases[] = "SUM(CASE WHEN status_pesanan = ? THEN 1 ELSE 0 END) as {$key}";
            $bindings[] = $statusValue;
        }

        $cases[] = "SUM(CASE WHEN status_pesanan IN (?, ?) THEN 1 ELSE 0 END) as aktif";
        $bindings[] = Pesanan::STATUS_PROSES;
        $bindings[] = Pesanan::STATUS_SIAP;

        $selectRaw = implode(", ", array_merge(
            ["COUNT(*) as total"],
            $cases
        ));

        $counts = Pesanan::where('id_mitra', $idMitra)
            ->whereDate('tgl_pesanan', $date)
            ->selectRaw($selectRaw, $bindings)
            ->first();

        if (!$counts) {
            return array_merge(
                ['total' => 0, 'aktif' => 0],
                array_fill_keys(array_keys($statusMap), 0)
            );
        }

        $result = [
            'total' => (int) ($counts->total ?? 0),
            'aktif' => (int) ($counts->aktif ?? 0),
        ];

        foreach ($statusMap as $key => $statusValue) {
            $result[$key] = (int) ($counts->{$key} ?? 0);
        }

        return $result;
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

        $pesanan->update(['status_pesanan' => $newStatus]);

        return $pesanan->fresh(['DetailPesanan.Layanan']);
    }
}
