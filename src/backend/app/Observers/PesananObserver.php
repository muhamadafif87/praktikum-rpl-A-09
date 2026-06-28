<?php

namespace App\Observers;

use App\Models\Pesanan;
use App\Models\TransaksiKeuangan;
use App\Models\User;
use Illuminate\Support\Str;

class PesananObserver
{
    /**
     * Handle the Pesanan "created" event.
     */
    public function created(Pesanan $pesanan): void
    {
        $this->syncKeuangan($pesanan);
    }

    /**
     * Handle the Pesanan "updated" event.
     */
    public function updated(Pesanan $pesanan): void
    {
        $this->syncKeuangan($pesanan);
    }

    /**
     * Handle the Pesanan "deleted" event.
     */
    public function deleted(Pesanan $pesanan): void
    {
        TransaksiKeuangan::where('id_pesanan', $pesanan->id_pesanan)->delete();
    }

    private function syncKeuangan(Pesanan $pesanan): void
    {
        if ($pesanan->status_pesanan === 'dibatalkan') {
            TransaksiKeuangan::where('id_pesanan', $pesanan->id_pesanan)->delete();
            return;
        }

        $transaksi = TransaksiKeuangan::firstOrNew(['id_pesanan' => $pesanan->id_pesanan]);

        if (!$transaksi->exists) {
            // Generate unique TX id
            do {
                $txId = 'TX-' . strtoupper(Str::random(6));
            } while (TransaksiKeuangan::where('id_transaksi', $txId)->exists());
            
            $transaksi->id_transaksi = $txId;
            $transaksi->id_mitra = $pesanan->id_mitra;
            $transaksi->tanggal_transaksi = $pesanan->tgl_pesanan ?? now();
        }

        $catatan = is_string($pesanan->catatan) ? json_decode($pesanan->catatan, true) : $pesanan->catatan;
        
        $user = User::find($pesanan->id_user);
        $namaPelanggan = $user ? $user->nama_lengkap : 'Pelanggan';
        if (isset($catatan['kontak_pengirim']) && !empty($catatan['kontak_pengirim']['nama'])) {
            $namaPelanggan = $catatan['kontak_pengirim']['nama'];
        }

        $transaksi->nama_pelanggan = $namaPelanggan;
        $transaksi->jumlah = $catatan['total_pembayaran'] ?? 0;
        
        if ($pesanan->status_pesanan === 'selesai') {
            $transaksi->status_dana = TransaksiKeuangan::STATUS_TERSEDIA;
        } else {
            $transaksi->status_dana = TransaksiKeuangan::STATUS_TERTAHAN;
        }

        $transaksi->save();
    }
}
