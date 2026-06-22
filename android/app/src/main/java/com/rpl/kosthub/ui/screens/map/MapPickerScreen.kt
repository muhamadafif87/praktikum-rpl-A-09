package com.rpl.kosthub.ui.screens.map

import android.preference.PreferenceManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.MyLocation
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
import androidx.compose.ui.viewinterop.AndroidView
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapPickerScreen(
    onLocationSelected: (lat: Double, lng: Double) -> Unit,
    onBack: () -> Unit,
    initialLat: Double? = null,
    initialLng: Double? = null
) {
    val context = LocalContext.current
    val mapView = remember { MapView(context) }
    var currentCenter by remember { mutableStateOf(GeoPoint(initialLat ?: -7.28, initialLng ?: 112.79)) } // Default to Surabaya (ITS)

    DisposableEffect(Unit) {
        Configuration.getInstance().load(context, PreferenceManager.getDefaultSharedPreferences(context))
        mapView.setTileSource(TileSourceFactory.MAPNIK)
        mapView.setMultiTouchControls(true)
        mapView.controller.setZoom(15.0)
        mapView.controller.setCenter(currentCenter)
        
        onDispose {
            mapView.onDetach()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pilih Lokasi", fontSize = 18.sp, fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            AndroidView(
                factory = { 
                    mapView.apply {
                        // Listener for map movement
                        addMapListener(object : org.osmdroid.events.MapListener {
                            override fun onScroll(event: org.osmdroid.events.ScrollEvent?): Boolean {
                                currentCenter = mapCenter as GeoPoint
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

            // Center Pin Marker
            Box(
                modifier = Modifier.align(Alignment.Center)
            ) {
                Icon(
                    imageVector = Icons.Default.MyLocation,
                    contentDescription = "Pin Location",
                    tint = Color.Red,
                    modifier = Modifier.size(48.dp).offset(y = (-24).dp)
                )
            }

            // Bottom Confirmation Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .padding(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(8.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Koordinat Terpilih:", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "${String.format("%.5f", currentCenter.latitude)}, ${String.format("%.5f", currentCenter.longitude)}", 
                        fontSize = 14.sp, 
                        color = MaterialTheme.colorScheme.secondary
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { onLocationSelected(currentCenter.latitude, currentCenter.longitude) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = androidx.compose.foundation.shape.RoundedCornerShape(8.dp)
                    ) {
                        Text("Konfirmasi Lokasi", modifier = Modifier.padding(vertical = 4.dp))
                    }
                }
            }
        }
    }
}
