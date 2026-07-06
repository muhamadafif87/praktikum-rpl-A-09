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
fun DailyCleaningDetailScreen(
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

    var selectedLayananId by remember { mutableStateOf<Int?>(null) }
    var selectedAlat by remember { mutableStateOf<String>("Tanpa Alat") }
    var date by remember { mutableStateOf("") }
    var time by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }

    // Fetch Seeding Detail
    LaunchedEffect(mitraId) {
        orderViewModel.fetchSeedingDetail("daily_cleaning", mitraId)
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
        if (selectedLayananId != null && seedingState is SeedingState.Success) {
            val seedingData = (seedingState as SeedingState.Success).data
            
            val biayaAlatMap = mutableMapOf<String, Int>()
            if (selectedAlat != "Tanpa Alat") {
                val biaya = seedingData.alatPembersihTambahan?.get(selectedAlat) ?: 0
                biayaAlatMap[selectedAlat] = biaya
            }

            val req = EstimateFeePesananRequest(
                idMitra = mitraId.toString(),
                typeLayanan = "daily_cleaning",
                layanan = listOf(ItemLayanan(idLayanan = selectedLayananId.toString(), qty = 1)),
                jarakOngkir = 5, // Mock distance
                biayaTambahanAlat = if (biayaAlatMap.isNotEmpty()) biayaAlatMap else null
            )
            orderViewModel.estimateFee(req)
        }
    }

    // Update estimation when selection changes
    LaunchedEffect(selectedLayananId, selectedAlat) {
        requestEstimation()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detail Pesanan Cleaning", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 18.sp) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        bottomBar = {
            val isEnabled = selectedLayananId != null && locationState.isConfirmed && createOrderState !is CreateOrderState.Loading
            
            Box(modifier = Modifier.padding(16.dp)) {
                PrimaryButton(
                    text = if (createOrderState is CreateOrderState.Loading) "Memproses..." else "Buat Pesanan →", 
                    onClick = {
                        if (estimateState is EstimateState.Success && seedingState is SeedingState.Success) {
                            val est = (estimateState as EstimateState.Success).data
                            val seedingData = (seedingState as SeedingState.Success).data

                            val biayaAlatMap = mutableMapOf<String, Int>()
                            if (selectedAlat != "Tanpa Alat") {
                                val biaya = seedingData.alatPembersihTambahan?.get(selectedAlat) ?: 0
                                biayaAlatMap[selectedAlat] = biaya
                            }

                            val req = CreatePesananDailyCleaningRequest(
                                idMitra = mitraId.toString(),
                                typeLayanan = "daily_cleaning",
                                items = listOf(ItemLayanan(idLayanan = selectedLayananId.toString(), qty = 1)),
                                jarakOngkir = 5,
                                jadwalLayanan = listOf(JadwalLayanan(jam = "10:00")), // Mock schedule
                                biayaTambahanAlat = biayaAlatMap,
                                estimasi = EstimasiPesanan(
                                    subtotal = est.ringkasan.subtotal,
                                    biayaOngkir = est.ringkasan.biayaOngkir ?: 0,
                                    totalPembayaran = est.ringkasan.totalPembayaran
                                ),
                                catatanPengiriman = "Alamat: ${locationState.address}\nCatatan: $note"
                            )
                            orderViewModel.createPesananDailyCleaning(req)
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
                        Text("Mitra: ${data.namaMitra}", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(24.dp))

                        Text("Pilih Durasi Layanan", fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(8.dp))

                        data.layanan.forEach { layanan ->
                            val isSelected = selectedLayananId == layanan.idLayanan
                            Card(
                                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.05f) else MaterialTheme.colorScheme.surface
                                ),
                                border = BorderStroke(
                                    if (isSelected) 2.dp else 1.dp, 
                                    if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
                                ),
                                onClick = { selectedLayananId = layanan.idLayanan }
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text(layanan.namaLayanan, fontWeight = FontWeight.Bold)
                                        Text("Rp ${layanan.hargaLayanan ?: 0}", fontSize = 14.sp, color = MaterialTheme.colorScheme.secondary)
                                    }
                                    RadioButton(
                                        selected = isSelected,
                                        onClick = { selectedLayananId = layanan.idLayanan },
                                        colors = RadioButtonDefaults.colors(selectedColor = MaterialTheme.colorScheme.primary)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Alat Pembersih Tambahan
                        if (!data.alatPembersihTambahan.isNullOrEmpty()) {
                            Text("Kebutuhan Alat Pembersih", fontWeight = FontWeight.SemiBold)
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            // Tanpa Alat option
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                            ) {
                                RadioButton(
                                    selected = selectedAlat == "Tanpa Alat",
                                    onClick = { selectedAlat = "Tanpa Alat" }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text("Tanpa Alat Tambahan", fontSize = 14.sp)
                                    Text("Gratis", fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                                }
                            }

                            // Dynamic options
                            data.alatPembersihTambahan.forEach { (type, biaya) ->
                                val isSelected = selectedAlat == type
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                                ) {
                                    RadioButton(
                                        selected = isSelected,
                                        onClick = { selectedAlat = type }
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text(type.replaceFirstChar { it.uppercase() }, fontSize = 14.sp)
                                        Text("+ Rp $biaya", fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(24.dp))
                        }

                        Text("Jadwal Pembersihan", fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            Box(modifier = Modifier.weight(1f)) {
                                KostHubTextField(value = date, onValueChange = { date = it }, label = "Tanggal", placeholder = "DD/MM/YYYY")
                            }
                            Box(modifier = Modifier.weight(1f)) {
                                KostHubTextField(value = time, onValueChange = { time = it }, label = "Waktu", placeholder = "HH:MM")
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
                                Text("Alamat Pengiriman/Penjemputan:", fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
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
                                
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Subtotal", color = MaterialTheme.colorScheme.secondary)
                                    Text("Rp ${est.ringkasan.subtotal}", fontWeight = FontWeight.SemiBold)
                                }
                                if (est.ringkasan.biayaTambahanAlat != null && est.ringkasan.biayaTambahanAlat > 0) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Biaya Tambahan Alat", color = MaterialTheme.colorScheme.secondary)
                                        Text("Rp ${est.ringkasan.biayaTambahanAlat}", fontWeight = FontWeight.SemiBold)
                                    }
                                }
                                if (est.ringkasan.biayaTransportasi != null && est.ringkasan.biayaTransportasi > 0) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Biaya Transportasi", color = MaterialTheme.colorScheme.secondary)
                                        Text("Rp ${est.ringkasan.biayaTransportasi}", fontWeight = FontWeight.SemiBold)
                                    }
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
                                Text("Pilih layanan untuk melihat estimasi.", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
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
