<?php

namespace App\Services\Admin;

use App\Models\Layanan;
use App\Models\Mitra;
use Illuminate\Pagination\LengthAwarePaginator;

class MitraManagementService
{
    /**
     * Daftar mitra aktif dengan load status, jumlah order aktif, dan rata-rata rating.
     *
     * Load status ditentukan oleh jumlah pesanan yang sedang berjalan (status: proses):
     *   >= 20 → HIGH LOAD
     *   <  20 → CURRENT LOAD
     *
     * @return array<int, array{
     *     id_mitra: int,
     *     nama_mitra: string,
     *     load_status: string,
     *     order_count: int,
     *     average_rate: float
     * }>
     */
    public function getActiveMitra(): array
    {
        $HIGH_LOAD_THRESHOLD = 20;

        return Mitra::where('status_verifikasi', 'true')
            ->withCount([
                'Pesanan as order_count' => fn ($q) => $q->where('status_pesanan', 'diproses'),
            ])
            ->withAvg('Ulasan as average_rate', 'rating')
            ->get()
            ->map(fn (Mitra $mitra) => [
                'id_mitra'     => $mitra->id_mitra,
                'nama_mitra'   => $mitra->nama_mitra,
                'load_status'  => $mitra->order_count >= $HIGH_LOAD_THRESHOLD
                    ? 'HIGH LOAD'
                    : 'CURRENT LOAD',
                'order_count'  => $mitra->order_count,
                'average_rate' => round((float) $mitra->average_rate, 1),
            ])
            ->toArray();
    }

    /**
     * Daftar mitra dengan filter dan pagination.
     *
     * @param  array{search?: string, jenis_layanan?: string, status?: string, rating?: int} $filters
     * @param  int $perPage
     * @return LengthAwarePaginator
     */
    public function getMitraList(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = Mitra::withAvg('Ulasan as avg_rating', 'rating');

        if (!empty($filters['search'])) {
            $query->where('nama_mitra', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['jenis_layanan'])) {
            $query->where('jenis_layanan', $filters['jenis_layanan']);
        }

        if (!empty($filters['status'])) {
            $statusVerifikasi = match ($filters['status']) {
                'aktif'   => true,
                'suspend' => false,
            };
            $query->where('status_verifikasi', $statusVerifikasi);
        }

        if (!empty($filters['rating'])) {
            // Rating >= x.0, misal rating=4 → avg_rating antara 4.0 dan 4.999
            $query->havingRaw('avg_rating >= ?', [$filters['rating']])
                ->havingRaw('avg_rating < ?', [$filters['rating'] + 1]);
        }

        return $query->paginate($perPage)->through(fn (Mitra $mitra) => [
            'id_mitra'      => $mitra->id_mitra,
            'nama_mitra'    => $mitra->nama_mitra,
            'jenis_layanan' => $mitra->jenis_jasa,
            'status'        => $mitra->status_verifikasi,
            'alamat_lengkap'=> $mitra->alamat_mitra,
            'avg_rating'    => round((float) $mitra->avg_rating, 1),
        ]);
    }

    /**
     * Detail satu mitra beserta list layanan dan rekap jumlah pesanan per status.
     *
     * @return array|null  null jika mitra tidak ditemukan
     */
    public function getMitraDetail(int $idMitra): ?array
    {
        $mitra = Mitra::with(['Layanan','Pesanan'])->find($idMitra);

        if (!$mitra) {
            return null;
        }

        $listLayanan = $mitra->Layanan->map(fn (Layanan $l) => [
            'id_layanan'    => $l->id_layanan,
            'nama_layanan'  => $l->nama_layanan,
            'jumlah_pesanan'=> [
                'pending'    => $mitra->Pesanan->where('status_pesanan', 'pending')->count(),
                'proses'     => $mitra->Pesanan->where('status_pesanan', 'diproses')->count(),
                'selesai'    => $mitra->Pesanan->where('status_pesanan', 'selesai')->count(),
                'dibatalkan' => $mitra->Pesanan->where('status_pesanan', 'dibatalkan')->count(),
            ],
        ])->toArray();

        return [
            'nama_mitra'      => $mitra->nama_mitra,
            'nomor_telepon'   => $mitra->nomor_telepon,
            'alamat_lengkap'  => $mitra->alamat_mitra,
            'list_layanan'    => $listLayanan,
        ];
    }

    /**
     * Activate atau suspend mitra.
     *
     * @return array{message: string}
     */
    public function updateMitraStatus(int $idMitra, string $action): array
    {
        $mitra = Mitra::findOrFail($idMitra);

        $newStatus = match ($action) {
            'activate' => true,
            'suspend'  => false,
        };

        $mitra->update(['status_verifikasi' => $newStatus ? 'TRUE' : 'FALSE']);

        $label = $action === 'activate' ? 'diaktifkan' : 'disuspend';

        return [
            'message' => "Mitra {$mitra->nama_mitra} berhasil {$label}.",
        ];
    }
}
