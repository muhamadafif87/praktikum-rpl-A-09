package com.rpl.kosthub.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rpl.kosthub.data.model.Mitra
import com.rpl.kosthub.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class HomeViewModel : ViewModel() {
    private val _terpopulerState = MutableStateFlow<UiState<List<Mitra>>>(UiState.Loading)
    val terpopulerState: StateFlow<UiState<List<Mitra>>> = _terpopulerState

    init {
        fetchTerpopuler()
    }

    fun fetchTerpopuler() {
        viewModelScope.launch {
            _terpopulerState.value = UiState.Loading
            try {
                val response = RetrofitClient.instance.getLayananTerpopuler()
                if (response.success && response.data.isNotEmpty()) {
                    _terpopulerState.value = UiState.Success(response.data)
                } else {
                    _terpopulerState.value = UiState.Error("Data tidak ditemukan atau backend belum mengembalikan data mitra terpopuler.")
                }
            } catch (e: Exception) {
                _terpopulerState.value = UiState.Error("Gagal memuat data dari server. Pastikan API berjalan di IP yang benar. Detail: ${e.message}")
            }
        }
    }
}

sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<out T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}
