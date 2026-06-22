package com.rpl.kosthub.data.model

import com.google.gson.annotations.SerializedName

data class UpdateProfileRequest(
    @SerializedName("nama_lengkap") val namaLengkap: String,
    @SerializedName("nomor_telepon") val noTelepon: String,
    @SerializedName("alamat_kost") val alamat: String,
    @SerializedName("latitude") val latitude: Double?,
    @SerializedName("longitude") val longitude: Double?,
    @SerializedName("address_detail") val addressDetail: String? = null
)
