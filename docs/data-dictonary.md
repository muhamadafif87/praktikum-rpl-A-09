# Data Dictionary

Dokumen ini berisikan detail teknis terkait entitas data yang digunakan dalam platform KostHub. Di dalamnya terdapat 3 entitas utama yang masing-masing memiliki peran dalam ekosistem platform:
* **Admin (Developer)**: Bertanggung jawab penuh atas manajemen sistem, verifikasi mitra baru, pengawasan kualitas layanan, dan pemantauan statistik penggunaan.
* **Mitra Layanan**: Pelaku usaha seperti laundry, depo air minum, cleaning service, yang menyediakan jasa dan mengelola katalog layanan yang ditawarkan.
* **Users(Penghuni Kost)**: Konsumen akhir yang mencari layanan, melakukan pemesanan. melakukan pembayaran melalui berbagai metode pembayaran, dan memberikan penilaian kualitas layanan mitra.

Berikut adalah daftar tabel yang akan diimplementasikan:

## users
*   Nama kolom:id_user
    Tipe data:integer
    Constraint:primary key, unique
    Keterangan:ID unik pengguna

*   Nama kolom:nama_lengkap
    Tipe data:varchar
    Constraint:not null
    Keterangan:nama lengkap user

*   Nama kolom:email
    Tipe data:varchar
    Constraint:unique, not null
    Keterangan:email untuk login

*   Nama kolom:password
    Tipe data:varchar
    Constraint:not null
    Keterangan:password user yang dihashing

*   Nama kolom:nomor_telepon
    Tipe data:varchar
    Constraint:unique, not null
    Keterangan:nomor telepon user

*   Nama kolom:alamat_kost
    Tipe data:text
    Constraint:not null
    Keterangan:lokasi spesifik pengiriman/penjemputan

*   Nama kolom:created_at
    Tipe data:timestamp
    Constraint: -
    Keterangan:waktu pendaftaran akun
----------------------------------------------------------------------
## admin
*   Nama kolom:id_admin
    Tipe data:integer
    Constraint:primary key, unique
    Keterangan:ID unik admin

*   Nama kolom:nama_admin
    Tipe data:varchar
    Constraint:not null
    Keterangan:Nama admin

*   Nama kolom:email
    Tipe data:varchar
    Constraint:unique, not null
    Keterangan:email admin

*   Nama kolom:password
    Tipe data:varchar
    Constraint:not null
    Keterangan:password yang dihashing

*   Nama kolom:nomor_telepon
    Tipe data:varchar
    Constraint:not null, unique
    Keterangan:nomor telepon admin

*   Nama kolom:created_at
    Tipe data:timestamp
    Constraint:-
    Keterangan:waktu pembuatan akun admin
----------------------------------------------------------------------
## mitra
*   Nama kolom:id_mitra
    Tipe data:integer
    Constraint:primary key, unique
    Keterangan:ID unik mitra

*   Nama kolom:nama_mitra
    Tipe data:varchar
    Constraint:not null
    Keterangan:Nama usaha mitra

*   Nama kolom:jenis_jasa
    Tipe data:varchar
    Constraint:not null
    Keterangan:jenis jasa yang ditawarkan mitra

*   Nama kolom:alamat_mitra
    Tipe data:text
    Constraint:not null
    Keterangan:lokasi tempat usaha mitra

*   Nama kolom:status_verifikasi
    Tipe data:boolean
    Constraint:default[0]
    Keterangan:status verifikasi yang diberikan oleh admin

*   Nama kolom:id_admin
    Tipe data:integer
    Constraint:-
    Keterangan:id admin yang memberikan verifikasi mitra

*   Nama kolom:verified_at
    Tipe data:timestamp
    Constraint:-
    Keterangan:waktu mitra diverifikasi oleh admin
----------------------------------------------------------------------
## layanan
*   Nama kolom:id_layanan
    Tipe data:integer
    Constraint:primary key, unique
    Keterangan:ID unik layanan

*   Nama kolom:id_mitra
    Tipe data:integer
    Constraint:not null
    Keterangan:foreign key ke tabel mitra

*   Nama kolom:nama_layanan
    Tipe data:varchar
    Constraint:not null
    Keterangan:nama layanan yang ditawarkan mitra

*   Nama kolom:harga
    Tipe data:decimal
    Constraint:not null
    Keterangan:harga per unit/kg/jam

*   Nama kolom:satuan
    Tipe data:varchar
    Constraint:not null
    Keterangan:kg/jam/unit
----------------------------------------------------------------------
## pesanan
*   Nama kolom:id_pesanan
    Tipe data:integer
    Constraint:primary key, unique
    Keterangan:ID unik pesanan

*   Nama kolom:id_user
    Tipe data:integer
    Constraint:not null
    Keterangan:id user yang melakukan pemesanan

*   Nama kolom:id_mitra
    Tipe data:integer
    Constraint:not null
    Keterangan:id mitra yang menerima pesanan

*   Nama kolom:id_layanan
    Tipe data:integer
    Constraint:not null
    Keterangan:id layanan yang dipilih

*   Nama kolom:total_bayar
    Tipe data:decimal
    Constraint:not null
    Keterangan:total harga setelah kalkulasi

*   Nama kolom:status_pesanan
    Tipe data:enum ['pending', 'diproses', 'selesai', 'dibatalkan']
    Constraint:default['pending']
    Keterangan:status dari pesanan

*   Nama kolom:status_pembayaran
    Tipe data:enum ['belum_bayar', 'menunggu_verifikasi', 'sudah_bayar']
    Constraint:default['belum_bayar']
    Keterangan:status pembayaran dari pesanan

*   Nama kolom:tgl_pesan
    Tipe data:timestamp
    Constraint:-
    Keterangan:waktu pesanan dibuat
----------------------------------------------------------------------
## ulasan
*   Nama kolom:id_ulasan
    Tipe data:integer
    Constraint:primary key, unique
    Keterangan:ID unik ulasan

*   Nama kolom:id_pesanan
    Tipe data:integer
    Constraint:unique
    Keterangan:foreign key ke tabel pesanan->merujuk ke transaksi pesanan secara spesifik

*   Nama kolom:rating
    Tipe data:integer
    Constraint:not null
    Keterangan:skor bintang->penilaian terhadap kualitas layanan

*   Nama kolom:komentar
    Tipe data:text
    Constraint:-
    Keterangan:catatan/ulasan dari pelanggan(user)

*   Nama kolom:created_at
    Tipe data:timestamp
    Constraint:-
    Keterangan:waktu ulasan dibuat
----------------------------------------------------------------------
## pembayaran
*   Nama kolom:id_pembayaran
    Tipe data:integer
    Constraint:primary key, unique
    Keterangan:ID unik transaksi pembayaran

*   Nama kolom:id_pesanan
    Tipe data:integer
    Constraint:unique
    Keterangan:foreign key ke tabel pesanan->merujuk pada pesanan secara spesifik

*   Nama kolom:metode_pembayaran
    Tipe data:enum ['cod', 'transfer_bank','qris', 'e-wallet']
    Constraint:default['cod']
    Keterangan:metode yang dilakukan untuk pembayaran

*   Nama kolom:jumlah_bayar
    Tipe data:decimal
    Constraint:not null
    Keterangan:nominal yang harus dibayarkan

*   Nama kolom:status_pembayaran
    Tipe data:enum ['pending', 'lunas', 'gagal', 'refund']
    Constraint:default['pending']
    Keterangan:status dari transaksi pembayaran

*   Nama kolom:bukti_pembayaran
    Tipe data:varchar
    Constraint:-
    Keterangan:nama file/url gambar (untuk transfer bank manual)

*   Nama kolom:id_transaksi
    Tipe data:varchar
    Constraint:-
    Keterangan:ID reference dari payment gateway yang digunakan

*   Nama kolom:tgl_bayar
    Tipe data:timestamp
    Constraint:-
    Keterangan:waktu transaksi dilakukan