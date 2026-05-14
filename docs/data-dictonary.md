# Data Dictionary

Dokumen ini berisikan detail teknis terkait entitas data yang digunakan dalam platform KostHub. Di dalamnya terdapat 3 entitas utama yang masing-masing memiliki peran dalam ekosistem platform:
* **Admin (Developer)**: Bertanggung jawab penuh atas manajemen sistem, verifikasi mitra baru, pengawasan kualitas layanan, dan pemantauan statistik penggunaan.
* **Mitra Layanan**: Pelaku usaha seperti laundry, depo air minum, cleaning service, yang menyediakan jasa dan mengelola katalog layanan yang ditawarkan.
* **Users(Penghuni Kost)**: Konsumen akhir yang mencari layanan, melakukan pemesanan. melakukan pembayaran melalui berbagai metode pembayaran, dan memberikan penilaian kualitas layanan mitra.

Berikut adalah daftar tabel yang akan diimplementasikan:

## users
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id_user | integer | primary key, unique | ID unik pengguna |
| nama_lengkap | varchar | not null | Nama lengkap user |
| email | varchar | unique, not null | Email untuk login |
| password | varchar | not null | Password user (hashed) |
| nomor_telepon | varchar | unique, not null | Nomor telepon user |
| alamat_kost | text | not null | Lokasi kost / alamat pengiriman |
| created_at | timestamp | - | Waktu pendaftaran akun |
----------------------------------------------------------------------
## admin
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id_admin | integer | primary key, unique | ID unik admin |
| nama_admin | varchar | not null | Nama admin |
| email | varchar | unique, not null | Email admin |
| password | varchar | not null | Password admin (hashed) |
| nomor_telepon | varchar | unique, not null | Nomor telepon admin |
| created_at | timestamp | - | Waktu pembuatan akun admin |
----------------------------------------------------------------------
## mitra
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id_mitra | integer | primary key, unique | ID unik mitra |
| nama_mitra | varchar | not null | Nama usaha mitra |
| jenis_jasa | varchar | - | Jenis jasa yang ditawarkan |
| alamat_mitra | text | not null | Lokasi usaha mitra |
| status_verifikasi | boolean | default: 0 | Status verifikasi oleh admin |
| id_admin | integer | - | ID admin yang memverifikasi |
| nomor_telepon | varchar | - | Nomor telepon mitra |
| verified_at | timestamp | - | Waktu mitra diverifikasi |
----------------------------------------------------------------------
## mitra_login_access
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id_mitra_user | integer | primary key | ID unik akun login mitra |
| id_mitra | integer | not null | Foreign key ke tabel mitra |
| email | varchar | not null, unique | Email login mitra |
| password | varchar | not null | Password login mitra (hashed) |
----------------------------------------------------------------------
## layanan
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id_layanan | integer | primary key, unique | ID unik layanan |
| id_mitra | integer | not null | Foreign key ke tabel mitra |
| nama_layanan | varchar | not null | Nama layanan |
| harga | decimal | not null | Harga layanan |
| satuan | varchar | not null | Satuan (kg/jam/unit) |
----------------------------------------------------------------------
## pesanan
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id_pesanan | integer | primary key, unique | ID unik pesanan |
| id_user | integer | not null | Foreign key ke tabel users |
| id_mitra | integer | not null | Foreign key ke tabel mitra |
| status_pesanan | enum | default: 'pending' | Status pesanan |
| tgl_pesan | timestamp | - | Waktu pesanan dibuat |
----------------------------------------------------------------------
## detail_pesanan
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id_detail_pesanan | integer | primary key | ID unik detail pesanan |
| id_layanan | integer | not null | Foreign key ke tabel layanan |
| id_pesanan | integer | not null | Foreign key ke tabel pesanan |
| jumlah | integer | not null | Jumlah item layanan |
| harga | decimal | not null | Harga per item |
| subtotal | decimal | not null | Total harga item (jumlah × harga) |
----------------------------------------------------------------------
## ulasan
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id_ulasan | integer | primary key, unique | ID unik ulasan |
| id_pesanan | integer | unique | Foreign key ke tabel pesanan |
| rating | integer | not null | Skor rating (bintang) |
| komentar | text | - | Komentar ulasan |
| created_at | timestamp | - | Waktu ulasan dibuat |
----------------------------------------------------------------------
## pembayaran
| Nama Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id_pembayaran | integer | primary key, unique | ID unik pembayaran |
| id_pesanan | integer | unique | Foreign key ke tabel pesanan |
| metode_pembayaran | enum | default: 'cod' | Metode pembayaran |
| jumlah_bayar | decimal | not null | Nominal pembayaran |
| status_pembayaran | enum | default: 'pending' | Status pembayaran |
| bukti_pembayaran | varchar | - | File/URL bukti pembayaran |
| id_transaksi | varchar | - | ID transaksi dari gateway |
| tgl_bayar | timestamp | - | Waktu pembayaran dilakukan |