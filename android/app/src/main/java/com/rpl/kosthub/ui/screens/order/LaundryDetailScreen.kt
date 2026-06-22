package com.rpl.kosthub.ui.screens.order

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rpl.kosthub.ui.components.KostHubTextField
import com.rpl.kosthub.ui.components.PrimaryButton
import com.rpl.kosthub.ui.components.Stepper

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LaundryDetailScreen(
    onNavigateBack: () -> Unit,
    onNavigateToPayment: () -> Unit
) {
    var selectedService by remember { mutableStateOf("cuci_setrika") }
    var weight by remember { mutableStateOf("") }
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
                Text("Mitra: Laundry Wangi Jaya", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                
                Spacer(modifier = Modifier.height(24.dp))

                Text("Pilih Jenis Pakaian", fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))

                ServiceOptionCard(
                    title = "Cuci Setrika",
                    price = "Rp 8.000 / kg",
                    selected = selectedService == "cuci_setrika",
                    onClick = { selectedService = "cuci_setrika" }
                )
                Spacer(modifier = Modifier.height(8.dp))
                ServiceOptionCard(
                    title = "Cuci Kering",
                    price = "Rp 6.000 / kg",
                    selected = selectedService == "cuci_kering",
                    onClick = { selectedService = "cuci_kering" }
                )
                Spacer(modifier = Modifier.height(8.dp))
                ServiceOptionCard(
                    title = "Setrika Saja",
                    price = "Rp 5.000 / kg",
                    selected = selectedService == "setrika",
                    onClick = { selectedService = "setrika" }
                )

                Spacer(modifier = Modifier.height(24.dp))

                Text("Estimasi Berat Pakaian", fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))
                KostHubTextField(value = weight, onValueChange = { weight = it }, label = "Berat (kg)", placeholder = "Misal: 3")
                Spacer(modifier = Modifier.height(4.dp))
                Text("*Berat aktual akan ditimbang oleh kurir.", color = MaterialTheme.colorScheme.secondary, fontSize = 12.sp)

                Spacer(modifier = Modifier.height(24.dp))
                
                Text("Jadwal Penjemputan", fontWeight = FontWeight.SemiBold)
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
                    Text("Rp 24.000", fontWeight = FontWeight.SemiBold)
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
                    Text("Rp 29.000", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 18.sp)
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
