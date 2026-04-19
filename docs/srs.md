# Software Requirements Specification (SRS) - KostHub

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan spesifikasi kebutuhan perangkat lunak untuk platform **KostHub**. Tujuannya adalah memberikan gambaran teknis dan fungsional yang jelas bagi tim pengembang dalam membangun sistem *on-demand service* untuk penghuni kos.

### 1.2 Ruang Lingkup
KostHub adalah platform layanan harian berbasis B2B2C yang menghubungkan penghuni kos dengan mitra penyedia jasa seperti *laundry*, isi ulang galon, dan *cleaning service*. Sistem mencakup proses pendaftaran pengguna/mitra, pemesanan layanan, hingga monitoring status pengerjaan secara berkala.

### 1.3 Definisi dan Akronim
* **KostHub**: Nama platform aplikasi.
* **Customer**: Penghuni kos yang memesan layanan.
* **Provider (Mitra)**: Bisnis lokal yang menyediakan jasa harian.
* **FR (*Functional Requirement*)**: Fungsi utama yang harus ada di sistem.
* **NFR (*Non-Functional Requirement*)**: Batasan atau kualitas teknis sistem.

---

## 2. Deskripsi Umum

### 2.1 Perspektif Produk
KostHub dirancang sebagai platform independen yang beroperasi pada lingkungan *web responsive* atau aplikasi *mobile*. Sistem ini bertindak sebagai perantara transaksi antara kebutuhan mahasiswa (anak kos) dan penyedia jasa di sekitar kampus.

### 2.2 Fungsi Utama
* Pendaftaran dan manajemen akun (User & Mitra).
* Katalog layanan (Laundry, Galon, Cleaning).
* Manajemen pesanan dan penjadwalan.
* Pelacakan status layanan.
* Dashboard monitoring untuk Admin.

### 2.3 Karakteristik Pengguna
* **Customer**: Mahasiswa atau anak kos yang membutuhkan efisiensi waktu dan kemudahan transaksi lewat *gadget*.
* **Provider**: Pemilik bisnis lokal yang membutuhkan digitalisasi untuk mengelola orderan masuk.

### 2.4 Batasan Sistem
* Membutuhkan koneksi internet untuk sinkronisasi data.
* Cakupan wilayah awal difokuskan pada area sekitar Universitas Sebelas Maret (Solo).
* Sistem pembayaran belum mencakup integrasi otomatis dengan penyedia pihak ketiga secara spesifik.

---

## 3. Kebutuhan Fungsional (FR)

| ID | Deskripsi Kebutuhan | Prioritas | Referensi |
| :--- | :--- | :--- | :--- |
| **FR-01** | Sistem menyediakan fitur registrasi dan login bagi Customer dan Provider dengan validasi kredensial. | High | US-01 |
| **FR-02** | Sistem menampilkan daftar mitra jasa berdasarkan kategori (Laundry, Galon, Cleaning) beserta harga. | High | US-02 |
| **FR-03** | Sistem memungkinkan Customer melakukan pemesanan dengan menentukan titik lokasi kos dan waktu jasa. | High | US-03 |
| **FR-04** | Sistem menyediakan dashboard bagi Provider untuk menerima atau menolak pesanan yang masuk. | High | US-04 |
| **FR-05** | Sistem menampilkan status pesanan secara real-time (contoh: Penjemputan, Proses, Selesai). | Medium | US-05 |
| **FR-06** | Sistem memungkinkan Admin (Developer) untuk memonitor dan melakukan approval pendaftaran Provider baru. | Medium | US-06 |

---

## 4. Kebutuhan Non-Fungsional (NFR)

| Aspek | Deskripsi Kebutuhan |
| :--- | :--- |
| **Performance** | Waktu *load* halaman < 3 detik pada jaringan 4G untuk akses status pesanan secara *real-time*. |
| **Security** | Seluruh transmisi data pesanan dienkripsi menggunakan protokol TLS/SSL. |
| **Usability** | Antarmuka bersifat *responsive* untuk berbagai perangkat (Desktop & Smartphone min. lebar 375px). |
| **Reliability** | Ketersediaan sistem (*uptime*) minimal 99% per bulan dengan batas *downtime* maks. 7 jam/bulan. |
| **Maintainability** | Penulisan kode wajib mengikuti konvensi **PascalCase** untuk penamaan variabel (gabungan kata dengan kapital di setiap awal kata). |

---

## 5. Catatan dan Asumsi

1.  **Perangkat**: Customer dan Provider diasumsikan memiliki perangkat (smartphone/PC) dan koneksi internet yang stabil untuk menjalankan aplikasi.
2.  **Manajemen**: Proses pengajuan pendaftaran mitra jasa (*Provider*) beserta persetujuannya dipantau langsung oleh Admin melalui dashboard internal.
3.  **Pembayaran**: Detail teknis mengenai integrasi *payment gateway* (e-wallet/bank) belum diatur secara spesifik pada fase ini dan diasumsikan menggunakan metode manual/COD sementara waktu.