# DOKUMENTASI API DASHBOARD ADMIN

**Auth: Bearer Token**
## OVERVIEW PAGE
### SUMMARY
melihat ringkasan terkait informasi total transaksi dalam aplikasi, 
total mitra aktif (+info penambahan mitra),
#### ENDPOINT
```get
'v1/dashboard/admin/statistic/summary'
```
#### RESPONSE
```json
{
  "status": "success",
  "total_transaksi": 173,
  "mitra": {
    "total_mitra_aktif": 7,
    "penambahan_mitra": 2
  }
}
```

### LIST ACTIVE PARTNERS
#### ENDPOINT
```get
'/v1/dashboard/admin/mitra/active-mitra'
```
#### RESPONSE
```json
{
  "status": "success",
  "list_mitra": [
    {
      "id_mitra": 2,
      "nama_mitra": "Agen Gas & Galon Jakarta",
      "load_status": "CURRENT LOAD",
      "order_count": 3,
      "average_rate": 4
    },
    {
      "id_mitra": 7,
      "nama_mitra": "Daily Cleaning Wuangi",
      "load_status": "CURRENT LOAD",
      "order_count": 0,
      "average_rate": 4.3
    }
  ]
}
```
----- 

## INVENTORY PAGE
### SUMMARY
ringkasan informasi total layanan aktif,
layanan dengan stok rendah,
layanan dengan stok habis,
persentase ketersediaan layanan
#### ENDPOINT
```get
'/v1/dashboard/admin/inventory/summary'
```
#### RESPONSE
```json
{
  "status": "success",
  "total_layanan": 18,
  "persentase_ketersediaan": 88.89,
  "layanan_stok_rendah": [
    {
      "id_mitra": 5,
      "id_layanan": 88,
      "nama_layanan": "Galon 5L",
      "jumlah_stok": 10
    }
  ],
  "layanan_stok_habis": [
    {
      "id_mitra": 2,
      "id_layanan": 79,
      "nama_layanan": "Gas 12kg",
      "jumlah_stok": 0
    },
    {
      "id_mitra": 5,
      "id_layanan": 86,
      "nama_layanan": "Gas 12kg",
      "jumlah_stok": 0
    }
  ]
}
```
### DAFTAR INVENTARIS LINTAS MITRA (PAGINATION)
#### ENDPOINT
```post
'/v1/dashboard/admin/inventory/list'
```
#### REQUEST
**Filter List**
```json
{
  "filter_mitra": null, // list [nama_mitra]
  "filter_status_stok": "All", // [In Stock, Low Stock, Out of Stock]
  "page": 1,
  "per_page": 5
}
```
**Kirim Notifikasi Pengingat Stok Rendah** (DITUNDA DULU PENGERJAANNYA)
```json
{
    "id_mitra": 2,
    "id_layanan": 4
}
```
#### RESPONSE
```json
{
  "status": "success",
  "list_mitra": [
    {
      "id_mitra": 2,
      "nama_mitra": "Agen Gas & Galon Jakarta",
      "list_layanan": [
        {
          "id_layanan": 80,
          "nama_layanan": "Galon 19L",
          "jumlah_stok": 101,
          "status_stok": "In Stock"
        },
        {
          "id_layanan": 79,
          "nama_layanan": "Gas 12kg",
          "jumlah_stok": 0,
          "status_stok": "Stok Habis"
        }
      ]
    },
    {
      "id_mitra": 7,
      "nama_mitra": "Daily Cleaning Wuangi",
      "list_layanan": [
        {
          "id_layanan": 84,
          "nama_layanan": "Paket Kamar Basic",
          "jumlah_stok": null,
          "status_stok": "Stok Habis"
        },
        {
          "id_layanan": 85,
          "nama_layanan": "Paket Kosan Bareng",
          "jumlah_stok": null,
          "status_stok": "Stok Habis"
        }
      ]
    },
    {
      "id_mitra": 3,
      "nama_mitra": "Cleaning Service Pro",
      "list_layanan": [
        {
          "id_layanan": 78,
          "nama_layanan": "Paket Kamar Basic",
          "jumlah_stok": null,
          "status_stok": "Stok Habis"
        }
      ]
    },
    {
      "id_mitra": 5,
      "nama_mitra": "Gas & Galon Murah",
      "list_layanan": [
        {
          "id_layanan": 87,
          "nama_layanan": "Galon 19L",
          "jumlah_stok": 78,
          "status_stok": "In Stock"
        },
        {
          "id_layanan": 88,
          "nama_layanan": "Galon 5L",
          "jumlah_stok": 10,
          "status_stok": "Stok Rendah"
        },
        {
          "id_layanan": 86,
          "nama_layanan": "Gas 12kg",
          "jumlah_stok": 0,
          "status_stok": "Stok Habis"
        }
      ]
    },
    {
      "id_mitra": 6,
      "nama_mitra": "Daily Cleaning Mas Uamba",
      "list_layanan": [
        {
          "id_layanan": 81,
          "nama_layanan": "Paket Kamar Basic",
          "jumlah_stok": null,
          "status_stok": "Stok Habis"
        },
        {
          "id_layanan": 82,
          "nama_layanan": "Paket Kamar + Kamar Mandi",
          "jumlah_stok": null,
          "status_stok": "Stok Habis"
        },
        {
          "id_layanan": 83,
          "nama_layanan": "Paket Kosan Bareng",
          "jumlah_stok": null,
          "status_stok": "Stok Habis"
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 5,
    "total": 7,
    "last_page": 2
  }
}
```
----- 

## PARTNERS LIST PAGE
### SUMMARY
#### ENDPOINT
```get
'/v1/dashboard/admin/statistic/mitra-summary'
```
##### RESPONSE
```json
{
  "status": "success",
  "total_mitra": 7,
  "total_mitra_aktif": 7,
  "jumlah_mitra_baru": 2,
  "mitra_disuspend": 0
}
```
### DAFTAR KEMITRAAN
**Filter Daftar**
#### REQUEST
```json
{
  "search": null,
  "jenis_layanan": null, //[galon_gas, laundry, daily_cleaning]
  "status": null, // [aktif, suspend]
  "rating": null,
  "page": 1,
  "per_page": 5
}
```
##### ENDPOINT
```get
'/v1/dashboard/admin/mitra/list'
```
##### RESPONSE
```json
{
  "status": "success",
  "list_mitra": [
    {
      "id_mitra": 2,
      "nama_mitra": "Agen Gas & Galon Jakarta",
      "jenis_layanan": "galon_gas",
      "status": true,
      "alamat_lengkap": "Jl. Merdeka No. 456, Jakarta",
      "avg_rating": 4
    },
    {
      "id_mitra": 7,
      "nama_mitra": "Daily Cleaning Wuangi",
      "jenis_layanan": "daily_cleaning",
      "status": true,
      "alamat_lengkap": "Jl. Kartika No. 69, Jebres",
      "avg_rating": 4.3
    },
    {
      "id_mitra": 3,
      "nama_mitra": "Cleaning Service Pro",
      "jenis_layanan": "daily_cleaning",
      "status": true,
      "alamat_lengkap": "Jl. Diponegoro No. 789, Jakarta",
      "avg_rating": 4
    },
    {
      "id_mitra": 5,
      "nama_mitra": "Gas & Galon Murah",
      "jenis_layanan": "galon_gas",
      "status": true,
      "alamat_lengkap": "Jl. Melati No. 20, Jakarta",
      "avg_rating": 4.8
    },
    {
      "id_mitra": 6,
      "nama_mitra": "Daily Cleaning Mas Uamba",
      "jenis_layanan": "daily_cleaning",
      "status": true,
      "alamat_lengkap": "Jl. Kartika No. 3, Jebres",
      "avg_rating": 4
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 5,
    "total": 7,
    "last_page": 2
  }
}
```

**Lihat Detail**
#### ENDPOINT
```get
'/api/v1/dashboard/admin/mitra/1'
```
##### RESPONSE
```json
{
  "status": "success",
  "data": {
    "nama_mitra": "Laundry Cepat",
    "nomor_telepon": "0811111111",
    "alamat_lengkap": "Jl. Ahmad Yani No. 123, Jakarta",
    "list_layanan": [
      {
        "id_layanan": 93,
        "nama_layanan": "Laundry Kiloan Reguler",
        "jumlah_pesanan": {
          "pending": 0,
          "proses": 0,
          "selesai": 20,
          "dibatalkan": 0
        }
      },
      {
        "id_layanan": 94,
        "nama_layanan": "Laundry Kiloan Express",
        "jumlah_pesanan": {
          "pending": 0,
          "proses": 0,
          "selesai": 20,
          "dibatalkan": 0
        }
      },
      {
        "id_layanan": 95,
        "nama_layanan": "Celana",
        "jumlah_pesanan": {
          "pending": 0,
          "proses": 0,
          "selesai": 20,
          "dibatalkan": 0
        }
      }
    ]
  }
}
```
**Activate/Suspend**
#### ENDPOINT
```patch
'v1/dashboard/admin/mitra/action'
```
##### REQUEST
```json
{
    "id_mitra": 1,
    "action": "activate", //[activate, suspend]
}
```
##### RESPONSE
```json
{
  "status": "success",
  "message": "Mitra Laundry Cepat berhasil diaktifkan."
}
```

**List Mitra**
#### ENDPOINT
```get
'/v1/dashboard/admin/mitra/list'
```
##### REQUEST
```json
{
  "search": null,
  "jenis_layanan": null,
  "status": null,
  "rating": null,
  "page": 1,
  "per_page": 5
}
```
##### RESPONSE
```json
{
  "status": "success",
  "list_mitra": [
    {
      "id_mitra": 2,
      "nama_mitra": "Agen Gas & Galon Jakarta",
      "jenis_layanan": "galon_gas",
      "status": true,
      "alamat_lengkap": "Jl. Merdeka No. 456, Jakarta",
      "avg_rating": 4
    },
    {
      "id_mitra": 7,
      "nama_mitra": "Daily Cleaning Wuangi",
      "jenis_layanan": "daily_cleaning",
      "status": true,
      "alamat_lengkap": "Jl. Kartika No. 69, Jebres",
      "avg_rating": 4.3
    },
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 5,
    "total": 7,
    "last_page": 2
  }
}
```
----- 
