package com.rpl.kosthub.ui.screens.order

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.rpl.kosthub.data.model.OrderItem
import com.rpl.kosthub.data.model.OrderUlasan
import com.rpl.kosthub.data.model.RiwayatMeta
import com.rpl.kosthub.data.model.UlasanRequest
import com.rpl.kosthub.data.remote.RetrofitClient
import com.rpl.kosthub.ui.screens.home.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class OrderHistoryViewModel(application: Application) : AndroidViewModel(application) {

    private val _ordersState = MutableStateFlow<UiState<List<OrderItem>>>(UiState.Loading)
    val ordersState: StateFlow<UiState<List<OrderItem>>> = _ordersState

    private val _meta = MutableStateFlow<RiwayatMeta?>(null)
    val meta: StateFlow<RiwayatMeta?> = _meta

    private val _statusFilter = MutableStateFlow<String?>(null)
    val statusFilter: StateFlow<String?> = _statusFilter

    private val _isLoadingMore = MutableStateFlow(false)
    val isLoadingMore: StateFlow<Boolean> = _isLoadingMore

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage

    // Internal list to accumulate pages for infinite scroll
    private var allOrders = mutableListOf<OrderItem>()
    private var currentPage = 1

    init {
        fetchOrders()
    }

    private fun getToken(): String? {
        val prefs = getApplication<Application>()
            .getSharedPreferences("auth_prefs", android.content.Context.MODE_PRIVATE)
        val token = prefs.getString("token", null)
        return if (token != null) "Bearer $token" else null
    }

    fun setStatusFilter(status: String?) {
        _statusFilter.value = status
        refreshOrders()
    }

    fun refreshOrders() {
        currentPage = 1
        allOrders.clear()
        fetchOrders()
    }

    fun loadNextPage() {
        val metaVal = _meta.value ?: return
        if (currentPage >= metaVal.lastPage) return
        if (_isLoadingMore.value) return

        currentPage++
        fetchOrders(isLoadMore = true)
    }

    private fun fetchOrders(isLoadMore: Boolean = false) {
        val token = getToken()
        if (token == null) {
            _ordersState.value = UiState.Error("Silakan login terlebih dahulu untuk melihat pesanan.")
            return
        }

        viewModelScope.launch {
            if (isLoadMore) {
                _isLoadingMore.value = true
            } else {
                _ordersState.value = UiState.Loading
            }

            try {
                val response = RetrofitClient.instance.getRiwayatPesanan(
                    token = token,
                    status = _statusFilter.value,
                    page = currentPage,
                    perPage = 10
                )

                if (response.success) {
                    if (isLoadMore) {
                        allOrders.addAll(response.data)
                    } else {
                        allOrders = response.data.toMutableList()
                    }
                    _meta.value = response.meta
                    _ordersState.value = UiState.Success(allOrders.toList())
                } else {
                    if (!isLoadMore) {
                        _ordersState.value = UiState.Error(response.message ?: "Gagal memuat riwayat pesanan.")
                    }
                }
            } catch (e: Exception) {
                if (!isLoadMore) {
                    _ordersState.value = UiState.Error("Gagal memuat data: ${e.message}")
                }
            } finally {
                _isLoadingMore.value = false
            }
        }
    }

    fun cancelOrder(idUniquePesanan: String) {
        val token = getToken() ?: return

        viewModelScope.launch {
            try {
                val response = RetrofitClient.instance.cancelPesanan(token, idUniquePesanan)
                if (response.success) {
                    _actionMessage.value = "Pesanan berhasil dibatalkan."
                    refreshOrders()
                } else {
                    _actionMessage.value = response.message ?: "Gagal membatalkan pesanan."
                }
            } catch (e: Exception) {
                _actionMessage.value = "Gagal membatalkan pesanan: ${e.message}"
            }
        }
    }

    fun completeOrder(idUniquePesanan: String) {
        val token = getToken() ?: return

        viewModelScope.launch {
            try {
                val response = RetrofitClient.instance.selesaikanPesanan(token, idUniquePesanan)
                if (response.success) {
                    _actionMessage.value = "Pesanan berhasil diselesaikan!"
                    refreshOrders()
                } else {
                    _actionMessage.value = response.message ?: "Gagal menyelesaikan pesanan."
                }
            } catch (e: Exception) {
                _actionMessage.value = "Gagal menyelesaikan pesanan: ${e.message}"
            }
        }
    }

    fun submitReview(idUniquePesanan: String, rating: Int, komentar: String?) {
        val token = getToken() ?: return

        viewModelScope.launch {
            try {
                val response = RetrofitClient.instance.tambahUlasan(
                    token = token,
                    idUniquePesanan = idUniquePesanan,
                    body = UlasanRequest(rating = rating, komentar = komentar)
                )
                if (response.success) {
                    _actionMessage.value = "Ulasan berhasil dikirim!"
                    // Update the order in the local list to reflect the new review
                    val updatedOrders = allOrders.map { order ->
                        if (order.idUniquePesanan == idUniquePesanan) {
                            order.copy(ulasan = response.data ?: OrderUlasan(rating, komentar))
                        } else {
                            order
                        }
                    }
                    allOrders = updatedOrders.toMutableList()
                    _ordersState.value = UiState.Success(allOrders.toList())
                } else {
                    _actionMessage.value = response.message ?: "Gagal mengirim ulasan."
                }
            } catch (e: Exception) {
                _actionMessage.value = "Gagal mengirim ulasan: ${e.message}"
            }
        }
    }

    fun clearActionMessage() {
        _actionMessage.value = null
    }
}
