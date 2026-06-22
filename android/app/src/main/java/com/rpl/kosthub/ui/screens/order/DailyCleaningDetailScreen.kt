package com.rpl.kosthub.ui.screens.order

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rpl.kosthub.ui.components.KostHubTextField
import com.rpl.kosthub.ui.components.PrimaryButton
import com.rpl.kosthub.ui.components.Stepper

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DailyCleaningDetailScreen(
    onNavigateBack: () -> Unit,
    onNavigateToPayment: () -> Unit
) {
    var selectedDuration by remember { mutableStateOf("1_jam") }
    var selectedTool by remember { mutableStateOf("bawa_sendiri") }
    var date by remember { mutableStateOf("") }
    var time by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var wa by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Konfigurasi Pesanan", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 18.sp) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        bottomBar = {
            Box(modifier = Modifier.padding(16.dp)) {
                PrimaryButton(text = "Lanjutkan ke Pembayaran →", onClick = onNavigateToPayment)
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

            Column(modifier = Modifier.padding(16.dp)) {
                Text("Detail Pesanan", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Mitra: Clean & Shine Solo", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                
                Spacer(modifier = Modifier.height(24.dp))

                Text("Pilih Durasi Layanan", fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))

                ServiceOptionCard(
                    title = "1 Jam (Kamar Reguler)",
                    price = "Rp 35.000",
                    selected = selectedDuration == "1_jam",
                    onClick = { selectedDuration = "1_jam" }
                )
                Spacer(modifier = Modifier.height(8.dp))
                ServiceOptionCard(
                    title = "2 Jam (Kamar Mandi Dalam)",
                    price = "Rp 60.000",
                    selected = selectedDuration == "2_jam",
                    onClick = { selectedDuration = "2_jam" }
                )
                Spacer(modifier = Modifier.height(8.dp))
                ServiceOptionCard(
                    title = "3 Jam (Kamar Plus Balkon)",
                    price = "Rp 80.000",
                    selected = selectedDuration == "3_jam",
                    onClick = { selectedDuration = "3_jam" }
                )

                Spacer(modifier = Modifier.height(24.dp))

                Text("Kebutuhan Alat Pembersih", fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))
                
                ServiceOptionCard(
                    title = "Bawa Sendiri (Dari Mitra)",
                    price = "+ Rp 15.000",
                    selected = selectedTool == "bawa_sendiri",
                    onClick = { selectedTool = "bawa_sendiri" }
                )
                Spacer(modifier = Modifier.height(8.dp))
                ServiceOptionCard(
                    title = "Pakai Alat Kos",
                    price = "Gratis",
                    selected = selectedTool == "pakai_alat_kos",
                    onClick = { selectedTool = "pakai_alat_kos" }
                )

                Spacer(modifier = Modifier.height(24.dp))
                
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
                
                KostHubTextField(value = name, onValueChange = { name = it }, label = "Nama Lengkap", placeholder = "Masukkan nama Anda")
                Spacer(modifier = Modifier.height(12.dp))
                KostHubTextField(value = wa, onValueChange = { wa = it }, label = "Nomor WhatsApp", placeholder = "08xxxxxxxxxx")
                Spacer(modifier = Modifier.height(12.dp))
                KostHubTextField(value = note, onValueChange = { note = it }, label = "Catatan Pengiriman", placeholder = "Contoh: Titip di Bapak Kos")

                Spacer(modifier = Modifier.height(24.dp))
                HorizontalDivider()
                Spacer(modifier = Modifier.height(16.dp))

                Text("Ringkasan Pembayaran", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Subtotal", color = MaterialTheme.colorScheme.secondary)
                    Text("Rp 50.000", fontWeight = FontWeight.SemiBold)
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Biaya Pengiriman", color = MaterialTheme.colorScheme.secondary)
                    Text("Rp 5.000", fontWeight = FontWeight.SemiBold)
                }
                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                Spacer(modifier = Modifier.height(16.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Total Pembayaran Sementara", fontWeight = FontWeight.Bold)
                    Text("Rp 55.000", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 18.sp)
                }

                Spacer(modifier = Modifier.height(16.dp))
                
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
    }
}
