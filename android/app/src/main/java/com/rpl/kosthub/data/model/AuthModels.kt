package com.rpl.kosthub.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class RegisterRequest(
    @SerializedName("nama_lengkap") val namaLengkap: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("password_confirmation") val passwordConfirmation: String,
    @SerializedName("nomor_telepon") val nomorTelepon: String,
    @SerializedName("regist_as") val registAs: String = "user"
)

data class AuthResponse(
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: AuthData?
)

data class AuthData(
    @SerializedName("token") val token: String,
    @SerializedName("guard") val guard: String,
    @SerializedName("user") val user: User
)
