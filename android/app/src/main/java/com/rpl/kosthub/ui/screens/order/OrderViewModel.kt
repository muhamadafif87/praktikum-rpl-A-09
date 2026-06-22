package com.rpl.kosthub.ui.screens.order

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.rpl.kosthub.data.model.*
import com.rpl.kosthub.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException
import org.json.JSONObject

sealed class SeedingState {
    object Idle : SeedingState()
    object Loading : SeedingState()
    data class Success(val data: SeedingDetailData) : SeedingState()
    data class Error(val message: String) : SeedingState()
}

sealed class EstimateState {
    object Idle : EstimateState()
    object Loading : EstimateState()
    data class Success(val data: EstimateFeeData) : EstimateState()
    data class Error(val message: String) : EstimateState()
}

sealed class CreateOrderState {
    object Idle : CreateOrderState()
    object Loading : CreateOrderState()
    data class Success(val idUniquePesanan: String) : CreateOrderState()
    data class Error(val message: String) : CreateOrderState()
}

sealed class MockPaymentState {
    object Idle : MockPaymentState()
    object Loading : MockPaymentState()
    data class Success(val message: String) : MockPaymentState()
    data class Error(val message: String) : MockPaymentState()
}

sealed class PesananDetailState {
    object Idle : PesananDetailState()
    object Loading : PesananDetailState()
    data class Success(val data: com.rpl.kosthub.data.model.DetailPesananData) : PesananDetailState()
    data class Error(val message: String) : PesananDetailState()
}

class OrderViewModel(application: Application) : AndroidViewModel(application) {

    private val _seedingState = MutableStateFlow<SeedingState>(SeedingState.Idle)
    val seedingState: StateFlow<SeedingState> = _seedingState.asStateFlow()

    private val _estimateState = MutableStateFlow<EstimateState>(EstimateState.Idle)
    val estimateState: StateFlow<EstimateState> = _estimateState.asStateFlow()

    private val _createOrderState = MutableStateFlow<CreateOrderState>(CreateOrderState.Idle)
    val createOrderState: StateFlow<CreateOrderState> = _createOrderState.asStateFlow()

    private val _mockPaymentState = MutableStateFlow<MockPaymentState>(MockPaymentState.Idle)
    val mockPaymentState: StateFlow<MockPaymentState> = _mockPaymentState.asStateFlow()

    private val _pesananDetailState = MutableStateFlow<PesananDetailState>(PesananDetailState.Idle)
    val pesananDetailState: StateFlow<PesananDetailState> = _pesananDetailState.asStateFlow()

    private fun getToken(): String? {
        val prefs = getApplication<Application>().getSharedPreferences("auth_prefs", android.content.Context.MODE_PRIVATE)
        val token = prefs.getString("token", null)
        return if (token != null) "Bearer $token" else null
    }

    fun fetchSeedingDetail(typeLayanan: String, idMitra: Int) {
        val token = getToken() ?: run {
            _seedingState.value = SeedingState.Error("Silakan login terlebih dahulu.")
            return
        }

        viewModelScope.launch {
            _seedingState.value = SeedingState.Loading
            try {
                val payload = SeedingDetailPesananRequest(typeLayanan = typeLayanan, idMitra = idMitra)
                val response = when (typeLayanan) {
                    "laundry", "laundry_express" -> RetrofitClient.instance.getSeedingDetailLaundry(token, payload)
                    "gas_galon", "gas", "galon" -> RetrofitClient.instance.getSeedingDetailGalonGas(token, payload)
                    "daily_cleaning", "cleaning" -> RetrofitClient.instance.getSeedingDetailDailyCleaning(token, payload)
                    else -> throw IllegalArgumentException("Unknown typeLayanan: $typeLayanan")
                }

                if (response.success && response.data != null) {
                    _seedingState.value = SeedingState.Success(response.data)
                } else {
                    _seedingState.value = SeedingState.Error(response.message ?: "Gagal memuat detail.")
                }
            } catch (e: HttpException) {
                val errorBody = e.response()?.errorBody()?.string()
                val serverMessage = try {
                    JSONObject(errorBody ?: "").getString("message")
                } catch (jsonEx: Exception) {
                    errorBody ?: e.message ?: "Terjadi kesalahan server"
                }
                _seedingState.value = SeedingState.Error("HTTP ${e.code()}: \n\n$serverMessage")
            } catch (e: Exception) {
                _seedingState.value = SeedingState.Error(e.message ?: "Terjadi kesalahan")
            }
        }
    }

    fun estimateFee(request: EstimateFeePesananRequest) {
        val token = getToken() ?: run {
            _estimateState.value = EstimateState.Error("Silakan login terlebih dahulu.")
            return
        }

        viewModelScope.launch {
            _estimateState.value = EstimateState.Loading
            try {
                val response = RetrofitClient.instance.estimateFeePesanan(token, request)
                if (response.success && response.data != null) {
                    _estimateState.value = EstimateState.Success(response.data)
                } else {
                    _estimateState.value = EstimateState.Error(response.message ?: "Gagal menghitung estimasi.")
                }
            } catch (e: Exception) {
                _estimateState.value = EstimateState.Error(e.message ?: "Terjadi kesalahan")
            }
        }
    }

    fun createPesananLaundry(request: CreatePesananLaundryRequest) {
        val token = getToken() ?: return
        viewModelScope.launch {
            _createOrderState.value = CreateOrderState.Loading
            try {
                val response = RetrofitClient.instance.createPesananLaundry(token, request)
                handleCreateResponse(response)
            } catch (e: Exception) {
                _createOrderState.value = CreateOrderState.Error(e.message ?: "Terjadi kesalahan")
            }
        }
    }

    fun createPesananGalonGas(request: CreatePesananGalonGasRequest) {
        val token = getToken() ?: return
        viewModelScope.launch {
            _createOrderState.value = CreateOrderState.Loading
            try {
                val response = RetrofitClient.instance.createPesananGalonGas(token, request)
                handleCreateResponse(response)
            } catch (e: Exception) {
                _createOrderState.value = CreateOrderState.Error(e.message ?: "Terjadi kesalahan")
            }
        }
    }

    fun createPesananDailyCleaning(request: CreatePesananDailyCleaningRequest) {
        val token = getToken() ?: return
        viewModelScope.launch {
            _createOrderState.value = CreateOrderState.Loading
            try {
                val response = RetrofitClient.instance.createPesananDailyCleaning(token, request)
                handleCreateResponse(response)
            } catch (e: Exception) {
                _createOrderState.value = CreateOrderState.Error(e.message ?: "Terjadi kesalahan")
            }
        }
    }

    private fun handleCreateResponse(response: CreatePesananResponse) {
        if (response.success && response.data != null) {
            _createOrderState.value = CreateOrderState.Success(response.data.idUniquePesanan)
        } else {
            _createOrderState.value = CreateOrderState.Error(response.message ?: "Gagal membuat pesanan.")
        }
    }

    fun resetCreateState() {
        _createOrderState.value = CreateOrderState.Idle
    }

    fun fetchPesananDetail(idUniquePesanan: String) {
        val token = getToken() ?: run {
            _pesananDetailState.value = PesananDetailState.Error("Silakan login terlebih dahulu.")
            return
        }
        viewModelScope.launch {
            _pesananDetailState.value = PesananDetailState.Loading
            try {
                val response = RetrofitClient.instance.getDetailPesanan(token, idUniquePesanan)
                if (response.success && response.data != null) {
                    _pesananDetailState.value = PesananDetailState.Success(response.data)
                } else {
                    _pesananDetailState.value = PesananDetailState.Error(response.message ?: "Gagal memuat detail pesanan.")
                }
            } catch (e: HttpException) {
                val errorBody = e.response()?.errorBody()?.string()
                val serverMessage = try {
                    JSONObject(errorBody ?: "").getString("message")
                } catch (jsonEx: Exception) {
                    errorBody ?: e.message ?: "Terjadi kesalahan server"
                }
                _pesananDetailState.value = PesananDetailState.Error("HTTP ${e.code()}: $serverMessage")
            } catch (e: Exception) {
                _pesananDetailState.value = PesananDetailState.Error(e.message ?: "Terjadi kesalahan")
            }
        }
    }

    fun performMockPayment(idUniquePesanan: String) {
        val token = getToken() ?: run {
            _mockPaymentState.value = MockPaymentState.Error("Silakan login terlebih dahulu.")
            return
        }

        viewModelScope.launch {
            _mockPaymentState.value = MockPaymentState.Loading
            try {
                val response = RetrofitClient.instance.mockPayment(token, idUniquePesanan)
                if (response.success) {
                    _mockPaymentState.value = MockPaymentState.Success(response.message ?: "Pembayaran berhasil disimulasikan.")
                } else {
                    _mockPaymentState.value = MockPaymentState.Error(response.message ?: "Gagal memproses pembayaran.")
                }
            } catch (e: Exception) {
                _mockPaymentState.value = MockPaymentState.Error(e.message ?: "Terjadi kesalahan")
            }
        }
    }

    fun resetMockPaymentState() {
        _mockPaymentState.value = MockPaymentState.Idle
    }
}
