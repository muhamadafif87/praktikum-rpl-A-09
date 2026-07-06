package com.rpl.kosthub.data.remote

import com.rpl.kosthub.data.model.TerpopulerResponse
import com.rpl.kosthub.data.model.RiwayatResponse
import com.rpl.kosthub.data.model.ActionResponse
import com.rpl.kosthub.data.model.UlasanRequest
import com.rpl.kosthub.data.model.UlasanSubmitResponse
import com.rpl.kosthub.data.model.SeedingDetailPesananRequest
import com.rpl.kosthub.data.model.SeedingDetailPesananResponse
import com.rpl.kosthub.data.model.EstimateFeePesananRequest
import com.rpl.kosthub.data.model.EstimateFeeResponse
import com.rpl.kosthub.data.model.CreatePesananLaundryRequest
import com.rpl.kosthub.data.model.CreatePesananGalonGasRequest
import com.rpl.kosthub.data.model.CreatePesananDailyCleaningRequest
import com.rpl.kosthub.data.model.CreatePesananResponse
import com.rpl.kosthub.data.model.DetailPesananResponse
import com.rpl.kosthub.data.model.StatusPesananResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
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

    @PUT("auth/me")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body payload: com.rpl.kosthub.data.model.UpdateProfileRequest
    ): com.rpl.kosthub.data.model.ProfileResponse

    @POST("auth/login")
    suspend fun login(@Body payload: com.rpl.kosthub.data.model.LoginRequest): com.rpl.kosthub.data.model.AuthResponse

    @POST("auth/register")
    suspend fun register(@Body payload: com.rpl.kosthub.data.model.RegisterRequest): com.rpl.kosthub.data.model.AuthResponse

    // ── Order History Endpoints ──────────────────────────────────────────

    @GET("landing-page/pesanan/riwayat")
    suspend fun getRiwayatPesanan(
        @Header("Authorization") token: String,
        @Query("status") status: String? = null,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 10
    ): RiwayatResponse

    @GET("landing-page/pesanan/{id}")
    suspend fun getDetailPesanan(
        @Header("Authorization") token: String,
        @Path("id") idUniquePesanan: String
    ): DetailPesananResponse

    @PATCH("landing-page/pesanan/{id}/cancel")
    suspend fun cancelPesanan(
        @Header("Authorization") token: String,
        @Path("id") idUniquePesanan: String
    ): ActionResponse

    @PATCH("landing-page/pesanan/{id}/selesai")
    suspend fun selesaikanPesanan(
        @Header("Authorization") token: String,
        @Path("id") idUniquePesanan: String
    ): ActionResponse

    @POST("landing-page/pesanan/{id}/ulasan")
    suspend fun tambahUlasan(
        @Header("Authorization") token: String,
        @Path("id") idUniquePesanan: String,
        @Body body: UlasanRequest
    ): UlasanSubmitResponse

    // -------------------------------------------------------------------------
    // Seeding Detail Pesanan (Protected)
    // -------------------------------------------------------------------------

    @POST("landing-page/laundry-express/detail-pesanan")
    suspend fun getSeedingDetailLaundry(
        @Header("Authorization") token: String,
        @Body payload: SeedingDetailPesananRequest
    ): SeedingDetailPesananResponse

    @POST("landing-page/galon-gas/detail-pesanan")
    suspend fun getSeedingDetailGalonGas(
        @Header("Authorization") token: String,
        @Body payload: SeedingDetailPesananRequest
    ): SeedingDetailPesananResponse

    @POST("landing-page/daily-cleaning/detail-pesanan")
    suspend fun getSeedingDetailDailyCleaning(
        @Header("Authorization") token: String,
        @Body payload: SeedingDetailPesananRequest
    ): SeedingDetailPesananResponse

    // -------------------------------------------------------------------------
    // Estimate Fee (Protected)
    // -------------------------------------------------------------------------

    @POST("landing-page/generate-fee-pesanan")
    suspend fun estimateFeePesanan(
        @Header("Authorization") token: String,
        @Body payload: EstimateFeePesananRequest
    ): EstimateFeeResponse

    // -------------------------------------------------------------------------
    // Create Pesanan (Protected)
    // -------------------------------------------------------------------------

    @POST("landing-page/pesanan")
    suspend fun createPesananLaundry(
        @Header("Authorization") token: String,
        @Body payload: CreatePesananLaundryRequest
    ): CreatePesananResponse

    @POST("landing-page/pesanan")
    suspend fun createPesananGalonGas(
        @Header("Authorization") token: String,
        @Body payload: CreatePesananGalonGasRequest
    ): CreatePesananResponse

    @POST("landing-page/pesanan")
    suspend fun createPesananDailyCleaning(
        @Header("Authorization") token: String,
        @Body payload: CreatePesananDailyCleaningRequest
    ): CreatePesananResponse

    // -------------------------------------------------------------------------
    // Mock Payment (Protected)
    // -------------------------------------------------------------------------

    @PATCH("landing-page/pesanan/{idUniquePesanan}/mock-payment")
    suspend fun mockPayment(
        @Header("Authorization") token: String,
        @Path("idUniquePesanan") idUniquePesanan: String
    ): StatusPesananResponse
}
