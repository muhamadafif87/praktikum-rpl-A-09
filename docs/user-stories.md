# User Stories - KostHub

Dokumen ini berisi identifikasi aktor dan daftar *user stories* untuk platform KostHub, lengkap dengan *Acceptance Criteria* menggunakan format **Given-When-Then**.

## 1. Identifikasi Aktor
| No | Aktor | Deskripsi |
|:---|:---|:---|
| 1 | **Customer** | Penghuni kos yang mencari dan memesan layanan jasa. |
| 2 | **Provider** | Penyedia jasa/mitra yang menawarkan layanan di platform. |
| 3 | **Admin** | Pengelola sistem yang memverifikasi mitra dan memantau transaksi. |

---

## 2. Daftar User Stories

### US01: Pemesanan Jasa (Customer)
* **Story:** Sebagai Customer, saya ingin memesan layanan melalui aplikasi, sehingga saya tidak perlu pergi ke luar kos untuk mencari layanan jasa.
* **Acceptance Criteria:**
    * **Given:** Customer mengakses halaman detail layanan Mitra.
    * **When:** Customer menekan tombol "Pesan" pada layanan yang dituju dan mengonfirmasi lokasi kos.
    * **Then:** Sistem membuat ID pesanan dan mengirimkan notifikasi kepada Provider.

### US02: Pencarian Kategori (Customer)
* **Story:** Sebagai Customer, saya ingin memfilter jasa berdasarkan kategori, sehingga saya dapat menemukan layanan yang spesifik sesuai kebutuhan saya (misal: Laundry saja) dengan cepat.
* **Acceptance Criteria:**
    * **Given:** Customer berada di dashboard utama.
    * **When:** Customer memilih filter kategori "Air Minum".
    * **Then:** Sistem hanya menampilkan daftar Provider yang menyediakan layanan galon/air minum.

### US03: Manajemen Ketersediaan (Provider)
* **Story:** Sebagai Provider, saya ingin mengatur status operasional (Buka/Tutup), sehingga saya tidak mendapatkan pesanan saat sedang libur atau kapasitas penuh.
* **Acceptance Criteria:**
    * **Given:** Provider berada di halaman profil jasa.
    * **When:** Provider mengubah status menjadi "Tutup".
    * **Then:** Nama jasa Provider tersebut otomatis hilang dari daftar pencarian Customer.

### US04: Konfirmasi Pesanan (Provider)
* **Story:** Sebagai Provider, saya ingin menerima atau menolak pesanan yang masuk, sehingga saya dapat memastikan kesiapan armada/petugas sebelum bekerja.
* **Acceptance Criteria:**
    * **Given:** Provider melihat daftar "Pesanan Masuk".
    * **When:** Provider menekan tombol "Terima".
    * **Then:** Status pesanan di sisi Customer berubah menjadi "Sedang Diproses".

### US05: Verifikasi Pendaftaran Mitra (Admin)
* **Story:** Sebagai Admin, saya ingin memverifikasi dokumen pendaftaran mitra baru, agar standar kualitas dan keamanan jasa di KostHub tetap terjaga.
* **Acceptance Criteria:**
    * **Given:** Admin berada di panel "Pending Verification".
    * **When:** Admin menekan tombol "Approve" setelah mengecek data Mitra.
    * **Then:** Akun Provider tersebut aktif dan bisa mulai menerima pesanan dari Customer.

### US06: Monitoring Transaksi (Admin)
* **Story:** Sebagai Admin, saya ingin melihat seluruh transaksi yang sedang berjalan, agar saya bisa melakukan intervensi jika terjadi kendala antara Customer dan Provider.
* **Acceptance Criteria:**
    * **Given:** Admin membuka menu "Global Transaction".
    * **When:** Admin mencari berdasarkan ID Pesanan.
    * **Then:** Sistem menampilkan detail status, nama Customer, dan Provider yang bertanggung jawab.

### US07: Update Status Pekerjaan (Provider)
* **Story:** Sebagai Provider, saya ingin memperbarui status pesanan menjadi "Selesai", agar sistem dapat memproses penyelesaian transaksi.
* **Acceptance Criteria:**
    * **Given:** Pesanan sedang dalam status "Diproses".
    * **When:** Provider menekan tombol "Selesaikan".
    * **Then:** Customer menerima notifikasi bahwa layanan telah usai dan diminta memberikan rating.

### US08: Sistem Rating (Customer)
* **Story:** Sebagai Customer, saya ingin memberikan ulasan setelah layanan selesai, agar pengguna lain mengetahui kualitas kerja mitra tersebut.
* **Acceptance Criteria:**
    * **Given:** Pesanan sudah masuk status "Selesai".
    * **When:** Customer mengirimkan bintang dan komentar.
    * **Then:** Rating rata-rata pada profil Mitra otomatis terupdate di halaman publik.