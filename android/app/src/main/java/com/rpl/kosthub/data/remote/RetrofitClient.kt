package com.rpl.kosthub.data.remote

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // Updated to current local network IP for physical device testing
    private const val BASE_URL = "https://praktikum-rpl-a-09-production.up.railway.app/api/v1/"

    val instance: ApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        retrofit.create(ApiService::class.java)
    }

    val mapboxInstance: MapboxService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl("https://api.mapbox.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        retrofit.create(MapboxService::class.java)
    }
}
