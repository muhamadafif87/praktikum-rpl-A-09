# Changelog

Semua perubahan penting pada proyek **KostHub** didokumentasikan dalam dokumen ini.

Format penulisan mengikuti prinsip [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [1.0.0] - 2026-06-29

### Added
- Inisialisasi proyek dengan **Laravel 12** (backend) dan **React 19** (frontend), serta konfigurasi database menggunakan **Supabase**.
- Sistem autentikasi: register, login, logout, dan endpoint `me` menggunakan **Laravel Sanctum**, termasuk multi-guard authentication untuk role Admin, Mitra, dan User, serta dukungan login via nomor WhatsApp/telepon.
- Halaman **Landing Page** beserta integrasi API dan optimasi performa (termasuk penanganan UI untuk mitra di luar jarak jangkauan).
- Halaman detail layanan mitra: **Laundry**, **Gas & Galon**, dan **Daily Cleaning**, lengkap dengan sidebar filter dan review.
- Sistem lokasi: integrasi **Mapbox** (pencarian alamat, autocomplete, mini-map), sinkronisasi profil, dan penguncian lokasi wajib (hard lock location guard) sebelum transaksi.
- Halaman **Profil User**, termasuk avatar dinamis, dropdown menu, dan integrasi koordinat peta ke database.
- Fitur **upload gambar** (image upload API) dan pembaruan skema penyimpanan data gambar.
- Alur pemesanan (**order**) lengkap: pembuatan pesanan, detail pesanan, kalkulasi biaya (`generateFeePesanan`), checkout, dan pelacakan stok inventaris.
- Fitur **Riwayat Pesanan (Order History)** beserta sistem **Rating & Review**, termasuk alur penyelesaian pesanan (order completion flow).
- **Dashboard Mitra**: manajemen pesanan, manajemen keuangan (finance), manajemen inventaris, pengaturan mitra, bantuan & dukungan (help support), review mitra, dan fitur chat dashboard.
- **Dashboard Admin**: komponen dan navigasi dashboard, integrasi API dashboard admin, serta halaman manajemen mitra dan stok.
- Halaman **Tentang Kami (About Us)** dengan tata letak bento grid.
- **Footer** global dinamis yang menyertakan modal legal (syarat & ketentuan, kebijakan privasi).
- Animasi navbar (transisi, sliding indicator) dan latar belakang animasi (ambient glow) pada halaman hero.
- **Aplikasi Android**: implementasi aplikasi lengkap dengan integrasi Google Maps dan API, layar riwayat pesanan dengan fungsionalitas CRUD penuh, serta halaman profil pengguna.
- Konfigurasi **CORS** untuk mendukung komunikasi lintas domain antara backend dan frontend.
- Penambahan **unit test** dan validasi input untuk mencegah serangan XSS pada permintaan pembuatan pesanan.
- Dokumentasi proyek: SRS, ERD, Data Dictionary, UML Diagrams (use case, sequence, class), test cases, dan user stories.

### Changed
- Refaktor struktur proyek menjadi arsitektur monorepo (pemisahan folder backend dan frontend) untuk kerapian dan skalabilitas.
- Refaktor penamaan fungsi untuk menghilangkan ambiguitas pada logic bisnis.
- Optimasi performa API landing page dan pemanggilan data (parallelize API calls) pada halaman finance dan orders untuk mengurangi re-render berlebih.
- Penyesuaian tampilan (styling) pada kartu mitra, halaman Tentang Kami, dan efek ambient glow agar lebih konsisten dan enak dilihat.
- Perubahan aturan validasi kolom `regist_as` menjadi nullable dengan nilai default.
- Deploy dan integrasi proyek ke platform **Vercel**.

### Fixed
- Perbaikan bug pembuatan pesanan (create pesanan) yang gagal pada kondisi tertentu.
- Perbaikan tampilan navbar yang tidak full-screen pada dashboard mitra.
- Perbaikan crash koneksi PostgreSQL (Supabase PgBouncer) dengan menonaktifkan prepared statements PDO untuk pgsql.
- Perbaikan halaman blank (white screen) pada dashboard admin akibat konfigurasi proxy Vite, serta pada halaman laundry.
- Perbaikan bug login mitra dan konflik routing pada dashboard mitra.
- Perbaikan duplikasi state variable pada halaman mitra.
- Perbaikan error kode saat proses seeding data detail pesanan.
- Perbaikan efek blinking (kedip) pada UI sebelum kalkulasi biaya selesai dimuat.
- Perbaikan validasi checkout, penanganan error UI, dan pemilihan item yang kehabisan stok (out-of-stock).
- Perbaikan pemetaan payload jadwal (schedule), catatan UI escrow, batas panjang input catatan, dan posisi dropdown profil.
- Perbaikan data mitra yang berada di luar jangkauan lokasi dan tata letak footer pada halaman Gas & Galon.
- Perbaikan konflik merge pada halaman manajemen stok admin (AdminStock).
- Perbaikan bug perhitungan dan UX pada manajemen keuangan mitra, termasuk penambahan transaction observer.
- Perbaikan tampilan overview mitra agar menampilkan pesanan terbaru dari semua status (bukan hanya pending) dan sinkronisasi saldo dengan ringkasan total.
- Perbaikan berbagai bug pada halaman profil aplikasi Android.

### Removed
- Menghapus opsi login sosial (Google/Facebook) serta kolom `alamat_kost` dari halaman Register.
- Menghapus panel branding sisi kiri dan kartu statistik (stats cards) dari desain halaman Login/Register untuk tata letak yang lebih sederhana.