<?php

namespace App\Services\Mitra;

use App\Models\Layanan;
use App\Models\MitraLoginAccess;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class LayananService
{
    /**
     * List semua layanan milik mitra (aktif maupun tidak).
     */
    public function index(MitraLoginAccess $mitraUser): Collection
    {
        return Layanan::where('id_mitra', $mitraUser->id_mitra)
            ->orderBy('nama_layanan')
            ->get();
    }

    /**
     * Buat layanan baru.
     */
    public function store(MitraLoginAccess $mitraUser, array $data): Layanan
    {
        return Layanan::create(array_merge($data, [
            'id_mitra' => $mitraUser->id_mitra
        ]));
    }

    /**
     * Detail satu layanan — pastikan milik mitra yang login.
     */
    public function show(MitraLoginAccess $mitraUser, int $id): Layanan
    {
        $layanan = Layanan::where('id_mitra', $mitraUser->id_mitra)->find($id);

        if (!$layanan) {
            throw new ModelNotFoundException("Layanan #{$id} tidak ditemukan.");
        }

        return $layanan;
    }

    /**
     * Update data layanan.
     */
    public function update(MitraLoginAccess $mitraUser, int $id, array $data): Layanan
    {
        $layanan = $this->show($mitraUser, $id);
        $layanan->update($data);

        return $layanan->fresh();
    }

    /**
     * Hapus layanan.
     * Guard: tidak bisa hapus jika layanan masih ada di pesanan aktif.
     */
    public function destroy(MitraLoginAccess $mitraUser, int $id): void
    {
        $layanan = $this->show($mitraUser, $id);

        $pesananAktif = $layanan->DetailPesanan()
            ->whereHas('Pesanan', fn($q) => $q->whereNotIn('status_pesanan', [
                \App\Models\Pesanan::STATUS_SELESAI,
                \App\Models\Pesanan::STATUS_DIBATALKAN,
            ]))
            ->exists();

        if ($pesananAktif) {
            throw new \RuntimeException(
                "Layanan '{$layanan->nama_layanan}' tidak dapat dihapus karena masih terdapat pesanan aktif."
            );
        }

        $layanan->delete();
    }

    /**
     * Toggle status is_aktif layanan.
     */
    public function toggle(MitraLoginAccess $mitraUser, int $id): Layanan
    {
        $layanan = $this->show($mitraUser, $id);
        $layanan->update(['is_aktif' => !$layanan->is_aktif]);

        return $layanan->fresh();
    }
}
