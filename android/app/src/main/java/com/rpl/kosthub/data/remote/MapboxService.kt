package com.rpl.kosthub.data.remote

import com.rpl.kosthub.data.model.MapboxRetrieveResponse
import com.rpl.kosthub.data.model.MapboxSuggestResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface MapboxService {
    @GET("search/searchbox/v1/suggest")
    suspend fun getSuggestions(
        @Query("q") query: String,
        @Query("access_token") accessToken: String,
        @Query("session_token") sessionToken: String,
        @Query("bbox") bbox: String = "110.73,-7.62,110.89,-7.50",
        @Query("proximity") proximity: String = "110.8237,-7.5755",
        @Query("types") types: String = "poi,address,neighborhood,locality,place",
        @Query("language") language: String = "id",
        @Query("limit") limit: Int = 8
    ): MapboxSuggestResponse

    @GET("search/searchbox/v1/retrieve/{id}")
    suspend fun retrieveCoordinates(
        @Path("id") mapboxId: String,
        @Query("access_token") accessToken: String,
        @Query("session_token") sessionToken: String
    ): MapboxRetrieveResponse
}
