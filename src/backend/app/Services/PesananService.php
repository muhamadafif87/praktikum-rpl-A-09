<?php

namespace App\Services;

use App\Models\Mitra;

class PesananService
{
    public function createPesanan(){
        //
    }

    public function estimateFeePesanan(
        string $idMitra,
        string $idLayanan,
        string $typeLayanan,
        int $qty,
        int $jarakOngkir,
        array $biayaTambahan
    ){
        $mitra = Mitra::find($idMitra);
        if (!$mitra) {
            throw new \Exception('Mitra tidak ditemukan');
        }

        $layanan = $mitra->Layanan()->where('id_layanan', $idLayanan)->first();
        if (!$layanan) {
            throw new \Exception('Layanan tidak ditemukan');
        }

        $biayaPokok    = $layanan->harga * $qty;
        $biayaOngkir   = ($layanan->catatan['biaya_ongkir'] ?? 0) * $jarakOngkir;
        $biayaTransport = ($layanan->catatan['biaya_transportasi'] ?? 0) * $jarakOngkir;
        $biayaAplikasi = 1000;

        if ($typeLayanan === 'laundry') {
            return [
                'subtotal'          => $biayaPokok,
                'biaya_ongkir'      => $biayaOngkir,
                'biaya_layanan'     => $biayaAplikasi,
                'total_pembayaran'  => $biayaPokok + $biayaOngkir + $biayaAplikasi
            ];
        } elseif ($typeLayanan === 'galon_gas') {
            $tambahan = ($biayaTambahan['beli_baru'] ?? 0) * $qty;
            return [
                'subtotal'         => $biayaPokok,
                'biaya_ongkir'     => $biayaOngkir,
                'biaya_layanan'    => $biayaAplikasi,
                'beli_baru'        => $tambahan,
                'total_pembayaran' => $biayaPokok + $biayaOngkir + $biayaAplikasi + $tambahan
            ];
        } else {
            $totalBiayaTambahan = array_sum($biayaTambahan);
            return [
                'subtotal'              => $biayaPokok,
                'biaya_tambahan_alat'   => $totalBiayaTambahan,
                'biaya_transportasi'    => $biayaTransport,
                'biaya_layanan'         => $biayaAplikasi,
                'total_pembayaran'      => $biayaPokok + $totalBiayaTambahan + $biayaTransport + $biayaAplikasi
            ];
        }
    }

    private function generateIdPesanan(){
        //
    }

    public function showRiwayatPesanan(){
        //
    }

    public function cancelPesanan(){
        //
    }

    public function showDetailPesanan(){
        //
    }

    public function seedingDetailPesanan(string $type_layanan, string $idMitra){
        // informasi tambahan ketika user ingin membuat pesanan

        $mitra = Mitra::find($idMitra);
        if (!$mitra) {
            throw new \Exception('Mitra tidak ditemukan');
        }

        $catatan = $mitra->catatan;
        if (is_string($catatan)) {
            $catatan = json_decode($catatan, true);
        }

        $layanan = $mitra->Layanan;

        if ($type_layanan === 'laundry') {
            return [
                'id_mitra' => $mitra->id_mitra,
                'nama_mitra' => $mitra->nama_mitra,
                'layanan' => $layanan->map(fn($l) => [
                    'id_layanan' => $l->id_layanan,
                    'nama_layanan' => $l->nama_layanan,
                    'harga_layanan' => $l->harga
                ])->toArray(),
                'jenis_kain' => $catatan['jenis_kain'] ?? null,
                'jadwal_penjemputan' => $catatan['jadwal_penjemputan'] ?? null
            ];
        }
        elseif ($type_layanan === 'daily_cleaning') {
            return [
                'id_mitra' => $mitra->id_mitra,
                'nama_mitra' => $mitra->nama_mitra,
                'layanan' => $layanan->map(fn($l) => [
                    'id_layanan' => $l->id_layanan,
                    'nama_layanan' => $l->nama_layanan,
                    'harga_layanan' => $l->harga
                ])->toArray(),
                'alat_pembersih_tambahan' => $catatan['alat_pembersih_tambahan'] ?? null,
                'jadwal_pembersihan' => $catatan['jadwal_pembersihan'] ?? null
            ];
        }
        else {
            return [
                'id_mitra' => $mitra->id_mitra,
                'nama_mitra' => $mitra->nama_mitra,
                'layanan' => $layanan->map(fn($l) => [
                    'id_layanan' => $l->id_layanan,
                    'nama_layanan' => $l->nama_layanan,
                    'harga_barang' => $l->harga,
                    'beli_baru' => $l->catatan['beli_baru'] ?? null
                ])->toArray(),
                'jadwal_pengiriman' => $catatan['jadwal_pengiriman'] ?? null
            ];
        }
    }

    // catatan pada mitra general, sedangkan layanan spesifik

    /**
     * pertimbangkan untuk menambahkan column catatan pada pesanan, berikut detailnya:
     *
     * #laundry express
     * {
     *      jenis_kain: [
     *          "Pakaian Harian",
     *          "Sprei",
     *          "BedCover"
     *          *bisa multiple/single choice
     *      ],
     *      estimasi_berat: [
     *          "Kategori Ringan (Maks 3kg)",
     *          "Kategori Sedang (Maks 6kg)",
     *          "Kategori Berat (Maks 12kg)"
     *      ],
     *      jadwal_penjemputan: [
     *          "09:00",
     *          "10:00",
     *          "11:00",
     *          "12:00",
     *          "13:00",
     *          "14:00",
     *          "15:00",
     *          "16:00"
     *      ]
     * }
     *
     * #daily cleaning
     * nama_layanan,
     * {
     *      paket_durasi: [
     *          "1 Jam (Ringan)",
     *          "2 Jam (Sedang)",
     *          "3 jam (Berat)"
     *      ], ->handle di fe
     *      alat_pembersih_tambahan: [
     *          "Sapu",
     *          "Vacum Cleaner",
     *          "Pel",
     *          *opsional
     *      ],
     *      jadwal_pembersihan: {
     *          "09:00",
     *          "10:00",
     *          "11:00",
     *          "12:00",
     *          "13:00",
     *          "14:00",
     *          "15:00"
     *      },
     *      catatan_pengiriman: "(opsional)"
     * }
     *
     * #gas & galon
     * gas_galon: {
     *      item: {
     *          "Gas":{
     *              jenis: x (kg),
     *              jumlah: x,
     *              harga: x
     *          },
     *          "Galon":{
     *              jenis: x (kg),
     *              jumlah: x,
     *              harga: x
     *          },
     *          *bisa multiple item
     *      },
     *      jenis_layanan: "isi ulang OR beli tabung/galon baru", ->handle di fe dan di pesanan
     *      catatan_pengiriman: "(opsional)"
     * }
     */


    //seeding detail_pesanan
    //#laundry express
    /**
     * jenis_kain: {
     *      "pakaian harian",
     *      "sprei",
     *      "bedcover"
     * },
     * kategori_berat: {
     *      "ringan (max:3kg)",
     *      "sedang (max:6kg)",
     *      "berat (max:12)"
     * },
     * jadwal_kurir:{
     *      "09:00",
     *      "xx:xx"
     * }
     */

    //#daily cleaning
    /**
     * paket_durasi: {
     *      waktu: { 1, 2, 3 } (jam),
     *      kategori: {
     *          "ringan": Rp.xxxx,
     *          "sedang": Rp.xxxx,
     *          "berat": Rp.xxxx
     *      },
     * },
     * list_alat_pembersih: {
     *      "Sapu": Rp.xxxx,
     *      "Pel": Rp.xxxx
     * },
     * jadwal_pembersihan: {
     *      date(dd/mm/yyyy): {
     *          "09:00",
     *          "xx:xx"
     *      }
     * }
     */

    //#gas galon
    /**
     * item:{
     *   "Gas":{
     *      jenis: x (kg),
     *      jumlah: x,
     *      harga: x
     *   },
     *   "Galon":{
     *      jenis: x (kg),
     *      jumlah: x,
     *      harga: x
     *   },
     * },
     * harga_jenis_layanan:{
     *   "Gas": {
     *      isi_ulang: Rp.xxxx,
     *      beli_baru: Rp.xxxx
     *   },
     *   "Galon": {
     *      isi_ulang: Rp.xxxx,
     *      beli_baru: Rp.xxxx
     *   },
     * }
     */
}
