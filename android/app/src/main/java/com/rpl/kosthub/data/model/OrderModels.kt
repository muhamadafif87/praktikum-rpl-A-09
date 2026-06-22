package com.rpl.kosthub.data.model

import com.google.gson.annotations.SerializedName

// ── Riwayat Pesanan Response ────────────────────────────────────────────────

data class RiwayatResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: List<OrderItem>,
    @SerializedName("meta") val meta: RiwayatMeta?
)

data class RiwayatMeta(
    @SerializedName("current_page") val currentPage: Int,
    @SerializedName("last_page") val lastPage: Int,
    @SerializedName("per_page") val perPage: Int,
    @SerializedName("total") val total: Int
)

data class OrderItem(
    @SerializedName("id_unique_pesanan") val idUniquePesanan: String,
    @SerializedName("status_pesanan") val statusPesanan: String,
    @SerializedName("tgl_pesanan") val tglPesanan: String?,
    @SerializedName("mitra") val mitra: OrderMitra?,
    @SerializedName("detail_layanan") val detailLayanan: List<OrderDetail>,
    @SerializedName("total_pembayaran") val totalPembayaran: Double?,
    @SerializedName("ulasan") val ulasan: OrderUlasan?
)

data class OrderMitra(
    @SerializedName("nama_mitra") val namaMitra: String,
    @SerializedName("jenis_jasa") val jenisJasa: String?
)

data class OrderDetail(
    @SerializedName("nama_layanan") val namaLayanan: String,
    @SerializedName("jumlah") val jumlah: Int,
    @SerializedName("subtotal") val subtotal: Double
)

data class OrderUlasan(
    @SerializedName("rating") val rating: Int,
    @SerializedName("komentar") val komentar: String?
)

// ── Request & Action Responses ──────────────────────────────────────────────

data class UlasanRequest(
    @SerializedName("rating") val rating: Int,
    @SerializedName("komentar") val komentar: String?
)

data class UlasanSubmitResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: OrderUlasan?
)

data class ActionResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?
)
