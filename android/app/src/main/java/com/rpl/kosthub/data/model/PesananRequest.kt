package com.rpl.kosthub.data.model

import com.google.gson.annotations.SerializedName

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

data class ItemLayanan(
    @SerializedName("idLayanan") val idLayanan: String,
    @SerializedName("qty")       val qty: Int
)

data class JadwalLayanan(
    @SerializedName("jam")     val jam: String,
    @SerializedName("tanggal") val tanggal: String? = null
)

data class EstimasiPesanan(
    @SerializedName("subtotal")         val subtotal: Int,
    @SerializedName("biaya_ongkir")     val biayaOngkir: Int = 0,
    @SerializedName("total_pembayaran") val totalPembayaran: Int,
    @SerializedName("beli_baru")        val beliBaru: Int = 0
)

// ---------------------------------------------------------------------------
// BiayaTambahan — struktur berbeda per tipe layanan
// ---------------------------------------------------------------------------

/** Laundry: { "durasi_pengerjaan": { "biaya": 15000, "type": "express" } } */
data class DurasiPengerjaan(
    @SerializedName("biaya") val biaya: Int,
    @SerializedName("type")  val type: String   // "kilat" | "express" | "reguler"
)

data class BiayaTambahanLaundry(
    @SerializedName("durasi_pengerjaan") val durasiPengerjaan: DurasiPengerjaan
)

/**
 * Galon/Gas: array of { "idLayanan": "7", "beli_baru": 50000 }
 * Gunakan List<BiayaTambahanGalonItem> sebagai biayaTambahan.
 */
data class BiayaTambahanGalonItem(
    @SerializedName("idLayanan") val idLayanan: String,
    @SerializedName("beli_baru") val beliBaru: Int
)

/**
 * Daily Cleaning tidak pakai biayaTambahan,
 * melainkan biayaTambahanAlat: Map<String, Int>
 * Contoh: { "Pel": 7000, "Sapu": 5000, "Vacum Cleaner": 15000 }
 */

// ---------------------------------------------------------------------------
// Create Pesanan Request — satu per tipe layanan
// ---------------------------------------------------------------------------

data class CreatePesananLaundryRequest(
    @SerializedName("idMitra")           val idMitra: String,
    @SerializedName("typeLayanan")       val typeLayanan: String = "laundry",
    @SerializedName("items")             val items: List<ItemLayanan>,
    @SerializedName("jarakOngkir")       val jarakOngkir: Int,
    @SerializedName("jadwal_layanan")    val jadwalLayanan: List<JadwalLayanan>,
    @SerializedName("biayaTambahan")     val biayaTambahan: BiayaTambahanLaundry,
    @SerializedName("estimasi")          val estimasi: EstimasiPesanan,
    @SerializedName("catatanPengiriman") val catatanPengiriman: String? = null
)

data class CreatePesananGalonGasRequest(
    @SerializedName("idMitra")           val idMitra: String,
    @SerializedName("typeLayanan")       val typeLayanan: String = "galon_gas",
    @SerializedName("items")             val items: List<ItemLayanan>,
    @SerializedName("jarakOngkir")       val jarakOngkir: Int,
    @SerializedName("jadwal_layanan")    val jadwalLayanan: List<JadwalLayanan>,
    @SerializedName("biayaTambahan")     val biayaTambahan: List<BiayaTambahanGalonItem>,
    @SerializedName("estimasi")          val estimasi: EstimasiPesanan,
    @SerializedName("catatanPengiriman") val catatanPengiriman: String? = null
)

data class CreatePesananDailyCleaningRequest(
    @SerializedName("idMitra")             val idMitra: String,
    @SerializedName("typeLayanan")         val typeLayanan: String = "daily_cleaning",
    @SerializedName("items")              val items: List<ItemLayanan>,
    @SerializedName("jarakOngkir")         val jarakOngkir: Int,
    @SerializedName("jadwal_layanan")      val jadwalLayanan: List<JadwalLayanan>,
    @SerializedName("biayaTambahanAlat")   val biayaTambahanAlat: Map<String, Int> = emptyMap(),
    @SerializedName("estimasi")            val estimasi: EstimasiPesanan,
    @SerializedName("catatanPengiriman")   val catatanPengiriman: String? = null
)

// ---------------------------------------------------------------------------
// Estimate Fee Request — sesuai estimatepesananfee-api.md
// ---------------------------------------------------------------------------

data class EstimateFeePesananRequest(
    @SerializedName("idMitra")           val idMitra: String,
    @SerializedName("typeLayanan")       val typeLayanan: String,
    // Backend GenerateFeeRequest.php memvalidasi field 'items', bukan 'layanan' (inkonsistensi dengan docs)
    @SerializedName("items")             val layanan: List<ItemLayanan>,
    @SerializedName("jarakOngkir")       val jarakOngkir: Int,
    /** Laundry   → BiayaTambahanLaundry
     *  Galon/Gas → List<BiayaTambahanGalonItem>
     *  Daily     → null (gunakan biayaTambahanAlat) */
    @SerializedName("biayaTambahan")     val biayaTambahan: Any? = null,
    /** Daily Cleaning only */
    @SerializedName("biayaTambahanAlat") val biayaTambahanAlat: Map<String, Int>? = null
)

// ---------------------------------------------------------------------------
// Seeding Detail Pesanan Request
// ---------------------------------------------------------------------------

data class SeedingDetailPesananRequest(
    @SerializedName("type_layanan") val typeLayanan: String,
    @SerializedName("id_mitra")     val idMitra: Int
)

// ---------------------------------------------------------------------------
// Cancel / Action Request
// ---------------------------------------------------------------------------

data class CancelPesananRequest(
    @SerializedName("idUniquePesanan") val idUniquePesanan: String
)

data class AddUlasanRequest(
    @SerializedName("rating")   val rating: Int,
    @SerializedName("komentar") val komentar: String
)

// ---------------------------------------------------------------------------
// Riwayat filter query (dikirim via @Query, bukan body)
// ---------------------------------------------------------------------------

data class RiwayatFilterParams(
    val status: String? = null,
    val tglDari: String? = null,
    val tglSampai: String? = null,
    val perPage: Int? = null
)
