package com.rpl.kosthub.ui.screens.mitra

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rpl.kosthub.data.model.Mitra
import com.rpl.kosthub.data.remote.RetrofitClient
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

import com.rpl.kosthub.ui.screens.home.UiState

class MitraListViewModel : ViewModel() {
    private val _mitraState = MutableStateFlow<UiState<List<Mitra>>>(UiState.Loading)
    val mitraState: StateFlow<UiState<List<Mitra>>> = _mitraState

    fun fetchAllMitras(lat: Double? = null, lng: Double? = null) {
        viewModelScope.launch {
            _mitraState.value = UiState.Loading
            try {
                // Fetch concurrently
                val gasGalonDeferred = async { 
                    try { RetrofitClient.instance.getGasGalon(lat, lng).data } catch (e: Exception) { emptyList() }
                }
                val laundryDeferred = async { 
                    try { RetrofitClient.instance.getLaundry(lat, lng).data } catch (e: Exception) { emptyList() }
                }
                val cleaningDeferred = async { 
                    try { RetrofitClient.instance.getCleaning(lat, lng).data } catch (e: Exception) { emptyList() }
                }

                val results = awaitAll(gasGalonDeferred, laundryDeferred, cleaningDeferred)
                val combinedList = results.flatten()
                
                if (combinedList.isNotEmpty()) {
                    _mitraState.value = UiState.Success(combinedList)
                } else {
                    _mitraState.value = UiState.Error("Belum ada mitra atau tidak bisa terhubung ke backend. Pastikan server backend berjalan di IP lokal.")
                }
            } catch (e: Exception) {
                _mitraState.value = UiState.Error("Gagal mengambil daftar mitra: ${e.message}")
            }
        }
    }
}
