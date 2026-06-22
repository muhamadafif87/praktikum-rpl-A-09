package com.rpl.kosthub.ui.screens.map

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rpl.kosthub.data.model.MapboxSuggestion
import com.rpl.kosthub.data.remote.RetrofitClient
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class LocationSearchViewModel : ViewModel() {
    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query

    private val _suggestions = MutableStateFlow<List<MapboxSuggestion>>(emptyList())
    val suggestions: StateFlow<List<MapboxSuggestion>> = _suggestions

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val mapboxToken = "pk.eyJ1Ijoia29zdGh1YjEyMyIsImEiOiJjbXB5NmRwcWQwMjh6MnJyMjN5dXJjdDJmIn0.LUM5OChfrkGTYowXXQVqUA"
    private var sessionToken = java.util.UUID.randomUUID().toString()

    private var searchJob: Job? = null

    fun updateQuery(newQuery: String) {
        _query.value = newQuery
        searchJob?.cancel()

        if (newQuery.length < 2) {
            _suggestions.value = emptyList()
            _isLoading.value = false
            return
        }

        searchJob = viewModelScope.launch {
            delay(200) // Debounce 200ms
            fetchSuggestions(newQuery)
        }
    }

    private suspend fun fetchSuggestions(q: String) {
        _isLoading.value = true
        try {
            val response = RetrofitClient.mapboxInstance.getSuggestions(
                query = q,
                accessToken = mapboxToken,
                sessionToken = sessionToken
            )
            // Filter unique mapbox_id
            val distinct = response.suggestions.distinctBy { it.mapboxId }
            _suggestions.value = distinct
        } catch (e: Exception) {
            _suggestions.value = emptyList()
            e.printStackTrace()
        } finally {
            _isLoading.value = false
        }
    }

    fun retrieveCoordinates(mapboxId: String, onResult: (lat: Double, lng: Double) -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = RetrofitClient.mapboxInstance.retrieveCoordinates(
                    mapboxId = mapboxId,
                    accessToken = mapboxToken,
                    sessionToken = sessionToken
                )
                if (response.features.isNotEmpty()) {
                    val coords = response.features[0].geometry.coordinates // [lng, lat]
                    onResult(coords[1], coords[0])
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
                // Reset session token after a successful retrieve as per Mapbox docs
                sessionToken = java.util.UUID.randomUUID().toString()
            }
        }
    }
}
