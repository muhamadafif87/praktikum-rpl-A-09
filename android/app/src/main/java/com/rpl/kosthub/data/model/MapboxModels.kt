package com.rpl.kosthub.data.model

import com.google.gson.annotations.SerializedName

data class MapboxSuggestResponse(
    @SerializedName("suggestions") val suggestions: List<MapboxSuggestion>
)

data class MapboxSuggestion(
    @SerializedName("mapbox_id") val mapboxId: String,
    @SerializedName("name") val name: String,
    @SerializedName("place_formatted") val placeFormatted: String?,
    @SerializedName("full_address") val fullAddress: String?
)

data class MapboxRetrieveResponse(
    @SerializedName("features") val features: List<MapboxFeature>
)

data class MapboxFeature(
    @SerializedName("geometry") val geometry: MapboxGeometry
)

data class MapboxGeometry(
    @SerializedName("coordinates") val coordinates: List<Double> // [lng, lat]
)
