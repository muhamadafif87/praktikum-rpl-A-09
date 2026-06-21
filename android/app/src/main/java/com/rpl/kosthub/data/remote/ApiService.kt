package com.rpl.kosthub.data.remote

import com.rpl.kosthub.data.model.TerpopulerResponse
import retrofit2.http.GET

interface ApiService {
    @GET("landing-page/terpopuler")
    suspend fun getLayananTerpopuler(): TerpopulerResponse

    @GET("landing-page/galon-gas")
    suspend fun getGasGalon(): TerpopulerResponse

    @GET("landing-page/laundry-express")
    suspend fun getLaundry(): TerpopulerResponse

    @GET("landing-page/daily-cleaning")
    suspend fun getCleaning(): TerpopulerResponse
}
