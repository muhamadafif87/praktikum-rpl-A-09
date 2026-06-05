<?php

namespace App\Services;

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

    public function seedingDetailPesanan(){
        // informasi tambahan ketika user ingin membuat pesanan
    }
}

//Note
/**
 * pertimbangkan untuk menambahkan column catatan pada pesanan, berikut detailnya:
 *
 * #laundry express
 * laundry_express{
 *      jenis_kain: {
 *          "Pakaian Harian",
 *          "Sprei",
 *          "BedCover"
 *          *bisa multiple/single choice
 *      },
 *      estimasi_berat: x (kg),
 *      jadwal_penjemputan: "xx:xx"
 * }
 *
 * #daily cleaning
 * daily_cleaning{
 *      paket_durasi: "ringan|sedang|berat",
 *      alat_pembersih_tambahan: {
 *          "Sapu",
 *          "Vacum Cleaner",
 *          "Pel",
 *          *opsional
 *      },
 *      waktu_pembersihan: {
 *          date: "dd/mm/yyyy",
 *          time: "xx:xx"
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
 *      jenis_layanan: "isi ulang OR beli tabung/galon baru",
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
