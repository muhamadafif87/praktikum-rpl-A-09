package com.rpl.kosthub.data.model

import com.google.gson.annotations.SerializedName

data class TerpopulerResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: List<Mitra>
)

data class Mitra(
    @SerializedName("id_mitra") val idMitra: Int,
    @SerializedName("nama_mitra") val namaMitra: String,
    @SerializedName("deskripsi") val deskripsi: String?,
    @SerializedName("profil_image") val profilImage: String?,
    @SerializedName("jenis_jasa") val jenisJasa: String,
    @SerializedName("lokasi_layanan") val lokasiLayanan: String?,
    @SerializedName("rating") val rating: Double,
    @SerializedName("jumlah_ulasan") val jumlahUlasan: Int,
    @SerializedName("layanan") val layanan: List<Layanan>
)

data class Layanan(
    @SerializedName("id_layanan") val idLayanan: Int,
    @SerializedName("nama_layanan") val namaLayanan: String,
    @SerializedName("harga_satuan") val hargaSatuan: Double,
    @SerializedName("satuan") val satuan: String
)
