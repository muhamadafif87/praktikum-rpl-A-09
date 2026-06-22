package com.rpl.kosthub.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.rpl.kosthub.ui.components.AuthInterceptorDialog
import com.rpl.kosthub.ui.components.ProfileAvatar
import com.rpl.kosthub.data.model.Mitra
import com.rpl.kosthub.ui.screens.mitra.MitraListContent

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    isLoggedIn: Boolean,
    onNavigateToLogin: () -> Unit,
    onNavigateToRegister: () -> Unit,
    onNavigateToGasGalon: () -> Unit,
    onNavigateToLaundry: () -> Unit,
    onNavigateToDailyCleaning: () -> Unit,
    onNavigateToMap: () -> Unit,
    locationViewModel: com.rpl.kosthub.ui.screens.map.LocationViewModel,
    onLogout: () -> Unit,
    viewModel: HomeViewModel = viewModel()
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var selectedMitraFilter by remember { mutableStateOf("all") }
    var showAuthDialog by remember { mutableStateOf(false) }

    val terpopulerState by viewModel.terpopulerState.collectAsState()

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

    val handleServiceClick: (() -> Unit) -> Unit = { navigateAction ->
        if (isLoggedIn) navigateAction() else showAuthDialog = true
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = buildAnnotatedString {
                            withStyle(style = SpanStyle(color = MaterialTheme.colorScheme.onSurface)) { append("KostHub") }
                            withStyle(style = SpanStyle(color = MaterialTheme.colorScheme.primary)) { append(".") }
                        },
                        fontWeight = FontWeight.Bold
                    )
                },
                actions = {
                    if (isLoggedIn) {
                        ProfileAvatar(
                            initials = "VA",
                            modifier = Modifier.padding(end = 16.dp),
                            onClick = { selectedTab = 2 }
                        )
                    } else {
                        Spacer(modifier = Modifier.width(48.dp))
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Beranda") },
                    label = { Text("Beranda") },
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        unselectedIconColor = MaterialTheme.colorScheme.secondary,
                        indicatorColor = Color(0xFFF1F5F9)
                    )
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.List, contentDescription = "Layanan") },
                    label = { Text("Layanan") },
                    selected = selectedTab == 1,
                    onClick = { 
                        selectedMitraFilter = "all"
                        selectedTab = 1 
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        unselectedIconColor = MaterialTheme.colorScheme.secondary,
                        indicatorColor = Color(0xFFF1F5F9)
                    )
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Receipt, contentDescription = "Pesanan") },
                    label = { Text("Pesanan") },
                    selected = selectedTab == 2,
                    onClick = { 
                        if (isLoggedIn) selectedTab = 2 else showAuthDialog = true 
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        unselectedIconColor = MaterialTheme.colorScheme.secondary,
                        indicatorColor = Color(0xFFF1F5F9)
                    )
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Person, contentDescription = "Akun") },
                    label = { Text("Akun") },
                    selected = selectedTab == 3,
                    onClick = { 
                        if (isLoggedIn) selectedTab = 3 else showAuthDialog = true 
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        unselectedIconColor = MaterialTheme.colorScheme.secondary,
                        indicatorColor = Color(0xFFF1F5F9)
                    )
                )
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues).fillMaxSize()) {
            when (selectedTab) {
                0 -> HomeContent(
                    terpopulerState = terpopulerState,
                    onGasGalonClick = { 
                        selectedMitraFilter = "gas_galon"
                        selectedTab = 1 
                    },
                    onLaundryClick = { 
                        selectedMitraFilter = "laundry"
                        selectedTab = 1 
                    },
                    onCleaningClick = { 
                        selectedMitraFilter = "daily_cleaning"
                        selectedTab = 1 
                    },
                    onTerpopulerClick = { mitra -> 
                        val routeCategory = when (mitra.jenisJasa) {
                            "galon_gas", "gas", "galon" -> "gas_galon"
                            "laundry", "laundry_express" -> "laundry"
                            "cleaning", "daily_cleaning" -> "daily_cleaning"
                            else -> "gas_galon"
                        }
                        selectedMitraFilter = routeCategory
                        selectedTab = 1
                    },
                    onNavigateToMap = onNavigateToMap,
                    locationViewModel = locationViewModel
                )
                1 -> MitraListContent(
                    initialCategory = selectedMitraFilter,
                    isLoggedIn = isLoggedIn,
                    onNavigateToLogin = onNavigateToLogin,
                    onNavigateToRegister = onNavigateToRegister,
                    onNavigateToOrderForm = { _, category ->
                        when (category) {
                            "gas_galon", "gas", "galon" -> onNavigateToGasGalon()
                            "laundry", "laundry_express" -> onNavigateToLaundry()
                            "cleaning", "daily_cleaning" -> onNavigateToDailyCleaning()
                            else -> onNavigateToGasGalon()
                        }
                    },
                    onNavigateToMap = onNavigateToMap,
                    locationViewModel = locationViewModel
                )
                2 -> OrdersContent()
                3 -> com.rpl.kosthub.ui.screens.profile.ProfileScreen(
                    onNavigateToLogin = onNavigateToLogin,
                    onLogout = onLogout,
                    onNavigateToMap = onNavigateToMap,
                    locationViewModel = locationViewModel
                )
            }
        }
    }
}

@Composable
fun HomeContent(
    terpopulerState: UiState<List<Mitra>>,
    onGasGalonClick: () -> Unit,
    onLaundryClick: () -> Unit,
    onCleaningClick: () -> Unit,
    onTerpopulerClick: (mitra: Mitra) -> Unit,
    onNavigateToMap: () -> Unit,
    locationViewModel: com.rpl.kosthub.ui.screens.map.LocationViewModel
) {
    val locationState by locationViewModel.locationState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Greeting Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.primary,
                            MaterialTheme.colorScheme.tertiary
                        )
                    )
                )
                .padding(24.dp)
        ) {
            Column {
                Text(
                    text = "Halo, Selamat Datang!", 
                    fontSize = 20.sp, 
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Layanan terbaik untuk kebutuhan kos Anda.", 
                    color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f), 
                    fontSize = 14.sp
                )
            }
        }
        
        // Location Banner
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onNavigateToMap() },
            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = "Location",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text("Kirim ke:", fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                    Text(
                        text = if (locationState.isConfirmed && locationState.address.isNotEmpty()) locationState.address else "Belum Diatur - Pilih Lokasi",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (locationState.isConfirmed) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.error
                    )
                }
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = "Edit Lokasi",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Service Grid
        Surface(
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Menu Utama", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    ServiceGridItem(
                        title = "Gas & Galon",
                        icon = Icons.Default.LocalDrink,
                        containerColor = Color(0xFFE3F2FD),
                        iconColor = Color(0xFF1976D2),
                        onClick = onGasGalonClick
                    )
                    ServiceGridItem(
                        title = "Laundry",
                        icon = Icons.Default.LocalLaundryService,
                        containerColor = Color(0xFFFFF3E0),
                        iconColor = Color(0xFFF57C00),
                        onClick = onLaundryClick
                    )
                    ServiceGridItem(
                        title = "Cleaning",
                        icon = Icons.Default.CleaningServices,
                        containerColor = Color(0xFFE8F5E9),
                        iconColor = Color(0xFF388E3C),
                        onClick = onCleaningClick
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Promo Banners (Empty State)
        Surface(
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(vertical = 16.dp)) {
                Text("Promo Spesial", fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.padding(horizontal = 16.dp))
                Spacer(modifier = Modifier.height(12.dp))
                
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .height(120.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFFF5F5F5)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.LocalOffer, contentDescription = null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(32.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Belum Ada Promo Saat Ini",
                            color = MaterialTheme.colorScheme.secondary,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Popular Feed (From API)
        Surface(
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Layanan Terpopuler", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(12.dp))
                
                when (terpopulerState) {
                    is UiState.Loading -> {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally).padding(32.dp))
                    }
                    is UiState.Error -> {
                        Text(
                            text = "Gagal memuat layanan: ${(terpopulerState as UiState.Error).message}",
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                    is UiState.Success -> {
                        val popularItems = (terpopulerState as UiState.Success).data
                        if (popularItems.isEmpty()) {
                            Text("Belum ada layanan terpopuler.", color = MaterialTheme.colorScheme.secondary)
                        } else {
                            popularItems.forEachIndexed { index, mitra ->
                                Column(modifier = Modifier.clickable { onTerpopulerClick(mitra) }) {
                                    PopularItemRow(mitra)
                                }
                                if (index < popularItems.size - 1) {
                                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                                }
                            }
                        }
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
fun PopularItemRow(mitra: Mitra) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            // Placeholder if image fails or is null
            Text(mitra.namaMitra.take(1).uppercase(), color = MaterialTheme.colorScheme.onPrimaryContainer, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(mitra.namaMitra, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Text(mitra.jenisJasa.replace("_", " ").replaceFirstChar { it.uppercase() }, color = MaterialTheme.colorScheme.secondary, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Star, contentDescription = "Rating", tint = Color(0xFFFFC107), modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("${mitra.rating} (${mitra.jumlahUlasan} ulasan)", fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
            }
        }
        
        val lowestPrice = mitra.layanan.minOfOrNull { it.hargaSatuan } ?: 0.0
        if (lowestPrice > 0) {
            Column(horizontalAlignment = Alignment.End) {
                Text("Mulai", fontSize = 10.sp, color = MaterialTheme.colorScheme.secondary)
                Text("Rp${lowestPrice.toInt()}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 14.sp)
            }
        }
    }
}

@Composable
fun ServiceGridItem(
    title: String,
    icon: ImageVector,
    containerColor: Color,
    iconColor: Color,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(72.dp).clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .background(containerColor, RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = title, tint = iconColor)
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(title, fontSize = 12.sp, textAlign = TextAlign.Center, lineHeight = 14.sp)
    }
}

@Composable
fun OrdersContent() {
    Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background), contentAlignment = Alignment.Center) {
        Text("Pesanan Kosong", color = MaterialTheme.colorScheme.secondary)
    }
}


