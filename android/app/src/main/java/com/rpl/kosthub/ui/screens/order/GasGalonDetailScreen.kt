package com.rpl.kosthub.ui.screens.order

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rpl.kosthub.ui.components.KostHubTextField
import com.rpl.kosthub.ui.components.PrimaryButton
import com.rpl.kosthub.ui.components.Stepper

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GasGalonDetailScreen(
    onNavigateBack: () -> Unit,
    onNavigateToPayment: () -> Unit
) {
    var selectedItem by remember { mutableStateOf("gas") }
    var selectedService by remember { mutableStateOf("isi_ulang") }
    var name by remember { mutableStateOf("") }
    var wa by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detail Pesanan", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    com.rpl.kosthub.ui.components.ProfileAvatar(
                        initials = "VA",
                        modifier = Modifier.padding(end = 16.dp)
                    )
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
                Text("Mitra: Toko Makmur Jaya", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                
                Spacer(modifier = Modifier.height(24.dp))

                Text("Pilih kebutuhan Anda untuk pengiriman langsung ke kos.", fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))

                // Item Selection
                ItemOptionCard(
                    title = "Gas LPG 3kg",
                    price = "Mulai dari Rp 20.000",
                    stock = "Stok: 15",
                    selected = selectedItem == "gas",
                    onClick = { selectedItem = "gas" }
                )
                Spacer(modifier = Modifier.height(8.dp))
                ItemOptionCard(
                    title = "Galon Aqua 19L",
                    price = "Mulai dari Rp 22.000",
                    stock = "Stok: Tersedia",
                    selected = selectedItem == "galon",
                    onClick = { selectedItem = "galon" }
                )

                Spacer(modifier = Modifier.height(24.dp))

                Text("Pilih Jenis Layanan", fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))

                // Service Selection
                ServiceOptionCard(
                    title = "Isi Ulang / Tukar Kosongan",
                    price = "Rp 20.000",
                    selected = selectedService == "isi_ulang",
                    onClick = { selectedService = "isi_ulang" }
                )
                
                if (selectedService == "isi_ulang") {
                    Spacer(modifier = Modifier.height(8.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                            .border(1.dp, MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Text(
                            text = "Penting! Anda wajib menyerahkan tabung/galon kosong yang layak pakai saat kurir tiba di lokasi kos.",
                            color = MaterialTheme.colorScheme.tertiary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                ServiceOptionCard(
                    title = "Beli Baru + Tabung/Galon",
                    price = "Rp 180.000",
                    selected = selectedService == "beli_baru",
                    onClick = { selectedService = "beli_baru" }
                )

                Spacer(modifier = Modifier.height(24.dp))
                
                Text("Detail Pengiriman", fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))
                
                KostHubTextField(value = name, onValueChange = { name = it }, label = "Nama Lengkap", placeholder = "Masukkan nama Anda")
                Spacer(modifier = Modifier.height(12.dp))
                KostHubTextField(value = wa, onValueChange = { wa = it }, label = "Nomor WhatsApp", placeholder = "08xxxxxxxxxx")
                Spacer(modifier = Modifier.height(12.dp))
                KostHubTextField(value = note, onValueChange = { note = it }, label = "Catatan Pengiriman", placeholder = "Contoh: Titip di Bapak Kos")

                Spacer(modifier = Modifier.height(24.dp))
                Divider()
                Spacer(modifier = Modifier.height(16.dp))

                Text("Ringkasan Pembayaran", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Subtotal", color = MaterialTheme.colorScheme.secondary)
                    Text("Rp 20.000", fontWeight = FontWeight.SemiBold)
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Biaya Pengiriman", color = MaterialTheme.colorScheme.secondary)
                    Text("Rp 5.000", fontWeight = FontWeight.SemiBold)
                }
                Spacer(modifier = Modifier.height(16.dp))
                Divider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                Spacer(modifier = Modifier.height(16.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Total Pembayaran Sementara", fontWeight = FontWeight.Bold)
                    Text("Rp 25.000", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 18.sp)
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
                
                Spacer(modifier = Modifier.height(32.dp)) // padding for bottom bar
            }
        }
    }
}

@Composable
fun ItemOptionCard(title: String, price: String, stock: String, selected: Boolean, onClick: () -> Unit) {
    val borderColor = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
    val bgColor = if (selected) MaterialTheme.colorScheme.primary.copy(alpha = 0.05f) else MaterialTheme.colorScheme.surface
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        border = BorderStroke(if (selected) 2.dp else 1.dp, borderColor),
        colors = CardDefaults.cardColors(containerColor = bgColor),
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(Color.LightGray, RoundedCornerShape(4.dp))
            ) // Placeholder for image
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold)
                Text(price, fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.padding(top = 4.dp)
                ) {
                    Text(stock, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            
            RadioButton(selected = selected, onClick = onClick, colors = RadioButtonDefaults.colors(selectedColor = MaterialTheme.colorScheme.primary))
        }
    }
}

@Composable
fun ServiceOptionCard(title: String, price: String, selected: Boolean, onClick: () -> Unit) {
    val borderColor = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
    val bgColor = if (selected) MaterialTheme.colorScheme.primary.copy(alpha = 0.05f) else MaterialTheme.colorScheme.surface
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        border = BorderStroke(if (selected) 2.dp else 1.dp, borderColor),
        colors = CardDefaults.cardColors(containerColor = bgColor),
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(title, fontWeight = FontWeight.Bold)
                Text(price, fontSize = 14.sp, color = MaterialTheme.colorScheme.secondary)
            }
            RadioButton(selected = selected, onClick = onClick, colors = RadioButtonDefaults.colors(selectedColor = MaterialTheme.colorScheme.primary))
        }
    }
}
