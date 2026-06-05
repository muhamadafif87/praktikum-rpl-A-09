# API Landing Page Documentation

## Overview
API ini menyediakan endpoint untuk seeding data landing page dengan informasi layanan, statistik, dan pencarian.

---

## Base URL
```
http://localhost:8000/api/v1
```

---

## Endpoints

### 1. Get Statistik Landing Page
Mendapatkan statistik jumlah pengguna aktif dan mitra yang bekerja sama.

**Endpoint:**
```
GET /landing-page/statistic
```

**Method:** `GET`

**Query Parameters:** Tidak ada

**Response Success (200):**
```json
{
  "success": true,
  "message": "Statistik berhasil diambil",
  "data": {
    "jumlah_user_aktif": 15,
    "jumlah_mitra_bekerja_sama": 8
  }
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/landing-page/statistic"
```

---

### 2. Search Layanan
Mencari layanan berdasarkan query string.

**Endpoint:**
```
GET /landing-page/search
```

**Method:** `GET`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Kata kunci pencarian (minimal 1 karakter) |

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data layanan berhasil diambil",
  "data": [
    {
      "id_layanan": 1,
      "nama_layanan": "Laundry Express Premium",
      "harga": 15000,
      "satuan": "kg",
      "mitra": {
        "id_mitra": 1,
        "nama_mitra": "Laundry Cepat",
        "jenis_jasa": "laundry_express"
      }
    }
  ]
}
```

**Response Error Validation (422):**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "query": ["The query field is required."]
  }
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:8000/api/v1/landing-page/search?query=laundry"
```

### NOTE:
API PENCARIAN MASIH DALAM MASA PENINJAUAN UNTUK DIKONFIGURASI DENGAN API MAPS

---

### 3. Get Layanan Laundry Express
Mendapatkan daftar layanan laundry express dengan filter dan sorting.

**Endpoint:**
```
GET /landing-page/laundry-express
```

**Method:** `GET`

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `kategori` | string | No | `All` | Filter kategori: `Pakaian`, `Sprei`, `BedCover`, atau `All` |
| `sortBy` | string | No | `Terbaik` | Sorting: `Terdekat`, `Terlaris`, `Terbaik`, atau `Harga bersahabat` |

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data layanan laundry express berhasil diambil",
  "data": [
    {
      "id_mitra": 1,
      "nama_mitra": "Laundry Cepat",
      "jenis_jasa": "laundry_express",
      "lokasi_layanan": "Jl. Ahmad Yani No. 123, Jakarta",
      "rating": 4.8,
      "jumlah_ulasan": 25,
      "layanan": [
        {
          "id_layanan": 1,
          "nama_layanan": "Laundry Express Regular",
          "harga_satuan": 15000,
          "satuan": "kg"
        },
        {
          "id_layanan": 2,
          "nama_layanan": "Laundry Express Premium",
          "harga_satuan": 20000,
          "satuan": "kg"
        }
      ],
      "sample_ulasan": [
        {
          "nama_user": "Afif Hidayat",
          "rating": 5,
          "komentar": "Cucian bersih, rapi, dan wangi. Sangat puas!",
          "tgl_ulasan": "2026-05-29 14:30:00"
        },
        {
          "nama_user": "Siti Nurhaliza",
          "rating": 4.5,
          "komentar": "Pelayanan cepat dan hasil memuaskan",
          "tgl_ulasan": "2026-05-28 10:15:00"
        }
      ]
    }
  ]
}
```

**Example cURL:**
```bash
# Dengan sorting Terbaik (default)
curl -X GET "http://localhost:8000/api/v1/landing-page/laundry-express"

# Dengan filter kategori dan sorting
curl -X GET "http://localhost:8000/api/v1/landing-page/laundry-express?kategori=Pakaian&sortBy=Harga%20bersahabat"
```

---

### 4. Get Layanan Galon/Gas
Mendapatkan daftar layanan galon/gas dengan filter dan sorting.

**Endpoint:**
```
GET /landing-page/galon-gas
```

**Method:** `GET`

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `kategori` | string | No | `All` | Filter kategori: `Galon`, `Gas`, atau `All` |
| `sortBy` | string | No | `Terbaik` | Sorting: `Terdekat`, `Terlaris`, `Terbaik`, atau `Harga bersahabat` |

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data layanan galon/gas berhasil diambil",
  "data": [
    {
      "id_mitra": 2,
      "nama_mitra": "Agen Gas Jakarta",
      "jenis_jasa": "gas",
      "lokasi_layanan": "Jl. Merdeka No. 456, Jakarta",
      "rating": 4.6,
      "jumlah_ulasan": 18,
      "layanan": [
        {
          "id_layanan": 3,
          "nama_layanan": "Gas 3kg",
          "harga_satuan": 35000,
          "satuan": "tabung"
        },
        {
          "id_layanan": 4,
          "nama_layanan": "Gas 10kg",
          "harga_satuan": 85000,
          "satuan": "tabung"
        }
      ],
      "sample_ulasan": [
        {
          "nama_user": "Budi Santoso",
          "rating": 5,
          "komentar": "Pengiriman cepat, gas original 100%",
          "tgl_ulasan": "2026-05-27 09:45:00"
        }
      ]
    }
  ]
}
```

**Example cURL:**
```bash
# Dengan sorting Terlaris
curl -X GET "http://localhost:8000/api/v1/landing-page/galon-gas?sortBy=Terlaris"

# Dengan filter kategori Gas dan sorting Harga bersahabat
curl -X GET "http://localhost:8000/api/v1/landing-page/galon-gas?kategori=Gas&sortBy=Harga%20bersahabat"
```

---

### 5. Get Layanan Daily Cleaning
Mendapatkan daftar layanan daily cleaning dengan filter dan sorting.

**Endpoint:**
```
GET /landing-page/daily-cleaning
```

**Method:** `GET`

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `kategori` | string | No | `All` | Filter kategori: `KamarKost`, `Gudang`, atau `All` |
| `sortBy` | string | No | `Terbaik` | Sorting: `Terdekat`, `Terlaris`, `Terbaik`, atau `Harga bersahabat` |

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data layanan daily cleaning berhasil diambil",
  "data": [
    {
      "id_mitra": 3,
      "nama_mitra": "Cleaning Service Pro",
      "jenis_jasa": "daily_cleaning",
      "lokasi_layanan": "Jl. Diponegoro No. 789, Jakarta",
      "rating": 4.7,
      "jumlah_ulasan": 32,
      "layanan": [
        {
          "id_layanan": 5,
          "nama_layanan": "Daily Cleaning Kamar Kost",
          "harga_satuan": 50000,
          "satuan": "jam"
        },
        {
          "id_layanan": 6,
          "nama_layanan": "Daily Cleaning Gudang",
          "harga_satuan": 75000,
          "satuan": "jam"
        }
      ],
      "sample_ulasan": [
        {
          "nama_user": "Rina Wijaya",
          "rating": 5,
          "komentar": "Kamar jadi bersih dan rapi, pekerja ramah dan profesional",
          "tgl_ulasan": "2026-05-26 16:20:00"
        }
      ]
    }
  ]
}
```

**Example cURL:**
```bash
# Dengan sorting default (Terbaik)
curl -X GET "http://localhost:8000/api/v1/landing-page/daily-cleaning"

# Dengan filter kategori dan sorting Terdekat
curl -X GET "http://localhost:8000/api/v1/landing-page/daily-cleaning?kategori=KamarKost&sortBy=Terdekat"
```

---

## Sorting Options Penjelasan

| Sort | Penjelasan |
|------|-----------|
| `Terdekat` | Diurutkan berdasarkan lokasi terdekat (implementasi memerlukan geolocation) |
| `Terlaris` | Diurutkan berdasarkan jumlah pesanan terbanyak |
| `Terbaik` | Diurutkan berdasarkan rating tertinggi |
| `Harga bersahabat` | Diurutkan berdasarkan harga terendah |

---

## Error Responses

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Gagal mengambil data layanan: Error message here"
}
```

---

## Notes

1. **Seeding Data**: Endpoint `/landing-page/*` tidak melakukan insert data, hanya menampilkan data yang sudah ada di database
2. **Filter Kategori**: Parameter `kategori` saat ini masih dalam tahap pengembangan. Default value `All` menampilkan semua layanan
3. **Sorting Terdekat**: Memerlukan implementasi geolocation untuk mendapatkan lokasi user. Saat ini menggunakan sorting berdasarkan nama alamat
4. **Sample Ulasan**: Menampilkan maksimal 10 ulasan terbaru untuk setiap mitra
5. **Rating**: Dihitung dari rata-rata rating ulasan (scale 1-5)
6. **Status Verifikasi**: Hanya mitra dengan `status_verifikasi = 'verified'` yang ditampilkan

---

## Implementation Notes untuk Frontend

1. **Pagination**: Saat ini endpoint mengembalikan semua data. Pertimbangkan untuk menambahkan pagination di fase berikutnya
2. **Caching**: Pertimbangkan untuk menambahkan caching untuk performa yang lebih baik
3. **Geolocation**: Untuk sorting "Terdekat", implementasikan geolocation di frontend dan kirimkan parameter `user_latitude` dan `user_longitude`
4. **Error Handling**: Frontend harus selalu mengecek field `success` sebelum mengakses field `data`

---

## Testing dengan Postman

Import collection di bawah ke Postman:

```json
{
  "info": {
    "name": "Landing Page API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Statistik",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/v1/landing-page/statistic"
      }
    },
    {
      "name": "Search Layanan",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/v1/landing-page/search?query=laundry"
      }
    },
    {
      "name": "Get Laundry Express",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/v1/landing-page/laundry-express?sortBy=Terbaik"
      }
    },
    {
      "name": "Get Galon/Gas",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/v1/landing-page/galon-gas?sortBy=Terlaris"
      }
    },
    {
      "name": "Get Daily Cleaning",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/v1/landing-page/daily-cleaning?kategori=KamarKost"
      }
    }
  ]
}
```
