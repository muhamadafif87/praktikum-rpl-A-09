package com.rpl.kosthub.ui.screens.order

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rpl.kosthub.data.model.*
import com.rpl.kosthub.ui.components.KostHubTextField
import com.rpl.kosthub.ui.components.PrimaryButton
import com.rpl.kosthub.ui.components.Stepper
import com.rpl.kosthub.ui.screens.map.LocationViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GasGalonDetailScreen(
    mitraId: Int,
    orderViewModel: OrderViewModel,
    locationViewModel: LocationViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToPayment: (String) -> Unit
) {
    val context = LocalContext.current
    val seedingState by orderViewModel.seedingState.collectAsState()
    val estimateState by orderViewModel.estimateState.collectAsState()
    val createOrderState by orderViewModel.createOrderState.collectAsState()
    val locationState by locationViewModel.locationState.collectAsState()

    var selectedQuantities by remember { mutableStateOf(mapOf<Int, Int>()) }
    var selectedServiceTypes by remember { mutableStateOf(mapOf<Int, String>()) } // "isi_ulang" or "beli_baru"
    var note by remember { mutableStateOf("") }

    // Fetch Seeding Detail
    LaunchedEffect(mitraId) {
        orderViewModel.fetchSeedingDetail("gas_galon", mitraId)
    }

    // Effect for handling creation state
    LaunchedEffect(createOrderState) {
        if (createOrderState is CreateOrderState.Success) {
            val orderId = (createOrderState as CreateOrderState.Success).idUniquePesanan
            orderViewModel.resetCreateState()
            onNavigateToPayment(orderId)
        } else if (createOrderState is CreateOrderState.Error) {
            Toast.makeText(context, (createOrderState as CreateOrderState.Error).message, Toast.LENGTH_SHORT).show()
            orderViewModel.resetCreateState()
        }
    }

    // Helper to request estimation
    val requestEstimation = {
        val selectedItems = selectedQuantities.filterValues { it > 0 }
        if (selectedItems.isNotEmpty() && seedingState is SeedingState.Success) {
            val seedingData = (seedingState as SeedingState.Success).data
            
            val itemLayananList = mutableListOf<ItemLayanan>()
            val biayaTambahanList = mutableListOf<BiayaTambahanGalonItem>()

            selectedItems.forEach { (id, qty) ->
                itemLayananList.add(ItemLayanan(idLayanan = id.toString(), qty = qty))
                
                val srvType = selectedServiceTypes[id] ?: "isi_ulang"
                if (srvType == "beli_baru") {
                    val lay = seedingData.layanan.find { it.idLayanan == id }
                    if (lay != null && lay.beliBaru != null && lay.beliBaru > 0) {
                        biayaTambahanList.add(
                            BiayaTambahanGalonItem(
                                idLayanan = id.toString(),
                                beliBaru = lay.beliBaru
                            )
                        )
                    }
                }
            }

            val req = EstimateFeePesananRequest(
                idMitra = mitraId.toString(),
                typeLayanan = "galon_gas",
                layanan = itemLayananList,
                jarakOngkir = 5, // Mock distance
                biayaTambahan = biayaTambahanList.ifEmpty { null }
            )
            orderViewModel.estimateFee(req)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detail Pesanan", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        bottomBar = {
            val totalSelected = selectedQuantities.values.sum()
            val isEnabled = totalSelected > 0 && locationState.isConfirmed && createOrderState !is CreateOrderState.Loading
            
            Box(modifier = Modifier.padding(16.dp)) {
                PrimaryButton(
                    text = if (createOrderState is CreateOrderState.Loading) "Memproses..." else "Buat Pesanan →", 
                    onClick = {
                        if (estimateState is EstimateState.Success) {
                            val est = (estimateState as EstimateState.Success).data
                            
                            val itemLayananList = mutableListOf<ItemLayanan>()
                            val biayaTambahanList = mutableListOf<BiayaTambahanGalonItem>()

                            selectedQuantities.filterValues { it > 0 }.forEach { (id, qty) ->
                                itemLayananList.add(ItemLayanan(idLayanan = id.toString(), qty = qty))
                                val srvType = selectedServiceTypes[id] ?: "isi_ulang"
                                if (srvType == "beli_baru" && seedingState is SeedingState.Success) {
                                    val seedingData = (seedingState as SeedingState.Success).data
                                    val lay = seedingData.layanan.find { it.idLayanan == id }
                                    if (lay != null && lay.beliBaru != null) {
                                        biayaTambahanList.add(
                                            BiayaTambahanGalonItem(
                                                idLayanan = id.toString(),
                                                beliBaru = lay.beliBaru
                                            )
                                        )
                                    }
                                }
                            }

                            val req = CreatePesananGalonGasRequest(
                                idMitra = mitraId.toString(),
                                typeLayanan = "galon_gas",
                                items = itemLayananList,
                                jarakOngkir = 5,
                                jadwalLayanan = listOf(JadwalLayanan(jam = "10:00")), // Mock schedule
                                biayaTambahan = biayaTambahanList,
                                estimasi = EstimasiPesanan(
                                    subtotal = est.ringkasan.subtotal,
                                    biayaOngkir = est.ringkasan.biayaOngkir ?: 0,
                                    totalPembayaran = est.ringkasan.totalPembayaran,
                                    beliBaru = est.ringkasan.totalBeliBaru ?: 0
                                ),
                                catatanPengiriman = "Alamat: ${locationState.address}\nCatatan: $note"
                            )
                            orderViewModel.createPesananGalonGas(req)
                        }
                    },
                    enabled = isEnabled
                )
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .background(MaterialTheme.colorScheme.background)
        ) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 2.dp
            ) {
                Stepper(currentStep = 2, currentStepLabel = "Detail Pesanan")
            }

            when (seedingState) {
                is SeedingState.Loading -> {
                    Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                is SeedingState.Error -> {
                    Text(
                        (seedingState as SeedingState.Error).message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(16.dp)
                    )
                }
                is SeedingState.Success -> {
                    val data = (seedingState as SeedingState.Success).data
                    
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Detail Pesanan", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Mitra: ${data.namaMitra}", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                        
                        Spacer(modifier = Modifier.height(24.dp))

                        Text("Pilih kebutuhan Anda untuk pengiriman langsung ke kos.", fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(8.dp))

                        // Items Selection
                        data.layanan.forEach { layanan ->
                            val currentQty = selectedQuantities[layanan.idLayanan] ?: 0
                            val currentService = selectedServiceTypes[layanan.idLayanan] ?: "isi_ulang"
                            
                            Card(
                                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(layanan.namaLayanan, fontWeight = FontWeight.Bold)
                                            Text("Rp ${layanan.hargaBarang ?: 0}", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                                        }
                                        
                                        // Quantity Stepper
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            IconButton(onClick = {
                                                if (currentQty > 0) {
                                                    selectedQuantities = selectedQuantities.toMutableMap().apply { put(layanan.idLayanan, currentQty - 1) }
                                                    requestEstimation()
                                                }
                                            }) {
                                                Icon(Icons.Default.Remove, contentDescription = "Kurang")
                                            }
                                            Text(currentQty.toString(), fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp))
                                            IconButton(onClick = {
                                                selectedQuantities = selectedQuantities.toMutableMap().apply { put(layanan.idLayanan, currentQty + 1) }
                                                requestEstimation()
                                            }) {
                                                Icon(Icons.Default.Add, contentDescription = "Tambah")
                                            }
                                        }
                                    }
                                    
                                    if (currentQty > 0) {
                                        Spacer(modifier = Modifier.height(12.dp))
                                        Text("Pilih Jenis Layanan:", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                                        Spacer(modifier = Modifier.height(4.dp))
                                        
                                        // Service Radio Buttons
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            RadioButton(
                                                selected = currentService == "isi_ulang",
                                                onClick = {
                                                    selectedServiceTypes = selectedServiceTypes.toMutableMap().apply { put(layanan.idLayanan, "isi_ulang") }
                                                    requestEstimation()
                                                }
                                            )
                                            Text("Isi Ulang", fontSize = 12.sp)
                                            
                                            Spacer(modifier = Modifier.width(16.dp))
                                            
                                            if (layanan.beliBaru != null && layanan.beliBaru > 0) {
                                                RadioButton(
                                                    selected = currentService == "beli_baru",
                                                    onClick = {
                                                        selectedServiceTypes = selectedServiceTypes.toMutableMap().apply { put(layanan.idLayanan, "beli_baru") }
                                                        requestEstimation()
                                                    }
                                                )
                                                Text("Beli Baru (+ Rp ${layanan.beliBaru})", fontSize = 12.sp)
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Text("Detail Pengiriman", fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        // Show Location
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.05f),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("Alamat Pengiriman:", fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                                if (locationState.isConfirmed && locationState.address.isNotEmpty()) {
                                    Text(locationState.address, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                } else {
                                    Text("Belum Diatur! Silakan atur lokasi di Beranda.", fontSize = 14.sp, color = MaterialTheme.colorScheme.error)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        KostHubTextField(value = note, onValueChange = { note = it }, label = "Catatan Pengiriman (Opsional)", placeholder = "Contoh: Titip di Bapak Kos")

                        Spacer(modifier = Modifier.height(24.dp))
                        HorizontalDivider()
                        Spacer(modifier = Modifier.height(16.dp))

                        Text("Ringkasan Pembayaran", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        when (estimateState) {
                            is EstimateState.Loading -> {
                                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally).padding(16.dp))
                            }
                            is EstimateState.Error -> {
                                Text(
                                    (estimateState as EstimateState.Error).message,
                                    color = MaterialTheme.colorScheme.error,
                                    fontSize = 14.sp
                                )
                            }
                            is EstimateState.Success -> {
                                val est = (estimateState as EstimateState.Success).data
                                
                                // Detail Items
                                Text("Detail Item:", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                                Spacer(modifier = Modifier.height(8.dp))
                                est.detailLayanan.forEach { item ->
                                    Row(modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("${item.qty}x ${item.namaLayanan}", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                                        Text("Rp ${item.subtotal}", fontSize = 14.sp)
                                    }
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                                Spacer(modifier = Modifier.height(8.dp))
                                
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Subtotal", color = MaterialTheme.colorScheme.secondary)
                                    Text("Rp ${est.ringkasan.subtotal}", fontWeight = FontWeight.SemiBold)
                                }
                                if (est.ringkasan.totalBeliBaru != null && est.ringkasan.totalBeliBaru > 0) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Biaya Beli Baru", color = MaterialTheme.colorScheme.secondary)
                                        Text("Rp ${est.ringkasan.totalBeliBaru}", fontWeight = FontWeight.SemiBold)
                                    }
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Biaya Pengiriman", color = MaterialTheme.colorScheme.secondary)
                                    Text("Rp ${est.ringkasan.biayaOngkir ?: 0}", fontWeight = FontWeight.SemiBold)
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Biaya Layanan Aplikasi", color = MaterialTheme.colorScheme.secondary)
                                    Text("Rp ${est.ringkasan.biayaLayananAplikasi}", fontWeight = FontWeight.SemiBold)
                                }
                                Spacer(modifier = Modifier.height(16.dp))
                                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                                Spacer(modifier = Modifier.height(16.dp))
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Total Pembayaran Sementara", fontWeight = FontWeight.Bold)
                                    Text("Rp ${est.ringkasan.totalPembayaran}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 18.sp)
                                }
                            }
                            else -> {
                                Text("Pilih item untuk melihat estimasi.", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Escrow info
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Row {
                                Icon(Icons.Outlined.Info, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Transaksi Anda dilindungi oleh Sistem Escrow KostHub. Dana akan diteruskan ke mitra hanya setelah layanan selesai sesuai pesanan Anda.",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.secondary
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(32.dp))
                    }
                }
                else -> {}
            }
        }
    }
}
