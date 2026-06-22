package com.rpl.kosthub.data.remote

import com.rpl.kosthub.data.model.TerpopulerResponse
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Query

interface ApiService {
    @GET("landing-page/terpopuler")
    suspend fun getLayananTerpopuler(): TerpopulerResponse

    @GET("landing-page/galon-gas")
    suspend fun getGasGalon(
        @Query("lat") lat: Double? = null,
        @Query("lng") lng: Double? = null
    ): TerpopulerResponse

    @GET("landing-page/laundry-express")
    suspend fun getLaundry(
        @Query("lat") lat: Double? = null,
        @Query("lng") lng: Double? = null
    ): TerpopulerResponse

    @GET("landing-page/daily-cleaning")
    suspend fun getCleaning(
        @Query("lat") lat: Double? = null,
        @Query("lng") lng: Double? = null
    ): TerpopulerResponse

    @GET("auth/me")
    suspend fun getProfile(@Header("Authorization") token: String): com.rpl.kosthub.data.model.ProfileResponse

    @retrofit2.http.PUT("auth/me")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @retrofit2.http.Body payload: com.rpl.kosthub.data.model.UpdateProfileRequest
    ): com.rpl.kosthub.data.model.ProfileResponse

    @retrofit2.http.POST("auth/login")
    suspend fun login(@retrofit2.http.Body payload: com.rpl.kosthub.data.model.LoginRequest): com.rpl.kosthub.data.model.AuthResponse

    @retrofit2.http.POST("auth/register")
    suspend fun register(@retrofit2.http.Body payload: com.rpl.kosthub.data.model.RegisterRequest): com.rpl.kosthub.data.model.AuthResponse
}
