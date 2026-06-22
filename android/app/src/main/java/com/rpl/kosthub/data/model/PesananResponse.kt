package com.rpl.kosthub.data.model

import com.google.gson.annotations.SerializedName

// ---------------------------------------------------------------------------
// Create Pesanan Response
// ---------------------------------------------------------------------------

data class CreatePesananResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data")    val data: PesananCreatedData?
)

data class PesananCreatedData(
    @SerializedName("id_pesanan")        val idPesanan: Int,
    @SerializedName("id_unique_pesanan") val idUniquePesanan: String,
    @SerializedName("status_pesanan")    val statusPesanan: String,
    @SerializedName("detail_layanan")    val detailLayanan: List<DetailLayananItem>,
    @SerializedName("ringkasan_biaya")   val ringkasanBiaya: RingkasanBiayaCreated,
    @SerializedName("catatan_pengiriman") val catatanPengiriman: String?
)

data class DetailLayananItem(
    @SerializedName("id_detail_pesanan") val idDetailPesanan: Int,
    @SerializedName("nama_layanan")      val namaLayanan: String,
    @SerializedName("satuan")            val satuan: String,
    @SerializedName("harga")             val harga: String,
    @SerializedName("jumlah")            val jumlah: Int,
    @SerializedName("subtotal")          val subtotal: Int
)

data class RingkasanBiayaCreated(
    @SerializedName("subtotal")              val subtotal: Int,
    @SerializedName("biaya_ongkir")          val biayaOngkir: Int,
    @SerializedName("biaya_tambahan_durasi") val biayaTambahanDurasi: Int,
    @SerializedName("durasi_pengerjaan")     val durasiPengerjaan: String,
    @SerializedName("biaya_aplikasi")        val biayaAplikasi: Int,
    @SerializedName("total_pembayaran")      val totalPembayaran: Int
)

// ---------------------------------------------------------------------------
// Cancel Pesanan Response
// ---------------------------------------------------------------------------

data class CancelPesananResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data")    val data: CancelPesananData?
)

data class CancelPesananData(
    @SerializedName("id_unique_pesanan") val idUniquePesanan: String,
    @SerializedName("status_pesanan")    val statusPesanan: String
)

// ---------------------------------------------------------------------------
// Riwayat Pesanan Response
// ---------------------------------------------------------------------------

data class RiwayatPesananResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data")    val data: List<RiwayatPesananItem>,
    @SerializedName("meta")    val meta: PaginationMeta?
)

data class RiwayatPesananItem(
    @SerializedName("id_unique_pesanan") val idUniquePesanan: String,
    @SerializedName("status_pesanan")    val statusPesanan: String,
    @SerializedName("tgl_pesanan")       val tglPesanan: String,
    @SerializedName("mitra")            val mitra: MitraRingkas,
    @SerializedName("user")             val user: UserRingkas,
    @SerializedName("detail_layanan")   val detailLayanan: List<DetailLayananItem>,
    @SerializedName("total_pembayaran") val totalPembayaran: Int?
)

data class MitraRingkas(
    @SerializedName("nama_mitra")  val namaMitra: String,
    @SerializedName("jenis_jasa")  val jenisJasa: String
)

data class UserRingkas(
    @SerializedName("nama_lengkap")    val namaLengkap: String,
    @SerializedName("nomor_telepon")   val nomorTelepon: String
)

data class PaginationMeta(
    @SerializedName("current_page") val currentPage: Int,
    @SerializedName("last_page")    val lastPage: Int,
    @SerializedName("per_page")     val perPage: Int,
    @SerializedName("total")        val total: Int
)

// ---------------------------------------------------------------------------
// Detail Pesanan Response
// ---------------------------------------------------------------------------

data class DetailPesananResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data")    val data: DetailPesananData?
)

data class DetailPesananData(
    @SerializedName("id_pesanan")        val idPesanan: Int,
    @SerializedName("id_unique_pesanan") val idUniquePesanan: String,
    @SerializedName("status_pesanan")    val statusPesanan: String,
    @SerializedName("tgl_pesanan")       val tglPesanan: String,
    @SerializedName("mitra")            val mitra: MitraDetail,
    @SerializedName("user")             val user: UserDetail,
    @SerializedName("detail_layanan")   val detailLayanan: List<DetailLayananItem>,
    @SerializedName("ringkasan_biaya")  val ringkasanBiaya: RingkasanBiayaDetail,
    @SerializedName("catatan_pengiriman") val catatanPengiriman: String?,
    @SerializedName("pembayaran")       val pembayaran: PembayaranData?,
    @SerializedName("ulasan")           val ulasan: UlasanData?
)

data class MitraDetail(
    @SerializedName("id_mitra")        val idMitra: Int,
    @SerializedName("nama_mitra")      val namaMitra: String,
    @SerializedName("jenis_jasa")      val jenisJasa: String,
    @SerializedName("alamat_mitra")    val alamatMitra: String,
    @SerializedName("nomor_telepon")   val nomorTelepon: String
)

data class UserDetail(
    @SerializedName("id_user")         val idUser: Int,
    @SerializedName("nama_lengkap")    val namaLengkap: String,
    @SerializedName("nomor_telepon")   val nomorTelepon: String,
    @SerializedName("alamat_kost")     val alamatKost: String?
)

data class RingkasanBiayaDetail(
    @SerializedName("subtotal")              val subtotal: Int?,
    @SerializedName("biaya_ongkir")          val biayaOngkir: Int?,
    @SerializedName("biaya_aplikasi")        val biayaAplikasi: Int?,
    @SerializedName("biaya_tambahan_alat")   val biayaTambahanAlat: Int?,
    @SerializedName("total_pembayaran")      val totalPembayaran: Int?
)

data class PembayaranData(
    @SerializedName("status")          val status: String?,
    @SerializedName("metode")          val metode: String?,
    @SerializedName("tgl_pembayaran")  val tglPembayaran: String?
)

data class UlasanData(
    @SerializedName("id_ulasan")   val idUlasan: Int,
    @SerializedName("id_pesanan")  val idPesanan: Int,
    @SerializedName("rating")      val rating: Int,
    @SerializedName("komentar")    val komentar: String,
    @SerializedName("created_at")  val createdAt: String
)

// ---------------------------------------------------------------------------
// Estimate Fee Response
// ---------------------------------------------------------------------------

data class EstimateFeeResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data")    val data: EstimateFeeData?
)

data class EstimateFeeData(
    @SerializedName("type_layanan")   val typeLayanan: String,
    @SerializedName("detail_layanan") val detailLayanan: List<EstimateDetailLayanan>,
    @SerializedName("ringkasan")      val ringkasan: EstimateRingkasan,
    /** Daily Cleaning only */
    @SerializedName("biaya_tambahan_alat") val biayaTambahanAlat: Map<String, Int>?
)

data class EstimateDetailLayanan(
    @SerializedName("id_layanan")            val idLayanan: Int,
    @SerializedName("nama_layanan")          val namaLayanan: String,
    @SerializedName("qty")                   val qty: Int,
    @SerializedName("satuan")               val satuan: String,
    @SerializedName("harga_satuan")          val hargaSatuan: Int,
    @SerializedName("subtotal")              val subtotal: Int,
    // Galon/Gas
    @SerializedName("beli_baru_per_item")    val beliBaru: Int?,
    @SerializedName("total_beli_baru")       val totalBeliBaru: Int?,
    // Laundry
    @SerializedName("durasi_pengerjaan")     val durasiPengerjaan: Int?,
    @SerializedName("biaya_tambahan_durasi") val biayaTambahanDurasi: Int?
)

data class EstimateRingkasan(
    @SerializedName("subtotal")              val subtotal: Int,
    // Galon/Gas & Laundry
    @SerializedName("biaya_ongkir")          val biayaOngkir: Int?,
    // Daily Cleaning
    @SerializedName("biaya_transportasi")    val biayaTransportasi: Int?,
    @SerializedName("biaya_tambahan_alat")   val biayaTambahanAlat: Int?,
    @SerializedName("biaya_layanan_aplikasi") val biayaLayananAplikasi: Int,
    // Galon/Gas
    @SerializedName("total_beli_baru")       val totalBeliBaru: Int?,
    // Laundry
    @SerializedName("biaya_tambahan_durasi") val biayaTambahanDurasi: Int?,
    @SerializedName("total_pembayaran")      val totalPembayaran: Int
)

// ---------------------------------------------------------------------------
// Seeding Detail Pesanan Response — per tipe layanan
// ---------------------------------------------------------------------------

data class SeedingDetailPesananResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data")    val data: SeedingDetailData?
)

data class SeedingDetailData(
    @SerializedName("id_mitra")   val idMitra: Int,
    @SerializedName("nama_mitra") val namaMitra: String,
    @SerializedName("layanan")    val layanan: List<SeedingLayananItem>,

    // Laundry only
    @SerializedName("jenis_kain")           val jenisKain: List<String>?,
    @SerializedName("durasi_pengerjaan")    val durasiPengerjaan: Map<String, Int>?,
    @SerializedName("jadwal_penjemputan")   val jadwalPenjemputan: List<String>?,

    // Galon/Gas only
    @SerializedName("jadwal_pengiriman")    val jadwalPengiriman: List<String>?,

    // Daily Cleaning only
    @SerializedName("alat_pembersih_tambahan") val alatPembersihTambahan: Map<String, Int>?,
    @SerializedName("jadwal_pembersihan")      val jadwalPembersihan: List<String>?
)

data class SeedingLayananItem(
    @SerializedName("id_layanan")    val idLayanan: Int,
    @SerializedName("nama_layanan")  val namaLayanan: String,
    // Laundry & Daily Cleaning
    @SerializedName("harga_layanan") val hargaLayanan: String?,
    // Galon/Gas
    @SerializedName("harga_barang")  val hargaBarang: String?,
    @SerializedName("beli_baru")     val beliBaru: Int?
)

// ---------------------------------------------------------------------------
// Tambah Ulasan Response
// ---------------------------------------------------------------------------

data class TambahUlasanResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data")    val data: UlasanData?
)

// ---------------------------------------------------------------------------
// Selesai / Mock Payment Response (generic status update)
// ---------------------------------------------------------------------------

data class StatusPesananResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data")    val data: StatusPesananData?
)

data class StatusPesananData(
    @SerializedName("id_unique_pesanan") val idUniquePesanan: String,
    @SerializedName("status_pesanan")    val statusPesanan: String
)
