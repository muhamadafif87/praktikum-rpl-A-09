<p align="center">
  <img src="https://img.shields.io/badge/KostHub-Platform-667eea?style=for-the-badge&logoColor=white" alt="KostHub" />
</p>

<h1 align="center">KostHub - Platform Layanan Kos Terintegrasi</h1>

<p align="center">
  <em>Solusi Cerdas Mahasiswa Surakarta: Layanan Kos Instan, Aman & Anti-Cemas (Laundry Express, Gas & Galon, Daily Cleaning)</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 12" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Android-Kotlin-3DDC84?style=flat-square&logo=android&logoColor=white" alt="Android Kotlin" />
  <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP 8.2+" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
</p>

---

## Tentang Proyek

**KostHub** adalah platform *B2B2C* komprehensif yang dirancang untuk mendigitalisasi dan mempermudah operasional harian penghuni kos. Sistem ini mengintegrasikan tiga entitas utama dalam satu ekosistem:

1. **Customer (Aplikasi Android & Web)**: Mahasiswa yang mencari kemudahan pemesanan layanan harian dari genggaman *smartphone*.
2. **Mitra (Web Dashboard)**: Penyedia jasa lokal (Laundry, Galon, Daily Cleaning) untuk manajemen pesanan dan operasional.
3. **Admin (Web Dashboard)**: Pengelola platform untuk monitoring transaksi dan verifikasi mitra.

Proyek ini mengadopsi arsitektur **API-Driven (Headless)**, di mana *backend* (Laravel) menyediakan RESTful API yang dikonsumsi secara paralel oleh *frontend web* (React) dan aplikasi *mobile* (Android Kotlin).

---

## Struktur Repositori

Proyek utama kami terletak pada direktori `src/`, dengan keterangan sebagai berikut:

```text
📦 praktikum-rpl-A-09
 ┣ 📂 src/
 ┃ ┣ 📂 backend/       # RESTful API (Laravel 12, PHP 8.2)
 ┃ ┗ 📂 webapp/        # Halaman Utama, dan Dashboard Mitra & Admin (React 19, Vite)
 ┣ 📂 android/         # Aplikasi Mobile Customer (Kotlin, Jetpack Compose)
 ┣ 📂 docs/            # Dokumentasi Sistem (SRS, UML, ERD, API)
 ┗ 📜 README.md
```

---

## Panduan Instalasi

Panduan ini ditujukan bagi *user* yang baru pertama kali menjalankan proyek KostHub di lingkungan lokal (*development environment*).

### Prasyarat Sistem
Pastikan perangkat Anda telah memenuhi prasyarat berikut:
- **PHP** (v8.2 atau lebih baru)
- **Composer** (v2.x)
- **Node.js** (v18.x atau lebih baru) & **npm** (v9.x)
- **Database** PostgreSQL
- **Android Studio**

### 1️⃣ Clone Repositori

```bash
git clone https://github.com/muhamadafif87/praktikum-rpl-A-09.git
cd praktikum-rpl-A-09
```

### 2️⃣ Setup Backend (Laravel API)
*Backend* **wajib** dijalankan terlebih dahulu karena Web dan Android sangat bergantung padanya untuk autentikasi dan data.

```bash
# 1. Masuk ke direktori backend
cd src/backend

# 2. Install dependensi PHP
composer install

# 3. Konfigurasi Environment
cp .env.example .env
php artisan key:generate

# 4. Jalankan Migrasi Database dan Seeder (Data Awal)
# Sesuaikan pengaturan database di file .env terlebih dahulu jika menggunakan MySQL.
php artisan migrate:fresh --seed

# 5. Jalankan Development Server
# Catatan: Gunakan host 0.0.0.0 agar dapat diakses dari Emulator / Perangkat Fisik
php artisan serve --host=0.0.0.0 --port=8000
```
> 💡 **API Server akan berjalan di:** `http://localhost:8000`.

### 3️⃣ Setup Frontend (React Web App)

Buka tab terminal baru dan jalankan perintah berikut:

```bash
# 1. Pastikan Anda berada di root proyek, lalu masuk ke webapp
cd src/webapp

# 2. Install dependensi JavaScript
npm install

# 3. Konfigurasi Environment URL API
echo "VITE_API_URL=http://localhost:8000/api" > .env

# 4. Jalankan Development Server Vite
npm run dev
```
> 💡 **Web Dashboard akan berjalan di:** `http://localhost:5173`

### 4️⃣ Setup Aplikasi Mobile (Android)

1. Buka **Android Studio**.
2. Pilih **Open an existing project** dan arahkan ke folder `android/` di dalam repositori ini.
3. Tunggu hingga proses **Gradle Sync** selesai sepenuhnya (indikator *loading* di pojok kanan bawah hilang).
4. **Penting! Konfigurasi URL API:**
   Buka berkas konfigurasi *network* (misalnya `NetworkModule.kt` atau setara) dan ubah nilai `BASE_URL` sesuai lingkungan Anda:
   - 💻 Jika menggunakan **Emulator (AVD)**: Gunakan `http://10.0.2.2:8000/api/v1/`
   - 📱 Jika menggunakan **Perangkat Fisik**: Gunakan IP Address jaringan komputer Anda (contoh: `http://192.168.1.5:8000/api/v1/`). Pastikan HP dan PC terhubung di WiFi yang sama.
5. Klik tombol **Run** atau tekan `Shift + F10` untuk memasang (*deploy*) aplikasi ke perangkat/emulator Anda.

---

## Fitur Utama Platform

### Customer App (Web & Android)
- **Location-Based Search:** Temukan mitra terdekat secara akurat memanfaatkan integrasi Google Maps.
- **Order Management:** Pemesanan *seamless* dengan detail alamat kost, catatan khusus, lampiran foto, serta pemilihan metode pembayaran (COD / Transfer).
- **Live Tracking:** Pemantauan status pesanan secara *real-time* (Pending ➔ Proses ➔ Selesai).
- **Review System:** Sistem ulasan dan *rating* yang transparan bagi mitra.

### Mitra Dashboard (Web)
- **Order Management:** Menerima, menolak, dan memperbarui alur status pesanan masuk.
- **Catalog Management:** Pengaturan daftar layanan, variasi harga, metrik satuan, dan ketersediaan stok barang.
- **Financial Dashboard:** Metrik dan ringkasan performa pendapatan harian hingga bulanan.

### Admin Dashboard (Web)
- **Global Overview:** Statistik komprehensif mengenai pengguna aktif dan arus transaksi platform.
- **Partner Verification:** Proses verifikasi kelayakan (*approval* / *rejection*) pendaftar mitra baru.
- **Account Management:** Pengendalian penuh akun (*suspend* / *activate*) guna menjaga standar *Service Level Agreement* (SLA).

---

## Tech Stack

| Layer / Komponen | Teknologi Utama | Keterangan Tambahan |
| :--- | :--- | :--- |
| **Backend API** | Laravel 12 (PHP) | Laravel Sanctum (Token Auth), RESTful Architecture |
| **Frontend Web** | React 19, Vite 8 | TailwindCSS 4, React Router 7, Axios, Leaflet Map |
| **Mobile App** | Kotlin | Jetpack Compose / XML, Retrofit, Google Maps SDK |
| **Database** | PostgreSQL | Relational Database Management System |
| **Deployment** | Vercel, Railway, Supabase | Platform Deployment Cloud |

---

## Dokumentasi Lanjutan

Dokumentasi lengkap *Software Engineering* proyek ini dapat dieksplorasi di dalam direktori `docs/`:
- 📄 [Software Requirements Specification (SRS)](srs.md)
- 👤 [User Stories & Acceptance Criteria](user-stories.md)
- 🗄️ [Data Dictionary (Skema DB)](data-dictonary.md)
- 📊 [UML Diagrams (Use Case, Sequence, Class)](uml/)
- 🌐 [API Documentation](api/)

---

## Tim Pengembang (Kelompok A-09)

Sistem ini dikembangkan secara kolaboratif sebagai bagian dari proyek **Praktikum Rekayasa Perangkat Lunak - S1 Informatika - Universitas Sebelas Maret**.

- **Muhammad Daffa Ade Nugraha** `[L0124127]` — *Lead Software Engineer & QA*
- **Aerio Ade Putra** `[L0124128]` — *Full Stack Developer*
- **Muhamad Afif Aji Putra** `[L0124134]` — *Lead Backend Engineer & System Architect*
- **Valentino Joan Cesar** `[L0124121]` — *UI/UX Designer & Frontend Engineer*

---
<p align="center">
  <em>Dibuat dengan ❤️ untuk produktivitas mahasiswa yang lebih baik.</em>
</p>
