package com.rpl.kosthub.ui.screens.auth

import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rpl.kosthub.ui.components.KostHubTextField
import com.rpl.kosthub.ui.components.PrimaryButton
import com.rpl.kosthub.data.model.LoginRequest
import com.rpl.kosthub.data.remote.RetrofitClient
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onNavigateToRegister: () -> Unit,
    onLoginSuccess: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    var emailOrWa by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(48.dp))

        // KostHub Logo
        Text(
            text = buildAnnotatedString {
                withStyle(style = SpanStyle(color = MaterialTheme.colorScheme.onSurface)) {
                    append("KostHub")
                }
                withStyle(style = SpanStyle(color = MaterialTheme.colorScheme.primary)) {
                    append(".")
                }
            },
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(48.dp))

        Column(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = "Selamat Datang\nKembali",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                lineHeight = 40.sp
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Silakan masuk ke akun Anda",
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.secondary
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        KostHubTextField(
            value = emailOrWa,
            onValueChange = { emailOrWa = it },
            label = "Email atau Nomor WhatsApp",
            placeholder = "Masukkan email atau nomor WA",
            leadingIcon = Icons.Default.Person
        )

        Spacer(modifier = Modifier.height(16.dp))

        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Kata Sandi",
                    style = MaterialTheme.typography.labelMedium
                )
                Text(
                    text = "Lupa Kata Sandi?",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.clickable { /* Handle forgot password */ }
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            KostHubTextField(
                value = password,
                onValueChange = { password = it },
                label = "", // Handled above
                placeholder = "Masukkan kata sandi",
                leadingIcon = Icons.Default.Lock,
                visualTransformation = PasswordVisualTransformation()
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        PrimaryButton(
            text = if (isLoading) "Memproses..." else "Masuk Aplikasi",
            onClick = {
                if (emailOrWa.isNotEmpty() && password.isNotEmpty()) {
                    isLoading = true
                    coroutineScope.launch {
                        try {
                            val response = RetrofitClient.instance.login(LoginRequest(emailOrWa.trim(), password))
                            val authData = response.data
                            if (authData != null) {
                                // Save token in auth_prefs
                                val prefs = context.getSharedPreferences("auth_prefs", android.content.Context.MODE_PRIVATE)
                                prefs.edit().putString("token", authData.token).apply()
                                
                                Toast.makeText(context, "Login berhasil!", Toast.LENGTH_SHORT).show()
                                onLoginSuccess()
                            } else {
                                Toast.makeText(context, response.message ?: "Login gagal", Toast.LENGTH_SHORT).show()
                            }
                        } catch (e: Exception) {
                            Toast.makeText(context, "Gagal login: ${e.message}", Toast.LENGTH_SHORT).show()
                        } finally {
                            isLoading = false
                        }
                    }
                } else {
                    Toast.makeText(context, "Email/WA dan kata sandi wajib diisi", Toast.LENGTH_SHORT).show()
                }
            },
            enabled = !isLoading
        )

        Spacer(modifier = Modifier.height(32.dp))

        Row {
            Text(
                text = "Belum punya akun? ",
                color = MaterialTheme.colorScheme.secondary
            )
            Text(
                text = "Daftar Akun Baru Sekarang",
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable { onNavigateToRegister() }
            )
        }

        Spacer(modifier = Modifier.weight(1f))
    }
}
