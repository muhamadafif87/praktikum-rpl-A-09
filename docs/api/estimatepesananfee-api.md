# Dokumentasi API Estimasi Biaya Pesanan

## Estimasi Biaya Pesanan

Endpoint untuk menghitung estimasi biaya pesanan sebelum user melakukan checkout. Mendukung pemesanan **banyak layanan sekaligus** dari 1 mitra (kecuali laundry).

---

### Endpoint

```http
POST /v1/landing-page/generate-fee-pesanan
```

---

### Request Headers

| Key | Value | Required |
|-----|-------|----------|
| `Content-Type` | `application/json` | ✅ Yes |
| `Authorization` | `Bearer {token}` | ✅ Yes |

---

### Request Body

#### Base Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idMitra` | string | ✅ | ID mitra (harus ada di database) |
| `typeLayanan` | string | ✅ | Tipe layanan: `daily_cleaning`, `galon_gas`, `laundry` |
| `layanan` | array | ✅ | Daftar layanan yang dipesan (min 1 item) |
| `layanan[].idLayanan` | string | ✅ | ID layanan (harus milik mitra tersebut) |
| `layanan[].qty` | integer | ✅ | Jumlah/durasi/berat (min 1) |
| `jarakOngkir` | integer | ✅ | Jarak dalam kilometer (min 0) |
| `biayaTambahan` | object/array | ❌ | Biaya tambahan (struktur berbeda per tipe) |
| `biayaTambahanAlat` | object | ❌ | Khusus `daily_cleaning`: daftar alat tambahan |

---

### Detail Request per Tipe Layanan

## 1. Daily Cleaning

**Karakteristik:**
- ✅ Bisa pesan **banyak layanan** sekaligus
- `qty` = **Durasi sewa** (dalam jam)
- Menggunakan `biaya_transportasi` (bukan ongkir)
- `biayaTambahanAlat` untuk alat pembersih tambahan

**Struktur Request:**

```json
{
    "idMitra": "3",
    "typeLayanan": "daily_cleaning",
    "layanan": [
        {
            "idLayanan": "5",
            "qty": 3
        },
        {
            "idLayanan": "6",
            "qty": 2
        }
    ],
    "jarakOngkir": 5,
    "biayaTambahanAlat": {
        "Pel": 7000,
        "Sapu": 5000,
        "Vacum Cleaner": 15000
    }
}
```

**Response Structure:**

```json
{
    "success": true,
    "message": "Estimasi biaya berhasil dihitung",
    "data": {
        "type_layanan": "daily_cleaning",
        "detail_layanan": [
            {
                "id_layanan": 5,
                "nama_layanan": "Rapikan Kamar",
                "qty": 3,
                "satuan": "jam",
                "harga_satuan": 50000,
                "subtotal": 150000
            }
        ],
        "biaya_tambahan_alat": {
            "Pel": 7000,
            "Sapu": 5000
        },
        "ringkasan": {
            "subtotal": 240000,
            "biaya_tambahan_alat": 12000,
            "biaya_transportasi": 15000,
            "biaya_layanan_aplikasi": 1000,
            "total_pembayaran": 268000
        }
    }
}
```

---

## 2. Galon/Gas

**Karakteristik:**
- ✅ Bisa pesan **banyak layanan** sekaligus
- `qty` = **Jumlah item** (galon/gas)
- Menggunakan `biaya_ongkir`
- `beli_baru` = biaya tambahan jika beli galon/gas baru (bukan isi ulang)

**Struktur Request:**

```json
{
    "idMitra": "3",
    "typeLayanan": "galon_gas",
    "layanan": [
        {
            "idLayanan": "7",
            "qty": 3
        },
        {
            "idLayanan": "8",
            "qty": 2
        }
    ],
    "jarakOngkir": 4,
    "biayaTambahan": [
        {
            "idLayanan": "7",
            "beli_baru": 50000
        },
        {
            "idLayanan": "8",
            "beli_baru": 0
        }
    ]
}
```

**Response Structure:**

```json
{
    "success": true,
    "message": "Estimasi biaya berhasil dihitung",
    "data": {
        "type_layanan": "galon_gas",
        "detail_layanan": [
            {
                "id_layanan": 7,
                "nama_layanan": "Galon 19L",
                "qty": 3,
                "satuan": "item",
                "harga_satuan": 15000,
                "subtotal": 45000,
                "beli_baru_per_item": 50000,
                "total_beli_baru": 150000
            }
        ],
        "ringkasan": {
            "subtotal": 81000,
            "biaya_ongkir": 8000,
            "biaya_layanan_aplikasi": 1000,
            "total_beli_baru": 150000,
            "total_pembayaran": 240000
        }
    }
}
```

---

## 3. Laundry

**Karakteristik:**
- ❌ **Hanya bisa 1 layanan** (akan error jika >1)
- `qty` = **Berat laundry** (dalam kg)
- Menggunakan `biaya_ongkir`
- `durasi_pengerjaan` = biaya tambahan per kg untuk express

**Struktur Request:**

```json
{
    "idMitra": "3",
    "typeLayanan": "laundry",
    "layanan": [
        {
            "idLayanan": "9",
            "qty": 5
        }
    ],
    "jarakOngkir": 3,
    "biayaTambahan": {
        "durasi_pengerjaan": 2000
    }
}
```

**Response Structure:**

```json
{
    "success": true,
    "message": "Estimasi biaya berhasil dihitung",
    "data": {
        "type_layanan": "laundry",
        "detail_layanan": [
            {
                "id_layanan": 9,
                "nama_layanan": "Laundry Kiloan",
                "qty": 5,
                "satuan": "kg",
                "harga_satuan": 8000,
                "subtotal": 40000,
                "durasi_pengerjaan": 2000,
                "biaya_tambahan_durasi": 10000
            }
        ],
        "ringkasan": {
            "subtotal": 40000,
            "biaya_ongkir": 6000,
            "biaya_layanan_aplikasi": 1000,
            "biaya_tambahan_durasi": 10000,
            "total_pembayaran": 57000
        }
    }
}
```

---

### Response Format

#### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Estimasi biaya berhasil dihitung",
    "data": {
        "type_layanan": "string",
        "detail_layanan": [...],
        "ringkasan": {...}
    }
}
```

#### Error Response (500 Internal Server Error)

```json
{
    "success": false,
    "message": "Gagal menghitung estimasi: {error_message}"
}
```

---

### Field Descriptions

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Status request (true/false) |
| `message` | string | Pesan response |
| `data.type_layanan` | string | Tipe layanan yang dipilih |
| `data.detail_layanan` | array | Detail per item layanan |
| `data.detail_layanan[].id_layanan` | integer | ID layanan |
| `data.detail_layanan[].nama_layanan` | string | Nama layanan |
| `data.detail_layanan[].qty` | integer | Quantity yang dipesan |
| `data.detail_layanan[].satuan` | string | Satuan (jam/kg/item) |
| `data.detail_layanan[].harga_satuan` | integer | Harga per satuan |
| `data.detail_layanan[].subtotal` | integer | Total harga layanan (harga_satuan × qty) |
| `data.ringkasan.subtotal` | integer | Total semua subtotal layanan |
| `data.ringkasan.biaya_ongkir` | integer | Biaya ongkos kirim (laundry/galon) |
| `data.ringkasan.biaya_transportasi` | integer | Biaya transportasi (daily cleaning) |
| `data.ringkasan.biaya_layanan_aplikasi` | integer | Biaya admin aplikasi (fixed 1000) |
| `data.ringkasan.total_pembayaran` | integer | Total semua biaya |

---

### Error Scenarios

| Scenario | HTTP Code | Message |
|----------|-----------|---------|
| Mitra tidak ditemukan | 500 | `Mitra tidak ditemukan` |
| Layanan tidak ditemukan | 500 | `Layanan dengan ID {id} tidak ditemukan pada mitra ini` |
| Laundry dengan >1 layanan | 500 | `Untuk layanan laundry, hanya boleh memesan 1 layanan dalam satu waktu` |
| Qty < 1 | 422 | `layanan.0.qty minimal 1` |
| typeLayanan tidak valid | 422 | `typeLayanan harus berupa salah satu dari: laundry, galon_gas, daily_cleaning` |

---

### Contoh Implementasi Frontend

#### JavaScript/React Example

```javascript
// Daily Cleaning dengan multiple services
const estimateDailyCleaning = async () => {
  const payload = {
    idMitra: "3",
    typeLayanan: "daily_cleaning",
    layanan: [
      { idLayanan: "5", qty: 3 },  // Rapikan Kamar - 3 jam
      { idLayanan: "6", qty: 2 }   // Cuci Piring - 2 jam
    ],
    jarakOngkir: 5,
    biayaTambahanAlat: {
      Pel: 7000,
      "Vacum Cleaner": 15000
    }
  };

  try {
    const response = await fetch('/api/estimate-fee-pesanan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Total pembayaran:', result.data.ringkasan.total_pembayaran);
      // Tampilkan detail ke UI
      displayEstimation(result.data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Galon/Gas dengan multiple items
const estimateGalonGas = async () => {
  const payload = {
    idMitra: "3",
    typeLayanan: "galon_gas",
    layanan: [
      { idLayanan: "7", qty: 3 },  // 3 galon
      { idLayanan: "8", qty: 2 }   // 2 gas
    ],
    jarakOngkir: 4,
    biayaTambahan: [
      { idLayanan: "7", beli_baru: 50000 },  // beli galon baru
      { idLayanan: "8", beli_baru: 0 }       // isi ulang gas
    ]
  };

  const response = await fetch('/api/estimate-fee-pesanan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(payload)
  });

  return response.json();
};
```

#### Contoh Tampilan UI

```javascript
// Menampilkan estimasi ke user
const displayEstimation = (data) => {
  const { detail_layanan, ringkasan } = data;
  
  // Tampilkan detail per layanan
  detail_layanan.forEach(service => {
    console.log(`
      ${service.nama_layanan}
      ${service.qty} ${service.satuan} x Rp ${service.harga_satuan}
      = Rp ${service.subtotal}
    `);
  });
  
  // Tampilkan ringkasan
  console.log(`
    Subtotal: Rp ${ringkasan.subtotal}
    Biaya Ongkir: Rp ${ringkasan.biaya_ongkir || ringkasan.biaya_transportasi}
    Biaya Layanan: Rp ${ringkasan.biaya_layanan_aplikasi}
    Total: Rp ${ringkasan.total_pembayaran}
  `);
};
```

---

### Catatan Penting untuk FE

1. **Validasi Sebelum Request:**
   - Pastikan `idMitra` dan `idLayanan` valid
   - Untuk laundry, batasi user hanya bisa pilih 1 layanan
   - Qty minimal 1 untuk semua layanan

2. **Perbedaan Perhitungan:**
   - `daily_cleaning`: menggunakan `biaya_transportasi` + `biayaTambahanAlat`
   - `galon_gas` & `laundry`: menggunakan `biaya_ongkir`

3. **Format Biaya Tambahan:**
   - `daily_cleaning`: object (key: nama alat, value: harga)
   - `galon_gas`: array of object (dengan idLayanan)
   - `laundry`: object langsung (bukan array)

4. **Response Handling:**
   - Selalu cek `success` flag sebelum memproses data
   - Tampilkan error message jika `success: false`
   - Gunakan `ringkasan.total_pembayaran` untuk ditampilkan ke user

5. **User Experience Tips:**
   - Tampilkan loading state saat request
   - Format mata uang ke Rupiah (Rp)
   - Tampilkan breakdown biaya agar transparan

---

### Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-09 | Initial release - Support multiple services for daily_cleaning & galon_gas |
