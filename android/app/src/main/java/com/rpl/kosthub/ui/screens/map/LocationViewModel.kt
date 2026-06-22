package com.rpl.kosthub.ui.screens.map

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rpl.kosthub.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class LocationState(
    val address: String = "",
    val lat: Double? = null,
    val lng: Double? = null,
    val isConfirmed: Boolean = false,
    val isFromProfile: Boolean = false
)

class LocationViewModel(private val context: Context) : ViewModel() {

    private val sharedPreferences = context.getSharedPreferences("user_location", Context.MODE_PRIVATE)

    private val _locationState = MutableStateFlow(loadLocationFromPrefs())
    val locationState: StateFlow<LocationState> = _locationState

    private fun loadLocationFromPrefs(): LocationState {
        val isConfirmed = sharedPreferences.getBoolean("isConfirmed", false)
        if (!isConfirmed) return LocationState()

        return LocationState(
            address = sharedPreferences.getString("address", "") ?: "",
            lat = sharedPreferences.getString("lat", null)?.toDoubleOrNull(),
            lng = sharedPreferences.getString("lng", null)?.toDoubleOrNull(),
            isConfirmed = true,
            isFromProfile = sharedPreferences.getBoolean("isFromProfile", false)
        )
    }

    fun setLocation(address: String, lat: Double, lng: Double, isFromProfile: Boolean = false) {
        val newState = LocationState(
            address = address,
            lat = lat,
            lng = lng,
            isConfirmed = true,
            isFromProfile = isFromProfile
        )
        _locationState.value = newState

        sharedPreferences.edit()
            .putBoolean("isConfirmed", true)
            .putString("address", address)
            .putString("lat", lat.toString())
            .putString("lng", lng.toString())
            .putBoolean("isFromProfile", isFromProfile)
            .apply()
    }

    fun clearLocation() {
        _locationState.value = LocationState()
        sharedPreferences.edit().clear().apply()
    }

    fun syncWithUserProfile() {
        viewModelScope.launch {
            try {
                // Fetch profile data from API
                val token = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE).getString("token", null)
                if (token != null) {
                    val response = RetrofitClient.instance.getProfile("Bearer $token")
                    val data = response.data
                    if (data != null && data.latitude != null && data.longitude != null) {
                        val addressDetail = data.alamat ?: "Sesuai Profil"
                        setLocation(
                            address = addressDetail,
                            lat = data.latitude,
                            lng = data.longitude,
                            isFromProfile = true
                        )
                    }
                }
            } catch (e: Exception) {
                // Ignore error, fallback to current location state
            }
        }
    }
}
