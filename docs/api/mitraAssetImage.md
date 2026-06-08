# API Dokumentasi — Mitra Image Asset

Dokumentasi ini menjelaskan penggunaan API untuk mengelola aset gambar milik Mitra (`mitra_asset_image`).

---

## Daftar Isi

- [Informasi Umum](#informasi-umum)
- [Struktur Response](#struktur-response)
- [HTTP Status Code](#http-status-code)
- [Endpoints](#endpoints)
  - [1. List Gambar per Mitra](#1-list-gambar-per-mitra)
  - [2. Detail Gambar](#2-detail-gambar)
  - [3. Upload Gambar Baru](#3-upload-gambar-baru)
  - [4. Update Gambar](#4-update-gambar)
  - [5. Hapus Gambar](#5-hapus-gambar)
- [Validasi & Error](#validasi--error)
- [Catatan Teknis](#catatan-teknis)
- [Contoh Integrasi](#contoh-integrasi)

---

## Informasi Umum

| Item | Detail |
|------|--------|
| Base URL | `https://<your-domain>/Api/V1/Dashboard/M1/Dashboard/Mitra` |
| Format Request | `multipart/form-data` (untuk upload), `application/json` (opsional untuk GET/DELETE) |
| Format Response | `application/json` |
| Autentikasi | Sesuaikan dengan middleware

---

## Struktur Response

Semua endpoint mengembalikan format JSON yang konsisten:

```json
{
    "success": true | false,
    "message": "Pesan deskriptif.",
    "data": { ... } | [ ... ] | null
}
```

| Field | Tipe | Keterangan |
|-------|------|------------|
| `success` | `boolean` | `true` jika request berhasil, `false` jika gagal |
| `message` | `string` | Pesan human-readable tentang hasil request |
| `data` | `object` / `array` / `null` | Payload utama; `null` pada operasi hapus atau error |

### Struktur Objek `MitraImageAsset`

```json
{
    "id": 1,
    "id_mitra": 3,
    "description": "Foto kantor pusat",
    "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
}
```

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | `integer` | Primary key |
| `id_mitra` | `integer` | Foreign key ke tabel `mitra` |
| `description` | `string` / `null` | Deskripsi opsional gambar |
| `image_base64` | `string` / `null` | Gambar dalam format Data URI base64, siap dipakai di tag `<img>` |

> **Catatan:** Field `image_file` (binary BYTEA) tidak dikembalikan langsung. Gunakan `image_base64` untuk menampilkan gambar.

---

## HTTP Status Code

| Kode | Arti |
|------|------|
| `200` | OK — Request berhasil |
| `201` | Created — Data berhasil dibuat |
| `422` | Unprocessable Entity — Validasi gagal |
| `404` | Not Found — Data tidak ditemukan |
| `500` | Internal Server Error — Kesalahan pada server |

---

## Endpoints

---

### 1. List Gambar per Mitra

Mengambil semua aset gambar yang dimiliki oleh satu mitra berdasarkan `id_mitra`.

```
GET /v1/mitra/{idMitra}/images
```

**Path Parameter**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `idMitra` | `integer` | ID mitra yang ingin diambil gambarnya |

**Contoh Request**

```http
GET /v1/mitra/3/images
Accept: application/json
```

**Contoh Response — 200 OK**

```json
{
    "success": true,
    "message": "Berhasil mengambil daftar gambar.",
    "data": [
        {
            "id": 1,
            "id_mitra": 3,
            "description": "Foto kantor pusat",
            "image_base64": "data:image/jpeg;base64,/9j/4AAQ..."
        },
        {
            "id": 2,
            "id_mitra": 3,
            "description": null,
            "image_base64": "data:image/png;base64,iVBORw0KGgo..."
        }
    ]
}
```

**Contoh Response — Data Kosong**

```json
{
    "success": true,
    "message": "Berhasil mengambil daftar gambar.",
    "data": []
}
```

---

### 2. Detail Gambar

Mengambil satu aset gambar berdasarkan `id`.

```
GET /v1/mitra/mitra-images/{id}
```

**Path Parameter**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `id` | `integer` | ID aset gambar |

**Contoh Request**

```http
GET /v1/mitra/mitra-images/1
Accept: application/json
```

**Contoh Response — 200 OK**

```json
{
    "success": true,
    "message": "Berhasil mengambil data gambar.",
    "data": {
        "id": 1,
        "id_mitra": 3,
        "description": "Foto kantor pusat",
        "image_base64": "data:image/jpeg;base64,/9j/4AAQ..."
    }
}
```

**Contoh Response — 404 Not Found**

```json
{
    "success": false,
    "message": "Data gambar tidak ditemukan.",
    "data": null
}
```

---

### 3. Upload Gambar Baru

Mengupload gambar baru dan menghubungkannya ke mitra tertentu.

```
POST /v1/mitra/mitra-images
Content-Type: multipart/form-data
```

**Body (Form Data)**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `id_mitra` | `integer` | ✅ Ya | ID mitra pemilik gambar; harus ada di tabel `mitra` |
| `description` | `string` | ❌ Opsional | Deskripsi gambar, maksimal 255 karakter |
| `image` | `file` | ✅ Ya | File gambar; format: `jpeg`, `jpg`, `png`, `webp`; maks **5 MB** |

**Contoh Request (Postman / cURL)**

```bash
curl -X POST https://<your-domain>/v1/mitra/mitra-images \
  -H "Accept: application/json" \
  -F "id_mitra=3" \
  -F "description=Foto kantor pusat" \
  -F "image=@/path/to/foto.jpg"
```

**Contoh Response — 201 Created**

```json
{
    "success": true,
    "message": "Gambar berhasil diupload.",
    "data": {
        "id": 5,
        "id_mitra": 3,
        "description": "Foto kantor pusat",
        "image_base64": "data:image/jpeg;base64,/9j/4AAQ..."
    }
}
```

**Contoh Response — 422 Validasi Gagal**

```json
{
    "success": false,
    "message": "Validasi gagal.",
    "errors": {
        "id_mitra": ["Mitra dengan id tersebut tidak ditemukan."],
        "image": ["File gambar wajib diupload."]
    }
}
```

---

### 4. Update Gambar

Memperbarui deskripsi dan/atau file gambar dari aset yang sudah ada.

```
POST /v1/mitra/mitra-images/{id}
Content-Type: multipart/form-data
```

> ⚠️ **Mengapa POST bukan PUT?**  
> Browser dan banyak HTTP client tidak mendukung pengiriman file via `multipart/form-data` dengan method `PUT` atau `PATCH`. Sebagai gantinya, gunakan `POST` dengan field tambahan `_method=PUT` (Laravel method spoofing).

**Path Parameter**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `id` | `integer` | ID aset gambar yang akan diperbarui |

**Body (Form Data)**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `_method` | `string` | ✅ Ya | Harus bernilai `PUT` |
| `description` | `string` | ❌ Opsional | Deskripsi baru; kirim `null` atau kosongkan untuk menghapus deskripsi |
| `image` | `file` | ❌ Opsional | File gambar baru; jika tidak dikirim, gambar lama tetap dipertahankan |

**Contoh Request**

```bash
curl -X POST https://<your-domain>/v1/mitra/mitra-images/5 \
  -H "Accept: application/json" \
  -F "_method=PUT" \
  -F "description=Foto gedung baru" \
  -F "image=@/path/to/gedung-baru.jpg"
```

**Hanya update deskripsi (tanpa ganti gambar):**

```bash
curl -X POST https://<your-domain>/v1/mitra/mitra-images/5 \
  -H "Accept: application/json" \
  -F "_method=PUT" \
  -F "description=Update deskripsi saja"
```

**Contoh Response — 200 OK**

```json
{
    "success": true,
    "message": "Gambar berhasil diperbarui.",
    "data": {
        "id": 5,
        "id_mitra": 3,
        "description": "Foto gedung baru",
        "image_base64": "data:image/jpeg;base64,/9j/4BBR..."
    }
}
```

**Contoh Response — 404 Not Found**

```json
{
    "success": false,
    "message": "Data gambar tidak ditemukan.",
    "data": null
}
```

---

### 5. Hapus Gambar

Menghapus aset gambar secara permanen berdasarkan `id`.

```
DELETE /v1/mitra/mitra-images/{id}
```

**Path Parameter**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `id` | `integer` | ID aset gambar yang akan dihapus |

**Contoh Request**

```bash
curl -X DELETE https://<your-domain>/v1/mitra/mitra-images/5 \
  -H "Accept: application/json"
```

**Contoh Response — 200 OK**

```json
{
    "success": true,
    "message": "Gambar berhasil dihapus.",
    "data": null
}
```

**Contoh Response — 404 Not Found**

```json
{
    "success": false,
    "message": "Data gambar tidak ditemukan.",
    "data": null
}
```

---

## Validasi & Error

### Aturan Validasi Upload (`POST /v1/mitra/mitra-images`)

| Field | Aturan | Pesan Error |
|-------|--------|-------------|
| `id_mitra` | Wajib, integer, harus ada di DB | `id_mitra wajib diisi.` / `Mitra dengan id tersebut tidak ditemukan.` |
| `description` | Opsional, string, maks 255 karakter | — |
| `image` | Wajib, tipe file gambar, format jpeg/jpg/png/webp, maks 5 MB | `File gambar wajib diupload.` / `Format gambar harus jpeg, jpg, png, atau webp.` / `Ukuran gambar maksimal 5 MB.` |

### Aturan Validasi Update (`POST /v1/mitra/mitra-images/{id}` + `_method=PUT`)

| Field | Aturan | Pesan Error |
|-------|--------|-------------|
| `description` | Opsional, string, maks 255 karakter | — |
| `image` | Opsional, tipe file gambar, format jpeg/jpg/png/webp, maks 5 MB | `Format gambar harus jpeg, jpg, png, atau webp.` / `Ukuran gambar maksimal 5 MB.` |

### Response Error Server (500)

```json
{
    "success": false,
    "message": "Terjadi kesalahan pada server.",
    "error": "Detail error (hanya muncul jika APP_DEBUG=true)"
}
```

> **Catatan:** Field `error` hanya terisi di environment development (`APP_DEBUG=true`). Di production, nilainya `null`.

---

## Catatan Teknis

### Penyimpanan Gambar

Gambar disimpan langsung ke database PostgreSQL menggunakan tipe kolom `BYTEA`. Tidak ada file yang disimpan ke disk/storage server.

- **Keuntungan:** Data gambar selalu konsisten dengan data database (tidak ada orphan file).
- **Pertimbangan:** Perhatikan ukuran database seiring bertambahnya gambar. Batasan upload saat ini adalah **5 MB per gambar**.

### Format `image_base64`

Response field `image_base64` mengembalikan gambar dalam format **Data URI**:

```
data:image/jpeg;base64,<encoded-data>
```

Langsung bisa digunakan di HTML tanpa request tambahan:

```html
<img src="data:image/jpeg;base64,/9j/4AAQ..." alt="Foto Mitra" />
```

### Method Spoofing untuk Update

Karena keterbatasan `multipart/form-data` dengan method `PUT`, gunakan:

```
POST /v1/mitra/mitra-images/{id}
Body: _method=PUT, ...fields lainnya
```

Pastikan middleware `HandlePrecognitiveRequests` dan `SubstituteBindings` aktif di Laravel (sudah aktif secara default).

### Konfigurasi PostgreSQL (PDO)

Agar `BYTEA` terbaca dengan benar, tambahkan di `config/database.php`:

```php
'pgsql' => [
    // ...konfigurasi lainnya
    'options' => [
        PDO::ATTR_EMULATE_PREPARES => true,
    ],
],
```

---

## Contoh Integrasi

### JavaScript (Fetch API)

**Upload gambar baru:**

```javascript
const formData = new FormData();
formData.append('id_mitra', 3);
formData.append('description', 'Foto kantor');
formData.append('image', fileInput.files[0]);

const response = await fetch('/v1/mitra/mitra-images', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: formData,
});

const result = await response.json();

if (result.success) {
    console.log('Upload berhasil:', result.data);
    document.getElementById('preview').src = result.data.image_base64;
} else {
    console.error('Error:', result.message, result.errors);
}
```

**Update gambar:**

```javascript
const formData = new FormData();
formData.append('_method', 'PUT');
formData.append('description', 'Deskripsi baru');
formData.append('image', newFileInput.files[0]); // opsional

const response = await fetch('/v1/mitra/mitra-images/5', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: formData,
});

const result = await response.json();
```

**Hapus gambar:**

```javascript
const response = await fetch('/v1/mitra/mitra-images/5', {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
});

const result = await response.json();
console.log(result.message); // "Gambar berhasil dihapus."
```

### Axios

**Upload gambar baru:**

```javascript
const formData = new FormData();
formData.append('id_mitra', 3);
formData.append('description', 'Foto kantor');
formData.append('image', file);

try {
    const { data } = await axios.post('/v1/mitra/mitra-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log(data);
} catch (error) {
    if (error.response?.status === 422) {
        console.error('Validasi gagal:', error.response.data.errors);
    }
}
```

**Update gambar (method spoofing):**

```javascript
const formData = new FormData();
formData.append('_method', 'PUT');
formData.append('description', 'Deskripsi baru');

const { data } = await axios.post(`/v1/mitra/mitra-images/${id}`, formData);
```

---

*Dokumentasi ini dibuat untuk Laravel 12 + PostgreSQL (Supabase). Versi terakhir diperbarui sesuai implementasi `MitraImageAssetController`, `MitraImageAssetService`, dan Form Request terkait.*
