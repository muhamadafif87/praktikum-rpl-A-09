# Dokumentasi API Seeding Informasi Detail Pesanan

## Request Headers

| Key | Value | Required |
|-----|-------|----------|
| `Content-Type` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

---

## Daily Cleaning
**Endpoint**
```POST: /v1/landing-page/daily-cleaning/detail-pesanan```

**Request**
```json
{
  "type_layanan": "daily_cleaning",
  "id_mitra": 3
} 
```

**Response**
```json
{
  "success": true,
  "message": "Data berhasil didapatkan",
  "data": {
    "id_mitra": 3,
    "nama_mitra": "Cleaning Service Pro",
    "layanan": [
      {
        "id_layanan": 5,
        "nama_layanan": "Rapikan Kamar",
        "harga_layanan": "50000"
      },
      {
        "id_layanan": 6,
        "nama_layanan": "Cuci Piring",
        "harga_layanan": "45000"
      }
    ],
    "alat_pembersih_tambahan": {
      "Pel": 7000,
      "Sapu": 5000,
      "Vacum Cleaner": 15000
    },
    "jadwal_pembersihan": [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00"
    ]
  }
}
```

## Laundry
**Endpoint**
```POST: /v1/landing-page/laundry/detail-pesanan```

**Request**
```json
{
  "type_layanan": "laundry",
  "id_mitra": 1
}
```

**Response**
```json
{
  "success": true,
  "message": "Data berhasil didapatkan",
  "data": {
    "id_mitra": 1,
    "nama_mitra": "Laundry Cepat",
    "layanan": [
      {
        "id_layanan": 1,
        "nama_layanan": "Laundry Express Regular",
        "harga_layanan": "15000"
      },
      {
        "id_layanan": 2,
        "nama_layanan": "Laundry Express Premium",
        "harga_layanan": "20000"
      }
    ],
    "jenis_kain": [
      "Pakaian Harian",
      "Sprei",
      "Bedcover",
      "Selimut"
    ],
    "durasi_pengerjaan": {
      "kilat": 25000,
      "express": 15000,
      "reguler": 0
    },
    "jadwal_penjemputan": [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00"
    ]
  }
}
```

## Galon&Gas
**Endpoint**
```POST: /v1/landing-page/galon-gas/detail-pesanan```

**Request**
```json
{
  "type_layanan": "galon_gas",
  "id_mitra": 2
}
```

**Response**
```json
{
  "success": true,
  "message": "Data berhasil didapatkan",
  "data": {
    "id_mitra": 2,
    "nama_mitra": "Agen Gas & Galon Jakarta",
    "layanan": [
      {
        "id_layanan": 3,
        "nama_layanan": "Gas 3kg",
        "harga_barang": "18000",
        "beli_baru": 100000
      },
      {
        "id_layanan": 4,
        "nama_layanan": "Gas 10kg",
        "harga_barang": "85000",
        "beli_baru": 300000
      },
      {
        "id_layanan": 13,
        "nama_layanan": "Galon 15L",
        "harga_barang": "27000",
        "beli_baru": 50000
      }
    ],
    "jadwal_pengiriman": [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00"
    ]
  }
}
```
