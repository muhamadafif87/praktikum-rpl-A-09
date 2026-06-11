# Dokumentasi Pesanan

## Create Pesanan
**Endpoint**
```post
'v1/landing-page/pesanan/'
```

### Laundry
**Request**
```json
{
  "idMitra": "1",
  "typeLayanan": "laundry",
  "items": [
    { "idLayanan": "1", "qty": 2 }
  ],
  "jarakOngkir": 3,
  "jadwal_layanan": [
    { "jam": "09:00", "tanggal": null }
  ],
  "biayaTambahan": {
    "durasi_pengerjaan": { "biaya": 15000, "type": "express" }
  },
  "estimasi": {
    "subtotal": 300000,
    "biaya_ongkir": 20000,
    "total_pembayaran": 320000,
    "beli_baru": 0
  },
  "catatanPengiriman": "testing"
}

```
**Response**
```json
{
    "success": true,
    "message": "Pesanan berhasil dibuat.",
    "data": {
        "id_pesanan": 17,
        "id_unique_pesanan": "ORD-LAUNDRY-20260610-MBIDPU",
        "status_pesanan": "pending",
        "detail_layanan": [
            {
                "id_detail_pesanan": 21,
                "nama_layanan": "Laundry Express Regular",
                "satuan": "kg",
                "harga": "15000",
                "jumlah": 3,
                "subtotal": 45000
            }
        ],
        "ringkasan_biaya": {
            "subtotal": 45000,
            "biaya_ongkir": 9000,
            "biaya_tambahan_durasi": 0,
            "durasi_pengerjaan": "kilat",
            "biaya_aplikasi": 1000,
            "total_pembayaran": 55000
        },
        "catatan_pengiriman": null
    }
}
```
----- 


## Cancel Pesanan
**Endpoint**
```patch
'v1/landing-page/pesanan/{idUniquePesanan}/cancel'
```
**Request**
```json
{
    "idUniquePesanan": "ORD-LAUNDRY-20260610-MBIDPU"
}
```
**Response**
```json
{
  "success": true,
  "message": "Pesanan berhasil dibatalkan.",
  "data": {
    "id_unique_pesanan": "ORD-LAUNDRY-20260610-MBIDPU",
    "status_pesanan": "dibatalkan"
  }
}
```
----- 

## Show Riwayat Pesanan (USER)
**Endpoint**
```get
'v1/landing-page/pesanan/riwayat/'
```
**Request**
```json
{
    "status": "pending",
    "tgl_dari": null,
    "tgl_sampai": null,
    "per_page": null,
}
```
**Response**
```json
{
  "success": true,
  "message": "Riwayat pesanan berhasil didapatkan.",
  "data": [
    {
      "id_unique_pesanan": "ORD-Q2NWGSY0DY",
      "status_pesanan": "selesai",
      "tgl_pesanan": "2026-06-09T17:03:25.000000Z",
      "mitra": {
        "nama_mitra": "Agen Gas & Galon Jakarta",
        "jenis_jasa": "galon_gas"
      },
      "user": {
        "nama_lengkap": "ADMIN TES 1",
        "nomor_telepon": "882005916369"
      },
      "detail_layanan": [],
      "total_pembayaran": null
    },
    {
      "id_unique_pesanan": "ORD-88UWXY18V4",
      "status_pesanan": "selesai",
      "tgl_pesanan": "2026-06-07T17:03:25.000000Z",
      "mitra": {
        "nama_mitra": "Agen Gas & Galon Jakarta",
        "jenis_jasa": "galon_gas"
      },
      "user": {
        "nama_lengkap": "ADMIN TES 1",
        "nomor_telepon": "882005916369"
      },
      "detail_layanan": [],
      "total_pembayaran": null
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 8
  }
}
```
----- 

## Show Detail Pesanan (USER)
**Endpoint**
```get
'v1/landing-page/pesanan/{idUniquePesanan}/'
```
**Request**
```json
{
    "idUniquePesanan": "ORD-88UWXY18V4"
}
```
**Response**
```json
{
  "success": true,
  "message": "Detail pesanan berhasil didapatkan.",
  "data": {
    "id_pesanan": 127,
    "id_unique_pesanan": "ORD-88UWXY18V4",
    "status_pesanan": "selesai",
    "tgl_pesanan": "2026-06-07T17:03:25.000000Z",
    "mitra": {
      "id_mitra": 2,
      "nama_mitra": "Agen Gas & Galon Jakarta",
      "jenis_jasa": "galon_gas",
      "alamat_mitra": "Jl. Merdeka No. 456, Jakarta",
      "nomor_telepon": "0822222222"
    },
    "user": {
      "id_user": 14,
      "nama_lengkap": "ADMIN TES 1",
      "nomor_telepon": "882005916369",
      "alamat_kost": null
    },
    "detail_layanan": [],
    "ringkasan_biaya": {
      "subtotal": null,
      "biaya_ongkir": null,
      "biaya_aplikasi": null,
      "biaya_tambahan_alat": null,
      "total_pembayaran": null
    },
    "catatan_pengiriman": null,
    "pembayaran": null,
    "ulasan": {
      "id_ulasan": 127,
      "id_pesanan": 127,
      "rating": 5,
      "komentar": "Harganya pas di kantong anak kos, pelayanan bintang lima!",
      "created_at": "2026-06-10T17:03:26.066941Z"
    }
  }
}
```
----- 
