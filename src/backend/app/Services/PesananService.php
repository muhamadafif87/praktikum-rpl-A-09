<?php

namespace App\Services;

use App\Models\Mitra;

class PesananService
{
    public function createPesanan(){
        //
    }

    public function estimateFeePesanan(){
        //Laundry Express
        /**
         * Estimasi biaya cuci: harga_satuan layanan laundry (kg) * estimasi_berat
         * Estimasi biaya kurir antar-jemput: jarak_customer * harga_ongkir kurir (km)
         * return total_estimasi_biaya_sementara
         */

        //Gas & Galon
        /**
         * subtotalProduk: gas/galon * harga
         * biaya pengiriman: jarak_customer * harga_ongkir kurir (km)
         * return total_pembayaran
         */

        //Daily Cleaning
        /**
         * harga:  paket cleaning yang dipilih (jam)
         * biaya_tambahan: alat tambahan (opsional)
         * biaya transportasi: jarak_customer * harga_ongkir kurir (km)
         * return total_pembayaran
         */

        // *don't forget to add 'biaya layanan aplikasi' in every transaction
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
