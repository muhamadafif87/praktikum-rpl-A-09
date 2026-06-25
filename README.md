<p align="center">
  <img src="https://img.shields.io/badge/KostHub-Platform-667eea?style=for-the-badge&logoColor=white" alt="KostHub" />
</p>

<h1 align="center">🏠 KostHub</h1>

<p align="center">
  <a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=600&size=20&pause=1000&color=667EEA&center=true&vCenter=true&width=550&lines=Layanan+Kos+Instan,+Aman+%26+Anti-Cemas;Laundry+Express,+Gas+%26+Galon,+Cleaning;Solusi+Cerdas+Mahasiswa+Surakarta" alt="Typing SVG" /></a>
</p>

<p align="center">
  <em>Platform layanan harian terintegrasi untuk penghuni kos yang menghubungkan mahasiswa dengan mitra penyedia jasa secara digital, aman, dan transparan. Hadir dalam ekosistem Web App dan Android Mobile App.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 12" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/Android-Kotlin-3DDC84?style=flat-square&logo=android&logoColor=white" alt="Android Kotlin" />
  <img src="https://img.shields.io/badge/Sanctum-4-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Sanctum 4" />
  <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP 8.2+" />
</p>

<p align="center">
  <a href="#-fitur-utama"><img src="https://img.shields.io/badge/✨_Fitur-212121?style=for-the-badge" alt="Fitur" /></a>
  <a href="#%EF%B8%8F-arsitektur"><img src="https://img.shields.io/badge/🏗️_Arsitektur-212121?style=for-the-badge" alt="Arsitektur" /></a>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/🚀_Quick_Start-212121?style=for-the-badge" alt="Quick Start" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/💻_Tech_Stack-212121?style=for-the-badge" alt="Tech Stack" /></a>
  <a href="#-dokumentasi"><img src="https://img.shields.io/badge/📚_Docs-212121?style=for-the-badge" alt="Docs" /></a>
  <a href="#-tim-pengembang"><img src="https://img.shields.io/badge/👥_Tim-212121?style=for-the-badge" alt="Tim" /></a>
</p>

---

## 📋 Tentang Proyek

> **KostHub** adalah platform B2B2C yang dirancang untuk memecahkan masalah operasional harian penghuni kos (mahasiswa). 

Platform ini menghubungkan **3 aktor utama** dalam satu ekosistem *omnichannel* (Web & Mobile) yang terintegrasi:

- 📱 **Customer (Android App & Web)** : Penghuni kos yang mencari kemudahan memesan layanan harian (laundry, galon, cleaning). Disediakan aplikasi **Android khusus** agar pemesanan bisa dilakukan langsung dari genggaman *smartphone*.
- 🏪 **Mitra (Web Dashboard)** : Penyedia jasa lokal yang membutuhkan digitalisasi untuk mengelola pesanan masuk dan manajemen stok.
- 🛡️ **Admin (Web Dashboard)** : Tim operasional yang menjaga kualitas platform melalui verifikasi mitra & pemantauan arus transaksi.

<p align="center">
  <img src="https://img.shields.io/badge/Cakupan_Area-Surakarta-2ea44f?style=for-the-badge&logo=google-maps" alt="Location" />
</p>

---

## 🏗️ Arsitektur Sistem

KostHub dibangun menggunakan arsitektur **API-Driven (Headless)**. Satu *backend* API Laravel digunakan bersamaan untuk melayani dua *frontend* yang berbeda (Web dan Android App).

```text
┌─────────────────────────────────────────────────────────┐
│                       CLIENT TIER                       │
│                                                         │
│  ┌────────────────────────┐  ┌───────────────────────┐  │
│  │   WebApp (Browser)     │  │ Android App (Mobile)  │  │
│  │  React 19 + Vite 8     │  │  Kotlin / Compose     │  │
│  │                        │  │                       │  │
│  │ ┌──────┐┌─────┐┌─────┐ │  │ ┌───────────────────┐ │  │
│  │ │ Cust ││Mitra││Admin│ │  │ │   Customer App    │ │  │
│  │ └──────┘└─────┘└─────┘ │  │ └───────────────────┘ │  │
│  └────────────────────────┘  └───────────────────────┘  │
│             │ Axios                     │ Retrofit      │
│             ▼                           ▼               │
└───────────────────────────┬─────────────────────────────┘
                            │ RESTful API (JSON)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │               Laravel 12 (Port 8000)              │  │
│  │  ┌──────┐   ┌───────┐   ┌───────┐   ┌─────────┐   │  │
│  │  │ Auth │   │ Order │   │ Mitra │   │  Admin  │   │  │
│  │  └──────┘   └───────┘   └───────┘   └─────────┘   │  │
│  ├───────────────────────────────────────────────────┤  │
│  │         Laravel Sanctum Token Authentication      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend Android**| Kotlin, Jetpack Compose / XML, Retrofit (API Client), Google Maps SDK |
| **Frontend Web** | React 19, Vite 8, TailwindCSS 4, React Router 7, Axios, Leaflet |
| **Backend** | PHP 8.2+, Laravel 12, Laravel Sanctum 4 |
| **Database** | SQLite (Dev) / MySQL (Prod) |
| **Auth** | Token-based (Laravel Sanctum) |

---

## 🚀 Quick Start (Menjalankan Proyek)

### Prasyarat
- PHP 8.2+ & Composer 2.x
- Node.js 18+ & npm 9+
- **Android Studio** (Disarankan versi Koala / Ladybug terbaru)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/muhamadafif87/praktikum-rpl-A-09.git
cd praktikum-rpl-A-09
```

### 2️⃣ Setup Backend API (Wajib untuk Web & Android)

**Sangat Penting:** Aplikasi Android tidak akan bisa login atau memuat data jika *backend* ini tidak dijalankan.

```bash
cd src/backend

# Install dependensi
composer install

# Setup env dan database
cp .env.example .env
php artisan key:generate
php artisan migrate

# JALANKAN SERVER API
# Parameter --host=0.0.0.0 wajib agar API bisa ditembak oleh emulator / HP fisik!
php artisan serve --host=0.0.0.0 --port=8000
```

### 3️⃣ Setup Frontend (React Web App)

```bash
# Buka terminal baru
cd src/webapp
npm install

# Setup environment Web
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Jalankan Web App (Akses di http://localhost:5173)
npm run dev
```

### 4️⃣ 📱 Setup Android App (Mobile)

Setelah API berjalan di port 8000, ikuti langkah ini untuk menghubungkan aplikasi Android:

1. Buka **Android Studio**.
2. Pilih **Open an existing project** lalu pilih folder *source code* Android (contoh: `src/android`).
3. Tunggu hingga proses *Gradle Sync* selesai (indikator *loading* di pojok kanan bawah hilang).
4. **Konfigurasi API URL:** Buka file konfigurasi koneksi API (biasanya di `NetworkModule.kt`, `RetrofitClient.kt`, atau `.env`). Ubah variabel `BASE_URL` sesuai dengan *environment testing* kamu:
   - 💻 **Jika pakai Emulator (AVD):**  
     Ubah menjadi: `http://10.0.2.2:8000/api/v1/`  
     *(Emulator membaca localhost dari laptop sebagai 10.0.2.2).*
   - 📱 **Jika pakai HP Fisik:**  
     Pastikan HP & Laptop terhubung di WiFi/Hotspot yang sama. Cek IP Address IPv4 laptopmu (lewat CMD `ipconfig` atau Terminal `ifconfig`). Contoh IP kamu `192.168.1.5`, maka ubah menjadi:  
     `http://192.168.1.5:8000/api/v1/`
5. Tekan tombol **Run (▶)** atau `Shift + F10` untuk menginstal dan menjalankan aplikasi ke HP/Emulator.

---

## ✨ Fitur Utama

<details>
<summary><strong>🧑‍🎓 Sisi Customer (Aplikasi Android & Web)</strong> <em>(Klik untuk melihat)</em></summary>

- 🔍 **Pencarian & Kategori Layanan** — Filter *Laundry, Gas & Galon, atau Daily Cleaning*.
- 📍 **Location-Based Search** — Temukan mitra terdekat secara akurat via Google Maps SDK.
- 🛒 **Pemesanan Mudah** — Detail lokasi kamar, catatan, hingga foto terintegrasi dari kamera HP.
- 💳 **Metode Pembayaran** — *COD* (Cash on Delivery) atau Transfer.
- 📊 **Live Tracking** — Pantau perkembangan pesanan (Pending → Diproses → Selesai).
- ⭐ **Rating & Ulasan** — Berikan *feedback* untuk layanan mitra.
</details>

<details>
<summary><strong>🏪 Sisi Mitra (Web Dashboard)</strong> <em>(Klik untuk melihat)</em></summary>

- 📦 **Manajemen Pesanan Masuk** — Terima/tolak pesanan dari user Android.
- 🧾 **Katalog & Harga** — Atur daftar layanan, harga, satuan, dan ketersediaan.
- 📈 **Keuangan** — Pantau ringkasan pendapatan harian/bulanan.
</details>

<details>
<summary><strong>🛡️ Sisi Admin (Web Dashboard)</strong> <em>(Klik untuk melihat)</em></summary>

- 📊 **Statistik Global** — *Overview* seluruh user aktif dan total transaksi.
- ✅ **Verifikasi Mitra** — Proses *approval/rejection* pendaftar baru.
- 🤝 **Partner Management** — Manajemen status aktif/suspend seluruh mitra.
</details>

---

## 📡 API Overview (Endpoints)

REST API digunakan sebagai pusat data yang menghubungkan Web dan Mobile App. 

```text
AUTH
  POST   /api/v1/auth/register          # Registrasi user baru
  POST   /api/v1/auth/login             # Login (Menghasilkan Sanctum Token)
  POST   /api/v1/auth/logout            # Logout
  GET    /api/v1/auth/me                # Ambil profil user aktif

CUSTOMER (Mobile / Web)
  GET    /api/v1/landing-page/laundry-express    # Daftar mitra laundry
  GET    /api/v1/landing-page/galon-gas          # Daftar mitra gas/galon
  POST   /api/v1/landing-page/pesanan            # Buat pesanan baru
  GET    /api/v1/landing-page/pesanan/riwayat    # Riwayat pesanan

MITRA DASHBOARD (Web)
  GET    /api/v1/mitra/pesanan                   # Daftar antrian pesanan
  PATCH  /api/v1/mitra/pesanan/:id/status        # Update status pesanan

ADMIN DASHBOARD (Web)
  GET    /api/v1/dashboard/admin/mitra/list      # Daftar mitra
  PATCH  /api/v1/dashboard/admin/mitra/action    # Approve/reject mitra
```
> 📄 Dokumentasi API lengkap tersedia di folder [`docs/api/`](docs/api/)

---

## 🗄️ Database Schema

Platform ini menggunakan tabel relasional yang diatur dari *backend* Laravel:

```mermaid
erDiagram
    USERS ||--o{ PESANAN : "membuat"
    MITRA ||--o{ PESANAN : "mengerjakan"
    MITRA ||--o{ LAYANAN : "menyediakan"
    MITRA ||--|| MITRA_LOGIN_ACCESS : "memiliki"
    PESANAN ||--o{ DETAIL_PESANAN : "berisi"
    PESANAN ||--|| PEMBAYARAN : "memiliki"
    PESANAN ||--o| ULASAN : "memiliki"
    LAYANAN ||--o{ DETAIL_PESANAN : "termasuk"
    ADMIN ||--o{ MITRA : "memverifikasi"
```

---

## 📄 Dokumentasi Lanjutan
* [`docs/srs.md`](docs/srs.md) — Software Requirements Specification
* [`docs/user-stories.md`](docs/user-stories.md) — User Stories + Acceptance Criteria
* [`docs/data-dictonary.md`](docs/data-dictonary.md) — Skema tabel database (Data Dictionary)
* [`docs/uml/`](docs/uml/) — UML Diagrams (Use Case, Class, Sequence)

---

## 👥 Tim Pengembang

<table width="100%">
  <thead>
    <tr>
      <th align="center" valign="top">👨‍💻 Muhammad Daffa Ade Nugraha<br><img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif" width="225" height="1" /></th>
      <th align="center" valign="top">🚀 Aerio Ade Putra<br><img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif" width="225" height="1" /></th>
      <th align="center" valign="top">⚙️ Muhamad Afif Aji Putra<br><img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif" width="225" height="1" /></th>
      <th align="center" valign="top">🎨 Valentino Joan Cesar<br><img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif" width="225" height="1" /></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <code>[ L0124127 ]</code><br/><br/>
        <em>✨ Lead Software Engineer & Quality Assurance</em>
      </td>
      <td align="center" valign="top">
        <code>[ L0124128 ]</code><br/><br/>
        <em>⚡ Full Stack Developer</em>
      </td>
      <td align="center" valign="top">
        <code>[ L0124134 ]</code><br/><br/>
        <em>🔧 Lead Backend Engineer & System Architect</em>
      </td>
      <td align="center" valign="top">
        <code>[ L0124121 ]</code><br/><br/>
        <em>🖌️ UI/UX Designer & Frontend Engineer</em>
      </td>
    </tr>
  </tbody>
</table>

<p align="center">
  <strong>Praktikum Rekayasa Perangkat Lunak — Kelompok A-09</strong><br/>
  <em>Universitas Sebelas Maret (UNS), Solo</em>
</p>

---

<p align="center">
  Built with ❤️ by <strong>Kelompok A-09-KostHUB</strong> — UNS 2026
</p>
