package com.rpl.kosthub.ui.screens.mitra

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.rpl.kosthub.data.model.Mitra
import com.rpl.kosthub.ui.components.AuthInterceptorDialog
import com.rpl.kosthub.ui.screens.home.UiState

@Composable
fun MitraListContent(
    initialCategory: String,
    isLoggedIn: Boolean,
    onNavigateToLogin: () -> Unit,
    onNavigateToRegister: () -> Unit,
    onNavigateToOrderForm: (mitraId: Int, category: String) -> Unit,
    onNavigateToMap: () -> Unit,
    locationViewModel: com.rpl.kosthub.ui.screens.map.LocationViewModel,
    viewModel: MitraListViewModel = viewModel()
) {
    var showAuthDialog by remember { mutableStateOf(false) }
    var selectedMitraId by remember { mutableStateOf<Int?>(null) }
    var selectedMitraCategory by remember { mutableStateOf<String>("") }
    
    // Filter state
    var currentFilter by remember { mutableStateOf(initialCategory) }

    val mitraState by viewModel.mitraState.collectAsState()
    val locationState by locationViewModel.locationState.collectAsState()

    // Fetch when location changes
    LaunchedEffect(locationState.lat, locationState.lng) {
        viewModel.fetchAllMitras(locationState.lat, locationState.lng)
    }
    
    // Update filter if initialCategory prop changes from external navigation
    LaunchedEffect(initialCategory) {
        currentFilter = initialCategory
    }

    if (showAuthDialog) {
        AuthInterceptorDialog(
            onDismiss = { showAuthDialog = false },
            onLoginClick = { 
                showAuthDialog = false
                onNavigateToLogin()
            },
            onRegisterClick = {
                showAuthDialog = false
                onNavigateToRegister()
            }
        )
    }

    val handleOrderClick = { mitra: Mitra ->
        if (isLoggedIn) {
            onNavigateToOrderForm(mitra.idMitra, mitra.jenisJasa)
        } else {
            selectedMitraId = mitra.idMitra
            selectedMitraCategory = mitra.jenisJasa
            showAuthDialog = true
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Surface(
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Daftar Layanan Mitra", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Temukan berbagai layanan untuk kebutuhan kost Anda", color = MaterialTheme.colorScheme.secondary, fontSize = 14.sp)
            }
        }
        
        // Filter Chips
        val filters = listOf(
            "all" to "Semua", 
            "gas_galon" to "Gas & Galon", 
            "laundry" to "Laundry", 
            "daily_cleaning" to "Cleaning"
        )
        
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filters) { filter ->
                val isSelected = currentFilter == filter.first
                Surface(
                    modifier = Modifier.clickable { currentFilter = filter.first },
                    shape = RoundedCornerShape(20.dp),
                    color = if (isSelected) MaterialTheme.colorScheme.primary else Color(0xFFF1F5F9),
                    contentColor = if (isSelected) MaterialTheme.colorScheme.onPrimary else Color(0xFF64748B)
                ) {
                    Text(
                        text = filter.second,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        fontSize = 14.sp
                    )
                }
            }
        }

        // Hard Lock Content
        if (!locationState.isConfirmed) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = "Lokasi",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.secondary.copy(alpha = 0.5f)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Lokasi Belum Diatur",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Pilih lokasi terlebih dahulu di halaman Beranda untuk melihat daftar layanan dan jarak ke Mitra KostHub.",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.secondary,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(onClick = onNavigateToMap, shape = RoundedCornerShape(8.dp)) {
                        Text("Pilih Lokasi Sekarang")
                    }
                }
            }
        } else {
            // List
            when (mitraState) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                is UiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(
                            text = "Gagal memuat: ${(mitraState as UiState.Error).message}",
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
                is UiState.Success -> {
                    val mitras = (mitraState as UiState.Success).data
                    val filteredMitras = if (currentFilter == "all") mitras else mitras.filter { 
                        when(currentFilter) {
                            "gas_galon" -> it.jenisJasa in listOf("gas", "galon", "galon_gas")
                            "laundry" -> it.jenisJasa in listOf("laundry", "laundry_express")
                            "daily_cleaning" -> it.jenisJasa in listOf("cleaning", "daily_cleaning")
                            else -> true
                        }
                    }
                    
                    if (filteredMitras.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text(
                                text = "Belum ada mitra untuk kategori ini.",
                                color = MaterialTheme.colorScheme.secondary
                            )
                        }
                    } else {
                        LazyColumn(
                            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 16.dp),
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            items(filteredMitras) { mitra ->
                                MitraCardItem(
                                    mitra = mitra,
                                    locationState = locationState,
                                    onAturLokasi = onNavigateToMap,
                                    onOrderClick = { handleOrderClick(mitra) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MitraCardItem(
    mitra: Mitra, 
    locationState: com.rpl.kosthub.ui.screens.map.LocationState,
    onAturLokasi: () -> Unit,
    onOrderClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        mitra.namaMitra.take(1).uppercase(),
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(mitra.namaMitra, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        // Jangkauan badge
                        if (locationState.isConfirmed && mitra.jarakKm != null) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (mitra.isDalamJangkauan == true) Color(0xFFDCFCE7) else Color(0xFFFEE2E2)
                            ) {
                                Text(
                                    text = if (mitra.isDalamJangkauan == true) "Dalam jangkauan (${String.format("%.1f", mitra.jarakKm)} KM)" else "Di luar jangkauan (${String.format("%.1f", mitra.jarakKm)} KM)",
                                    fontSize = 10.sp,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                    color = if (mitra.isDalamJangkauan == true) Color(0xFF166534) else Color(0xFF991B1B)
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Star, contentDescription = "Rating", tint = Color(0xFFFFC107), modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("${mitra.rating} (${mitra.jumlahUlasan} ulasan)", fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                mitra.deskripsi ?: "Mitra KostHub terpercaya",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                val lowestPrice = mitra.layanan.minOfOrNull { it.hargaSatuan } ?: 0.0
                if (lowestPrice > 0) {
                    Column {
                        Text("Mulai dari", fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                        Text("Rp${lowestPrice.toInt()}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 16.sp)
                    }
                } else {
                    Spacer(modifier = Modifier.width(8.dp))
                }
                
                val isLocationSet = locationState.isConfirmed
                val isDalamJangkauan = mitra.isDalamJangkauan != false // null or true means it's available, false means out of range
                
                Button(
                    onClick = {
                        if (!isLocationSet) {
                            onAturLokasi()
                        } else if (isDalamJangkauan) {
                            onOrderClick()
                        }
                    },
                    enabled = !isLocationSet || isDalamJangkauan,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Text(
                        text = if (!isLocationSet) "Atur Lokasi" else if (!isDalamJangkauan) "Di Luar Jangkauan" else "Pesan Sekarang", 
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}
