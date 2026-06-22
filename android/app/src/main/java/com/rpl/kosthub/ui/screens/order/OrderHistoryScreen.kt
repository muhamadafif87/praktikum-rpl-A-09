package com.rpl.kosthub.ui.screens.order

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.rpl.kosthub.data.model.OrderItem
import com.rpl.kosthub.ui.screens.home.UiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderHistoryScreen(
    viewModel: OrderHistoryViewModel = viewModel()
) {
    val context = LocalContext.current
    val ordersState by viewModel.ordersState.collectAsState()
    val statusFilter by viewModel.statusFilter.collectAsState()
    val isLoadingMore by viewModel.isLoadingMore.collectAsState()
    val meta by viewModel.meta.collectAsState()
    val actionMessage by viewModel.actionMessage.collectAsState()

    // Show toast for action results
    LaunchedEffect(actionMessage) {
        actionMessage?.let {
            Toast.makeText(context, it, Toast.LENGTH_SHORT).show()
            viewModel.clearActionMessage()
        }
    }

    // Rating dialog state
    var showRatingDialog by remember { mutableStateOf(false) }
    var ratingOrderId by remember { mutableStateOf("") }

    // Confirmation dialog state
    var showConfirmDialog by remember { mutableStateOf(false) }
    var confirmAction by remember { mutableStateOf<ConfirmAction?>(null) }



    // Filter options
    val filterOptions = listOf(
        null to "Semua",
        "pending" to "Pending",
        "diproses" to "Diproses",
        "selesai" to "Selesai",
        "dibatalkan" to "Dibatalkan"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Surface(
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Pesanan Saya",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(
                        onClick = { viewModel.refreshOrders() },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }

                // Status filter chips
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(bottom = 12.dp)
                ) {
                    items(filterOptions) { (status, label) ->
                        FilterChip(
                            selected = statusFilter == status,
                            onClick = { viewModel.setStatusFilter(status) },
                            label = { Text(label, fontSize = 13.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                            ),
                            shape = RoundedCornerShape(20.dp)
                        )
                    }
                }
            }
        }

        // Content
        Box(
            modifier = Modifier.fillMaxSize()
        ) {
            when (val state = ordersState) {
                is UiState.Loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(
                                color = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                "Memuat riwayat pesanan...",
                                color = MaterialTheme.colorScheme.secondary,
                                fontSize = 14.sp
                            )
                        }
                    }
                }

                is UiState.Error -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(32.dp)
                        ) {
                            Icon(
                                Icons.Default.ErrorOutline,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                state.message,
                                color = MaterialTheme.colorScheme.error,
                                textAlign = TextAlign.Center,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(onClick = { viewModel.refreshOrders() }) {
                                Text("Coba Lagi")
                            }
                        }
                    }
                }

                is UiState.Success -> {
                    if (state.data.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.padding(32.dp)
                            ) {
                                Icon(
                                    Icons.Default.Receipt,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.secondary,
                                    modifier = Modifier.size(64.dp)
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Text(
                                    "Belum Ada Pesanan",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 18.sp
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    if (statusFilter != null) "Tidak ada pesanan dengan status ini."
                                    else "Anda belum memiliki riwayat pesanan.",
                                    color = MaterialTheme.colorScheme.secondary,
                                    textAlign = TextAlign.Center,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    } else {
                        val listState = rememberLazyListState()

                        // Detect when we reach the end for infinite scroll
                        val shouldLoadMore = remember {
                            derivedStateOf {
                                val lastVisibleItem = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
                                val totalItems = listState.layoutInfo.totalItemsCount
                                lastVisibleItem >= totalItems - 2
                            }
                        }

                        LaunchedEffect(shouldLoadMore.value) {
                            if (shouldLoadMore.value && !isLoadingMore) {
                                viewModel.loadNextPage()
                            }
                        }

                        LazyColumn(
                            state = listState,
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(
                                items = state.data,
                                key = { it.idUniquePesanan }
                            ) { order ->
                                OrderCard(
                                    order = order,
                                    onCancel = {
                                        confirmAction = ConfirmAction.Cancel(order.idUniquePesanan)
                                        showConfirmDialog = true
                                    },
                                    onComplete = {
                                        confirmAction = ConfirmAction.Complete(order.idUniquePesanan)
                                        showConfirmDialog = true
                                    },
                                    onRate = {
                                        ratingOrderId = order.idUniquePesanan
                                        showRatingDialog = true
                                    }
                                )
                            }

                            // Loading more indicator
                            if (isLoadingMore) {
                                item {
                                    Box(
                                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(24.dp),
                                            strokeWidth = 2.dp
                                        )
                                    }
                                }
                            }

                            // End of list indicator
                            val metaVal = meta
                            if (metaVal != null && metaVal.currentPage >= metaVal.lastPage && state.data.isNotEmpty()) {
                                item {
                                    Text(
                                        "Semua pesanan telah ditampilkan",
                                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                                        textAlign = TextAlign.Center,
                                        color = MaterialTheme.colorScheme.secondary,
                                        fontSize = 12.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }

        }
    }

    // ── Confirmation Dialog ─────────────────────────────────────────────

    if (showConfirmDialog && confirmAction != null) {
        AlertDialog(
            onDismissRequest = { showConfirmDialog = false },
            icon = {
                Icon(
                    when (confirmAction) {
                        is ConfirmAction.Cancel -> Icons.Default.Cancel
                        is ConfirmAction.Complete -> Icons.Default.CheckCircle
                        else -> Icons.Default.Info
                    },
                    contentDescription = null,
                    tint = when (confirmAction) {
                        is ConfirmAction.Cancel -> MaterialTheme.colorScheme.error
                        is ConfirmAction.Complete -> Color(0xFF388E3C)
                        else -> MaterialTheme.colorScheme.primary
                    }
                )
            },
            title = {
                Text(
                    when (confirmAction) {
                        is ConfirmAction.Cancel -> "Batalkan Pesanan?"
                        is ConfirmAction.Complete -> "Selesaikan Pesanan?"
                        else -> ""
                    }
                )
            },
            text = {
                Text(
                    when (confirmAction) {
                        is ConfirmAction.Cancel -> "Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan."
                        is ConfirmAction.Complete -> "Apakah Anda yakin ingin mengonfirmasi bahwa layanan telah selesai?"
                        else -> ""
                    }
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        when (val action = confirmAction) {
                            is ConfirmAction.Cancel -> viewModel.cancelOrder(action.orderId)
                            is ConfirmAction.Complete -> viewModel.completeOrder(action.orderId)
                            else -> {}
                        }
                        showConfirmDialog = false
                    },
                    colors = when (confirmAction) {
                        is ConfirmAction.Cancel -> ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.error
                        )
                        else -> ButtonDefaults.buttonColors()
                    }
                ) {
                    Text(
                        when (confirmAction) {
                            is ConfirmAction.Cancel -> "Ya, Batalkan"
                            is ConfirmAction.Complete -> "Ya, Selesai"
                            else -> "OK"
                        }
                    )
                }
            },
            dismissButton = {
                TextButton(onClick = { showConfirmDialog = false }) {
                    Text("Tidak")
                }
            }
        )
    }

    // ── Rating Dialog ───────────────────────────────────────────────────

    if (showRatingDialog) {
        RatingDialog(
            onDismiss = { showRatingDialog = false },
            onSubmit = { rating, komentar ->
                viewModel.submitReview(ratingOrderId, rating, komentar)
                showRatingDialog = false
            }
        )
    }
}

// ── Sealed class for confirm actions ────────────────────────────────────────

private sealed class ConfirmAction {
    data class Cancel(val orderId: String) : ConfirmAction()
    data class Complete(val orderId: String) : ConfirmAction()
}

// ── Order Card Composable ───────────────────────────────────────────────────

@Composable
private fun OrderCard(
    order: OrderItem,
    onCancel: () -> Unit,
    onComplete: () -> Unit,
    onRate: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column {
            // ── Header: Mitra name + status badge ───────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        Icons.Default.Store,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = order.mitra?.namaMitra ?: "Mitra Tidak Diketahui",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                StatusBadge(status = order.statusPesanan)
            }

            // ── Body: Order details ─────────────────────────────────────
            Column(modifier = Modifier.padding(16.dp)) {
                // Date
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.CalendarToday,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.secondary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = formatDate(order.tglPesanan),
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }

                // Service type
                if (order.mitra?.jenisJasa != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Category,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.secondary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = order.mitra.jenisJasa
                                .replace("_", " ")
                                .replaceFirstChar { it.uppercase() },
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                Spacer(modifier = Modifier.height(12.dp))

                // Detail items
                order.detailLayanan.forEach { detail ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "${detail.jumlah}x ${detail.namaLayanan}",
                            fontSize = 14.sp,
                            modifier = Modifier.weight(1f)
                        )
                        Text(
                            text = formatCurrency(detail.subtotal),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                }

                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                Spacer(modifier = Modifier.height(8.dp))

                // Total
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Total Pembayaran",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        formatCurrency(order.totalPembayaran),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            // ── Footer: ID + Actions ────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.15f))
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "ID: ${order.idUniquePesanan}",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.secondary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )

                Spacer(modifier = Modifier.width(8.dp))

                // Action buttons based on status
                when (order.statusPesanan) {
                    "pending" -> {
                        OutlinedButton(
                            onClick = onCancel,
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = MaterialTheme.colorScheme.error
                            ),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp, MaterialTheme.colorScheme.error
                            ),
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 0.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Text("Batalkan", fontSize = 12.sp)
                        }
                    }

                    "diproses" -> {
                        Button(
                            onClick = onComplete,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF388E3C)
                            ),
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 0.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Text("Pesanan Selesai", fontSize = 12.sp)
                        }
                    }

                    "selesai" -> {
                        if (order.ulasan != null) {
                            // Already reviewed badge
                            Surface(
                                color = Color(0xFFFFF8E1),
                                shape = RoundedCornerShape(16.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.Star,
                                        contentDescription = null,
                                        tint = Color(0xFFFFC107),
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        "${order.ulasan.rating}/5",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFF57C00)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        "Dinilai",
                                        fontSize = 12.sp,
                                        color = Color(0xFFF57C00)
                                    )
                                }
                            }
                        } else {
                            Button(
                                onClick = onRate,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary
                                ),
                                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 0.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Icon(
                                    Icons.Default.Star,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Beri Penilaian", fontSize = 12.sp)
                            }
                        }
                    }
                    // "dibatalkan" -> no action button
                }
            }
        }
    }
}

// ── Status Badge ────────────────────────────────────────────────────────────

@Composable
private fun StatusBadge(status: String) {
    val (bgColor, textColor, label) = when (status) {
        "pending" -> Triple(Color(0xFFFFF3E0), Color(0xFFF57C00), "PENDING")
        "diproses" -> Triple(Color(0xFFE3F2FD), Color(0xFF1976D2), "DIPROSES")
        "selesai" -> Triple(Color(0xFFE8F5E9), Color(0xFF388E3C), "SELESAI")
        "dibatalkan" -> Triple(Color(0xFFFFEBEE), Color(0xFFD32F2F), "DIBATALKAN")
        else -> Triple(Color(0xFFF5F5F5), Color(0xFF757575), status.uppercase())
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(12.dp)
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = textColor
        )
    }
}

// ── Rating Dialog ───────────────────────────────────────────────────────────

@Composable
private fun RatingDialog(
    onDismiss: () -> Unit,
    onSubmit: (rating: Int, komentar: String?) -> Unit
) {
    var rating by remember { mutableIntStateOf(0) }
    var komentar by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                Text("Beri Penilaian", fontWeight = FontWeight.Bold)
                Text(
                    "Bagaimana pengalamanmu dengan layanan ini?",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.secondary,
                    textAlign = TextAlign.Center
                )
            }
        },
        text = {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                if (error != null) {
                    Surface(
                        color = MaterialTheme.colorScheme.errorContainer,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            error!!,
                            modifier = Modifier.padding(12.dp),
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            fontSize = 13.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Star rating
                Row(
                    horizontalArrangement = Arrangement.Center,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    for (star in 1..5) {
                        IconButton(onClick = { rating = star }) {
                            Icon(
                                if (star <= rating) Icons.Default.Star else Icons.Default.StarBorder,
                                contentDescription = "Star $star",
                                tint = if (star <= rating) Color(0xFFFFC107) else MaterialTheme.colorScheme.outlineVariant,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = komentar,
                    onValueChange = { komentar = it },
                    label = { Text("Komentar (Opsional)") },
                    placeholder = { Text("Ceritakan pengalamanmu...") },
                    modifier = Modifier.fillMaxWidth().height(120.dp),
                    maxLines = 4,
                    shape = RoundedCornerShape(8.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (rating == 0) {
                        error = "Silakan berikan rating bintang terlebih dahulu."
                    } else {
                        onSubmit(rating, komentar.ifEmpty { null })
                    }
                }
            ) {
                Text("Kirim Penilaian")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Batal")
            }
        }
    )
}

// ── Helper Functions ────────────────────────────────────────────────────────

private fun formatCurrency(amount: Double?): String {
    if (amount == null) return "Rp 0"
    return "Rp ${String.format("%,.0f", amount).replace(',', '.')}"
}

private fun formatDate(dateString: String?): String {
    if (dateString.isNullOrEmpty()) return "-"
    return try {
        val inputFormat = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale("id", "ID"))
        // Try with milliseconds first
        val inputFormatMs = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'", java.util.Locale("id", "ID"))
        val outputFormat = java.text.SimpleDateFormat("d MMMM yyyy, HH:mm", java.util.Locale("id", "ID"))

        val date = try {
            inputFormatMs.parse(dateString)
        } catch (_: Exception) {
            try {
                inputFormat.parse(dateString)
            } catch (_: Exception) {
                // Try plain date format
                java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale("id", "ID")).parse(dateString)
            }
        }

        if (date != null) outputFormat.format(date) else dateString
    } catch (_: Exception) {
        dateString
    }
}
