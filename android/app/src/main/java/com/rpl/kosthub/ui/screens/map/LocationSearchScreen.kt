package com.rpl.kosthub.ui.screens.map

import android.preference.PreferenceManager
import android.view.MotionEvent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInteropFilter
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocationSearchScreen(
    onLocationConfirmed: (address: String, lat: Double, lng: Double) -> Unit,
    onBack: () -> Unit,
    initialLat: Double? = null,
    initialLng: Double? = null,
    searchViewModel: LocationSearchViewModel = viewModel()
) {
    val context = LocalContext.current
    val query by searchViewModel.query.collectAsState()
    val suggestions by searchViewModel.suggestions.collectAsState()
    val isLoading by searchViewModel.isLoading.collectAsState()

    var showMap by remember { mutableStateOf(initialLat != null && initialLng != null) }
    var pinLat by remember { mutableStateOf(initialLat ?: -7.5755) } // Solo Center
    var pinLng by remember { mutableStateOf(initialLng ?: 110.8237) }
    var selectedAddress by remember { mutableStateOf(if (initialLat != null) "Lokasi Tersimpan" else "") }
    
    val mapView = remember { MapView(context) }
    var currentCenter by remember { mutableStateOf(GeoPoint(pinLat, pinLng)) }

    DisposableEffect(Unit) {
        Configuration.getInstance().load(context, PreferenceManager.getDefaultSharedPreferences(context))
        mapView.setTileSource(TileSourceFactory.MAPNIK)
        mapView.setMultiTouchControls(true)
        mapView.controller.setZoom(17.0)
        mapView.controller.setCenter(currentCenter)
        
        onDispose {
            mapView.onDetach()
        }
    }

    // Only animate to map center when location is picked from SUGGESTIONS, 
    // not during manual map dragging.
    fun animateToLocation(lat: Double, lng: Double) {
        pinLat = lat
        pinLng = lng
        currentCenter = GeoPoint(lat, lng)
        mapView.controller.animateTo(currentCenter)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Cari Lokasi Kos", fontSize = 18.sp, fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).background(MaterialTheme.colorScheme.background)) {
            // Search Input
            Surface(
                color = MaterialTheme.colorScheme.surface,
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                shape = RoundedCornerShape(12.dp),
                shadowElevation = 2.dp
            ) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { 
                        searchViewModel.updateQuery(it)
                        showMap = false
                    },
                    placeholder = { Text("Ketik alamat di Solo...") },
                    leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
                    trailingIcon = {
                        if (isLoading) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedBorderColor = Color.Transparent,
                        focusedBorderColor = Color.Transparent
                    ),
                    singleLine = true
                )
            }

            // Suggestions List
            if (!showMap && suggestions.isNotEmpty()) {
                LazyColumn(modifier = Modifier.fillMaxWidth().weight(1f)) {
                    items(suggestions) { suggestion ->
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    val address = suggestion.name + if (suggestion.placeFormatted != null) ", ${suggestion.placeFormatted}" else ""
                                    searchViewModel.updateQuery(address)
                                    selectedAddress = address
                                    searchViewModel.retrieveCoordinates(suggestion.mapboxId) { lat, lng ->
                                        animateToLocation(lat, lng)
                                        showMap = true
                                    }
                                }
                                .padding(horizontal = 16.dp, vertical = 12.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Place, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(suggestion.name, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                                    if (suggestion.placeFormatted != null) {
                                        Text(suggestion.placeFormatted, fontSize = 12.sp, color = MaterialTheme.colorScheme.secondary)
                                    }
                                }
                            }
                        }
                        HorizontalDivider(color = MaterialTheme.colorScheme.surfaceVariant)
                    }
                }
            } else if (showMap) {
                // Map View — wrapped in a Box that intercepts touch so parent Column doesn't steal scroll
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(16.dp))
                ) {
                    AndroidView(
                        factory = { 
                            mapView.apply {
                                // Prevent parent from intercepting touch events on the map
                                setOnTouchListener { v, event ->
                                    when (event.action) {
                                        MotionEvent.ACTION_DOWN -> {
                                            v.parent?.requestDisallowInterceptTouchEvent(true)
                                        }
                                        MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                                            v.parent?.requestDisallowInterceptTouchEvent(false)
                                        }
                                    }
                                    false // Let the map handle the event itself
                                }
                                
                                addMapListener(object : org.osmdroid.events.MapListener {
                                    override fun onScroll(event: org.osmdroid.events.ScrollEvent?): Boolean {
                                        currentCenter = mapCenter as GeoPoint
                                        pinLat = currentCenter.latitude
                                        pinLng = currentCenter.longitude
                                        return true
                                    }
                                    override fun onZoom(event: org.osmdroid.events.ZoomEvent?): Boolean {
                                        currentCenter = mapCenter as GeoPoint
                                        return true
                                    }
                                })
                            }
                        },
                        modifier = Modifier.fillMaxSize()
                    )

                    // Center Pin Marker — Location pin (teardrop) shape
                    Box(
                        modifier = Modifier.align(Alignment.Center)
                    ) {
                        // Shadow/base dot
                        Box(
                            modifier = Modifier
                                .align(Alignment.Center)
                                .offset(y = 2.dp)
                                .size(8.dp)
                                .shadow(4.dp, CircleShape)
                                .background(Color.Black.copy(alpha = 0.25f), CircleShape)
                        )
                        // The pin icon itself — classic teardrop marker
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Pin Lokasi",
                            tint = Color(0xFFE53935), // vivid red
                            modifier = Modifier
                                .size(52.dp)
                                .offset(y = (-26).dp) // anchor the bottom tip to the center point
                        )
                    }
                    
                    // Banner Info
                    Surface(
                        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.align(Alignment.TopCenter).padding(8.dp)
                    ) {
                        Text(
                            "Geser peta untuk koordinat presisi",
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
                
                // Bottom Action
                Card(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(4.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Konfirmasi Lokasi", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(selectedAddress.ifEmpty { "Koordinat: ${String.format("%.5f", pinLat)}, ${String.format("%.5f", pinLng)}" }, fontSize = 14.sp, color = MaterialTheme.colorScheme.secondary, maxLines = 2)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { onLocationConfirmed(selectedAddress, pinLat, pinLng) },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Pilih Lokasi Ini")
                        }
                    }
                }
            } else {
                Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                    Text("Ketik nama jalan / area di Surakarta", color = MaterialTheme.colorScheme.secondary)
                }
            }
        }
    }
}
