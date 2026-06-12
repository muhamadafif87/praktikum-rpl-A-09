<?php

namespace App\Services\Mitra;

use App\Models\Layanan;
use App\Models\Mitra;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class LayananService
{
    /**
     * List semua layanan milik mitra (aktif maupun tidak).
     */
    public function index(Mitra $mitraUser): Collection
    {
        return Layanan::where('id_mitra', $mitraUser->id_mitra)
            ->orderBy('nama_layanan')
            ->get();
    }

    public function stok(Mitra $mitraUser){
        return Layanan::select('stok_tersedia')
                ->where('id_mitra', $mitraUser->id_mitra)
                ->get();
    }

    /**
     * Buat layanan baru.
     */
    public function store(Mitra $mitraUser, array $data): Layanan
    {
        return Layanan::create(array_merge($data, [
            'id_mitra' => $mitraUser->id_mitra
        ]));
    }

    /**
     * Detail satu layanan — pastikan milik mitra yang login.
     */
    public function show(Mitra $mitraUser, int $id): Layanan
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
    public function update(Mitra $mitraUser, int $id, array $data): Layanan
    {
        $layanan = $this->show($mitraUser, $id);
        $layanan->update($data);

        return $layanan->fresh();
    }

    /**
     * Hapus layanan.
     * Guard: tidak bisa hapus jika layanan masih ada di pesanan aktif.
     */
    public function destroy(Mitra $mitraUser, int $id): void
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
    public function toggle(Mitra $mitraUser, int $id): Layanan
    {
        $layanan = $this->show($mitraUser, $id);
        $layanan->update(['is_aktif' => !$layanan->is_aktif]);

        return $layanan->fresh();
    }

    public function stokManagement(Mitra $mitraId, array $filters = [])
    {
        $query = Layanan::with('Mitra')->where('id_mitra', $mitraId->id_mitra);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_layanan', 'LIKE', "%{$search}%")
                  ->orWhere('id_layanan', 'LIKE', "%{$search}%");
            });
        }

        $layanans = $query->get();

        $items = $layanans->map(function ($item) {
            $stock = (int) $item->stok_tersedia;

            if ($stock <= 0) {
                $status = 'habis';
            } elseif ($stock <= 5) {
                $status = 'stok_rendah';
            } else {
                $status = 'tersedia';
            }

            return [
                'id'          => $item->id_layanan,
                'nama_produk' => $item->nama_layanan,
                'kategori'    => $item->Mitra ? $item->Mitra->jenis_jasa : '-',
                'stok'        => $stock,
                'satuan'      => $item->satuan,
                'status'      => $status,
                'catatan'     => $item->catatan['beli_baru'] ?? null,
            ];
        });

        // 3. Filter Status (Server-side filtering jika dikirim dari frontend)
        if (!empty($filters['status'])) {
            $statusFilter = $filters['status'];
            $items = $items->filter(function ($item) use ($statusFilter) {
                return $item['status'] === $statusFilter;
            })->values(); // Reset array index setelah difilter
        }

        return $items;
    }

    public function updateStok(int $idLayanan, Mitra $mitraId, int $stokBaru)
    {
        $layanan = Layanan::where('id_layanan', $idLayanan)
                          ->where('id_mitra', $mitraId->id_mitra)
                          ->first();

        if (!$layanan) {
            throw new \Exception("Produk layanan tidak ditemukan atau Anda tidak memiliki akses.");
        }

        // Update stok
        $layanan->stok_tersedia = $stokBaru;
        $layanan->save();

        return $layanan;
    }
}
