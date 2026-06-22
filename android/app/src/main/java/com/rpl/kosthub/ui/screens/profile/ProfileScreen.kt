package com.rpl.kosthub.ui.screens.profile

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
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
import androidx.lifecycle.viewmodel.compose.viewModel
import com.rpl.kosthub.data.model.UpdateProfileRequest
import com.rpl.kosthub.data.model.User

@Composable
fun ProfileScreen(
    onNavigateToLogin: () -> Unit,
    onLogout: () -> Unit,
    onNavigateToMap: () -> Unit,
    viewModel: ProfileViewModel = viewModel(),
    locationViewModel: com.rpl.kosthub.ui.screens.map.LocationViewModel
) {
    val context = LocalContext.current
    val profileState by viewModel.profileState.collectAsState()
    val isUpdating by viewModel.isUpdating.collectAsState()
    val updateSuccess by viewModel.updateSuccess.collectAsState()

    var showEditDialog by remember { mutableStateOf(false) }
    var editName by remember { mutableStateOf("") }
    var editPhone by remember { mutableStateOf("") }

    val locationState by locationViewModel.locationState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.fetchProfile(context)
    }

    LaunchedEffect(updateSuccess) {
        if (updateSuccess) {
            Toast.makeText(context, "Profil berhasil diperbarui!", Toast.LENGTH_SHORT).show()
            viewModel.resetUpdateSuccess()
            showEditDialog = false
            
            // Sync location to viewmodel if profile has it
            val state = profileState
            if (state is ProfileState.Success) {
                val u = state.user
                val alamatVal = u.alamat
                if (!alamatVal.isNullOrEmpty() && u.latitude != null && u.longitude != null) {
                    locationViewModel.setLocation(alamatVal, u.latitude, u.longitude)
                }
            }
        }
    }

    // When the map pin is updated and confirmed, and user has returned to this screen,
    // if the address changed, we should auto update profile? 
    // Usually the user clicks "Save" but since the location picker returns immediately,
    // We can show a toast or a "Simpan" button. For simplicity, if they pick a location from Profile, 
    // it will be saved in Global state. We can auto sync.
    // However, the webapp syncs it on pressing "Simpan".
    // For Android, let's keep it simple: the address picked via map updates locationState.
    // If they want to save it to profile, they can press "Simpan Lokasi ke Profil".

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Surface(
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Profil Saya", fontSize = 20.sp, fontWeight = FontWeight.Bold)
            }
        }

        when (val state = profileState) {
            is ProfileState.Loading -> {
                Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            is ProfileState.Error -> {
                Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(state.message, color = MaterialTheme.colorScheme.error)
                        if (state.message == "Belum login") {
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(onClick = onNavigateToLogin) {
                                Text("Login Sekarang")
                            }
                        }
                    }
                }
            }
            is ProfileState.Success -> {
                val user = state.user
                
                // Profile Card
                Card(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(64.dp)
                                    .background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(32.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    user.namaLengkap.take(2).uppercase(),
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 24.sp
                                )
                            }
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(user.namaLengkap, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                                Text(user.email, fontSize = 14.sp, color = MaterialTheme.colorScheme.secondary)
                                if (!user.noTelepon.isNullOrEmpty()) {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(user.noTelepon, fontSize = 14.sp, color = MaterialTheme.colorScheme.primary)
                                }
                            }
                            IconButton(onClick = { 
                                editName = user.namaLengkap
                                editPhone = user.noTelepon ?: ""
                                showEditDialog = true 
                            }) {
                                Icon(Icons.Default.ChevronRight, contentDescription = "Edit Profil")
                            }
                        }
                    }
                }

                // Address Card
                Text("Alamat Tersimpan", modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary)
                Card(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).clickable { onNavigateToMap() },
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            if (locationState.isConfirmed) {
                                Text("Alamat Saat Ini", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                Text(locationState.address, fontSize = 14.sp, color = MaterialTheme.colorScheme.secondary)
                                
                                // Show save button if location in state differs from user DB
                                if (locationState.address != user.alamat || locationState.lat != user.latitude) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Button(
                                        onClick = {
                                            viewModel.updateProfile(
                                                context, 
                                                UpdateProfileRequest(
                                                    namaLengkap = user.namaLengkap,
                                                    noTelepon = user.noTelepon ?: "",
                                                    alamat = user.alamatKost ?: "",
                                                    latitude = locationState.lat,
                                                    longitude = locationState.lng,
                                                    addressDetail = locationState.address
                                                )
                                            ) {}
                                        },
                                        modifier = Modifier.height(36.dp),
                                        contentPadding = PaddingValues(horizontal = 16.dp)
                                    ) {
                                        Text("Simpan Lokasi ke Profil", fontSize = 12.sp)
                                    }
                                }
                            } else {
                                val userAlamat = user.alamat
                                if (!userAlamat.isNullOrEmpty()) {
                                    Text("Alamat Profil", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                    Text(userAlamat, fontSize = 14.sp, color = MaterialTheme.colorScheme.secondary)
                                } else {
                                    Text("Belum ada alamat", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                    Text("Klik untuk menambahkan lokasi kos Anda", fontSize = 12.sp, color = MaterialTheme.colorScheme.error)
                                }
                            }
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = "Pilih Lokasi", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
                
                // Logout Button
                Button(
                    onClick = onLogout,
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.errorContainer, contentColor = MaterialTheme.colorScheme.onErrorContainer)
                ) {
                    Icon(Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Keluar")
                }

                // Edit Profile Dialog
                if (showEditDialog) {
                    AlertDialog(
                        onDismissRequest = { showEditDialog = false },
                        title = { Text("Edit Profil") },
                        text = {
                            Column {
                                OutlinedTextField(
                                    value = editName,
                                    onValueChange = { editName = it },
                                    label = { Text("Nama Lengkap") },
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                OutlinedTextField(
                                    value = editPhone,
                                    onValueChange = { editPhone = it },
                                    label = { Text("Nomor WhatsApp") },
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }
                        },
                        confirmButton = {
                            Button(
                                onClick = {
                                    viewModel.updateProfile(
                                        context,
                                        UpdateProfileRequest(
                                            namaLengkap = editName,
                                            noTelepon = editPhone,
                                            alamat = user.alamatKost ?: "",
                                            latitude = user.latitude,
                                            longitude = user.longitude,
                                            addressDetail = user.addressDetail
                                        )
                                    ) {}
                                },
                                enabled = !isUpdating
                            ) {
                                if (isUpdating) {
                                    CircularProgressIndicator(modifier = Modifier.size(16.dp), color = MaterialTheme.colorScheme.onPrimary)
                                } else {
                                    Text("Simpan")
                                }
                            }
                        },
                        dismissButton = {
                            TextButton(onClick = { showEditDialog = false }) {
                                Text("Batal")
                            }
                        }
                    )
                }
            }
        }
    }
}
