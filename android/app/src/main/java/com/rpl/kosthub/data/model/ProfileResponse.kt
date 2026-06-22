package com.rpl.kosthub.data.model

import com.google.gson.annotations.SerializedName

data class ProfileResponse(
    @SerializedName("success") val success: Boolean? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: User? = null
)

data class User(
    @SerializedName("id_user") val idUser: Int,
    @SerializedName("nama_lengkap") val namaLengkap: String,
    @SerializedName("email") val email: String,
    @SerializedName("nomor_telepon") val noTelepon: String?,
    @SerializedName("alamat_kost") val alamatKost: String?,
    @SerializedName("latitude") val latitude: Double?,
    @SerializedName("longitude") val longitude: Double?,
    @SerializedName("address_detail") val addressDetail: String?,
    @SerializedName("created_at") val createdAt: String?
) {
    val alamat: String?
        get() = addressDetail ?: alamatKost
}
