package com.rpl.kosthub.ui.screens.profile

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rpl.kosthub.data.model.UpdateProfileRequest
import com.rpl.kosthub.data.model.User
import com.rpl.kosthub.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class ProfileState {
    object Loading : ProfileState()
    data class Success(val user: User) : ProfileState()
    data class Error(val message: String) : ProfileState()
}

class ProfileViewModel : ViewModel() {
    private val _profileState = MutableStateFlow<ProfileState>(ProfileState.Loading)
    val profileState: StateFlow<ProfileState> = _profileState

    private val _isUpdating = MutableStateFlow(false)
    val isUpdating: StateFlow<Boolean> = _isUpdating

    private val _updateSuccess = MutableStateFlow(false)
    val updateSuccess: StateFlow<Boolean> = _updateSuccess

    fun fetchProfile(context: Context) {
        viewModelScope.launch {
            _profileState.value = ProfileState.Loading
            try {
                val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
                val token = prefs.getString("token", "") ?: ""
                
                if (token.isNotEmpty()) {
                    val response = RetrofitClient.instance.getProfile("Bearer $token")
                    if (response.data != null) {
                        _profileState.value = ProfileState.Success(response.data)
                    } else {
                        _profileState.value = ProfileState.Error("Gagal memuat profil")
                    }
                } else {
                    _profileState.value = ProfileState.Error("Belum login")
                }
            } catch (e: Exception) {
                _profileState.value = ProfileState.Error(e.message ?: "Terjadi kesalahan")
            }
        }
    }

    fun updateProfile(context: Context, payload: UpdateProfileRequest, onComplete: () -> Unit) {
        viewModelScope.launch {
            _isUpdating.value = true
            _updateSuccess.value = false
            try {
                val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
                val token = prefs.getString("token", "") ?: ""
                
                if (token.isNotEmpty()) {
                    val response = RetrofitClient.instance.updateProfile("Bearer $token", payload)
                    if (response.data != null) {
                        _profileState.value = ProfileState.Success(response.data)
                        _updateSuccess.value = true
                        
                        // Also update LocationContext preferences if address is provided
                        if (!payload.alamat.isNullOrEmpty() && payload.latitude != null && payload.longitude != null) {
                            val locPrefs = context.getSharedPreferences("user_location", Context.MODE_PRIVATE)
                            locPrefs.edit().apply {
                                putBoolean("isConfirmed", true)
                                putString("address", payload.addressDetail ?: payload.alamat)
                                putString("lat", payload.latitude.toString())
                                putString("lng", payload.longitude.toString())
                                putBoolean("isFromProfile", true)
                                apply()
                            }
                        }
                    } else {
                        // Error handling
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isUpdating.value = false
                onComplete()
            }
        }
    }
    
    fun resetUpdateSuccess() {
        _updateSuccess.value = false
    }
}
