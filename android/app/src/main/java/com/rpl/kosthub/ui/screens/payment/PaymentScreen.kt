package com.rpl.kosthub.ui.screens.payment

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rpl.kosthub.ui.components.PrimaryButton
import com.rpl.kosthub.ui.components.Stepper
import com.rpl.kosthub.ui.screens.order.MockPaymentState
import com.rpl.kosthub.ui.screens.order.PesananDetailState
import android.widget.Toast
import androidx.compose.ui.platform.LocalContext

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentScreen(
    idPesanan: String,
    orderViewModel: com.rpl.kosthub.ui.screens.order.OrderViewModel,
    onNavigateBack: () -> Unit,
    onPaymentSuccess: () -> Unit
) {
    val context = LocalContext.current
    var selectedMethod by remember { mutableStateOf("qris") }
    val mockPaymentState by orderViewModel.mockPaymentState.collectAsState()
    val pesananDetailState by orderViewModel.pesananDetailState.collectAsState()

    // Fetch pesanan detail saat layar pertama kali ditampilkan
    LaunchedEffect(idPesanan) {
        orderViewModel.fetchPesananDetail(idPesanan)
    }

    LaunchedEffect(mockPaymentState) {
        if (mockPaymentState is MockPaymentState.Success) {
            Toast.makeText(context, (mockPaymentState as MockPaymentState.Success).message, Toast.LENGTH_SHORT).show()
            orderViewModel.resetMockPaymentState()
            onPaymentSuccess()
        } else if (mockPaymentState is MockPaymentState.Error) {
            Toast.makeText(context, (mockPaymentState as MockPaymentState.Error).message, Toast.LENGTH_SHORT).show()
            orderViewModel.resetMockPaymentState()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pembayaran", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        bottomBar = {
            Box(modifier = Modifier.padding(16.dp)) {
                PrimaryButton(
                    text = if (mockPaymentState is MockPaymentState.Loading) "Memproses..." else "Bayar Sekarang →",
                    onClick = { orderViewModel.performMockPayment(idPesanan) },
                    enabled = mockPaymentState !is MockPaymentState.Loading && pesananDetailState is PesananDetailState.Success
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
                Stepper(currentStep = 3, currentStepLabel = "Pembayaran")
            }

            when (pesananDetailState) {
                is PesananDetailState.Loading, PesananDetailState.Idle -> {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(64.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }

                is PesananDetailState.Error -> {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.ErrorOutline,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                (pesananDetailState as PesananDetailState.Error).message,
                                color = MaterialTheme.colorScheme.error,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            OutlinedButton(onClick = { orderViewModel.fetchPesananDetail(idPesanan) }) {
                                Text("Coba Lagi")
                            }
                        }
                    }
                }

                is PesananDetailState.Success -> {
                    val detail = (pesananDetailState as PesananDetailState.Success).data

                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Pembayaran",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "ID Pesanan: $idPesanan",
                            color = MaterialTheme.colorScheme.secondary,
                            fontSize = 12.sp,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Selesaikan transaksi Anda dengan memilih metode pembayaran di bawah ini.",
                            color = MaterialTheme.colorScheme.secondary,
                            fontSize = 14.sp,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        // Info Mitra & Layanan
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(8.dp)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        val icon = when (detail.mitra.jenisJasa) {
                                            "laundry", "laundry_express" -> Icons.Default.LocalLaundryService
                                            "gas", "galon", "galon_gas" -> Icons.Default.LocalFireDepartment
                                            "cleaning", "daily_cleaning" -> Icons.Default.CleaningServices
                                            else -> Icons.Default.Store
                                        }
                                        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text(detail.mitra.namaMitra, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                        Text(
                                            detail.mitra.jenisJasa.replace("_", " ").replaceFirstChar { it.uppercase() },
                                            fontSize = 12.sp,
                                            color = MaterialTheme.colorScheme.secondary
                                        )
                                    }
                                }

                                if (detail.detailLayanan.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(12.dp))
                                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Text("Item Pesanan:", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    detail.detailLayanan.forEach { item ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                "${item.jumlah}x ${item.namaLayanan}",
                                                fontSize = 13.sp,
                                                color = MaterialTheme.colorScheme.secondary,
                                                modifier = Modifier.weight(1f)
                                            )
                                            Text(
                                                "Rp ${"%,d".format(item.subtotal).replace(",", ".")}",
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Data Pelanggan
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Data Pelanggan", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Spacer(modifier = Modifier.height(16.dp))

                                CustomerDataRow(Icons.Default.Person, "Nama", detail.user.namaLengkap)
                                Spacer(modifier = Modifier.height(12.dp))
                                CustomerDataRow(Icons.Default.Phone, "Nomor Telepon", detail.user.nomorTelepon)
                                if (!detail.catatanPengiriman.isNullOrBlank()) {
                                    Spacer(modifier = Modifier.height(12.dp))
                                    CustomerDataRow(Icons.Default.LocationOn, "Alamat & Catatan", detail.catatanPengiriman)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Text("Pilih Metode Pembayaran", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(8.dp))

                        PaymentOptionCard(
                            title = "QRIS",
                            description = "Bayar instan dengan aplikasi bank atau e-wallet (GoPay, OVO, ShopeePay).",
                            icon = Icons.Default.QrCode,
                            selected = selectedMethod == "qris",
                            onClick = { selectedMethod = "qris" }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        PaymentOptionCard(
                            title = "Kartu Kredit/Debit",
                            description = "Visa, Mastercard, atau GPN.",
                            icon = Icons.Default.CreditCard,
                            selected = selectedMethod == "card",
                            onClick = { selectedMethod = "card" }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        PaymentOptionCard(
                            title = "Cash (Tunai)",
                            description = "Bayar langsung ke kurir saat pesanan tiba.",
                            icon = Icons.Default.Money,
                            selected = selectedMethod == "cash",
                            onClick = { selectedMethod = "cash" },
                            extraLabel = "Mohon siapkan uang pas"
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        // Ringkasan Pembayaran
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Ringkasan Pembayaran", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Spacer(modifier = Modifier.height(12.dp))

                                val rb = detail.ringkasanBiaya

                                // Subtotal
                                if (rb.subtotal != null) {
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Subtotal", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                                        Text("Rp ${"%,d".format(rb.subtotal).replace(",", ".")}", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                }

                                // Ongkir
                                if (rb.biayaOngkir != null && rb.biayaOngkir > 0) {
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Biaya Pengiriman", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                                        Text("Rp ${"%,d".format(rb.biayaOngkir).replace(",", ".")}", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                }

                                // Biaya alat (Daily Cleaning)
                                if (rb.biayaTambahanAlat != null && rb.biayaTambahanAlat > 0) {
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Biaya Alat Tambahan", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                                        Text("Rp ${"%,d".format(rb.biayaTambahanAlat).replace(",", ".")}", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                }

                                // Biaya aplikasi
                                if (rb.biayaAplikasi != null) {
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Biaya Layanan Aplikasi", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
                                        Text("Rp ${"%,d".format(rb.biayaAplikasi).replace(",", ".")}", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                    }
                                }

                                Spacer(modifier = Modifier.height(16.dp))
                                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                                Spacer(modifier = Modifier.height(16.dp))

                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Total Pembayaran", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Text(
                                        if (rb.totalPembayaran != null) "Rp ${"%,d".format(rb.totalPembayaran).replace(",", ".")}" else "-",
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary,
                                        fontSize = 20.sp
                                    )
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
                            }
                        }

                        Spacer(modifier = Modifier.height(32.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun CustomerDataRow(icon: ImageVector, label: String, value: String) {
    Row(verticalAlignment = Alignment.Top) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(label, fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
            Text(value, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
fun PaymentOptionCard(
    title: String,
    description: String,
    icon: ImageVector,
    selected: Boolean,
    onClick: () -> Unit,
    extraLabel: String? = null
) {
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
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceContainer, RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.secondary)
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold)
                Text(description, fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                if (extraLabel != null) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.padding(top = 8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)) {
                            Icon(Icons.Outlined.Info, contentDescription = null, modifier = Modifier.size(10.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(extraLabel, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }

            RadioButton(selected = selected, onClick = onClick, colors = RadioButtonDefaults.colors(selectedColor = MaterialTheme.colorScheme.primary))
        }
    }
}
