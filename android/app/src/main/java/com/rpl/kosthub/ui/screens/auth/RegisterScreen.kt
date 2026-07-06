package com.rpl.kosthub.ui.screens.auth

import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
import com.rpl.kosthub.data.model.RegisterRequest
import com.rpl.kosthub.data.remote.RetrofitClient
import kotlinx.coroutines.launch

@Composable
fun RegisterScreen(
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var fullName by remember { mutableStateOf("") }
    var emailOrWa by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(24.dp))

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

        Spacer(modifier = Modifier.height(32.dp))

        Column(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = "Daftar Akun Baru",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Bergabunglah dengan komunitas KostHub.",
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.secondary
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        KostHubTextField(
            value = fullName,
            onValueChange = { fullName = it },
            label = "Nama Lengkap",
            placeholder = "Masukkan nama lengkap Anda",
            leadingIcon = Icons.Default.Person
        )

        Spacer(modifier = Modifier.height(16.dp))

        KostHubTextField(
            value = emailOrWa,
            onValueChange = { emailOrWa = it },
            label = "Email atau Nomor WhatsApp",
            placeholder = "Email atau nomor WA aktif",
            leadingIcon = Icons.Default.Email
        )

        Spacer(modifier = Modifier.height(16.dp))

        KostHubTextField(
            value = password,
            onValueChange = { password = it },
            label = "Kata Sandi",
            placeholder = "Minimal 8 karakter",
            leadingIcon = Icons.Default.Lock,
            visualTransformation = PasswordVisualTransformation()
        )

        Spacer(modifier = Modifier.height(16.dp))

        KostHubTextField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = "Konfirmasi Kata Sandi",
            placeholder = "Ulangi kata sandi",
            leadingIcon = Icons.Default.Lock,
            visualTransformation = PasswordVisualTransformation()
        )

        Spacer(modifier = Modifier.height(32.dp))

        PrimaryButton(
            text = if (isLoading) "Memproses..." else "Daftar Sekarang",
            onClick = {
                if (fullName.isNotEmpty() && emailOrWa.isNotEmpty() && password.isNotEmpty() && confirmPassword.isNotEmpty()) {
                    if (password != confirmPassword) {
                        Toast.makeText(context, "Konfirmasi sandi tidak cocok", Toast.LENGTH_SHORT).show()
                        return@PrimaryButton
                    }
                    if (password.length < 8) {
                        Toast.makeText(context, "Kata sandi minimal 8 karakter", Toast.LENGTH_SHORT).show()
                        return@PrimaryButton
                    }
                    
                    isLoading = true
                    coroutineScope.launch {
                        try {
                            val trimmedEmailWa = emailOrWa.trim()
                            val isEmail = trimmedEmailWa.contains("@")
                            val email = if (isEmail) trimmedEmailWa else "user_${System.currentTimeMillis() % 100000}@kosthub.com"
                            val phone = if (isEmail) "08${(100000000..999999999).random()}" else trimmedEmailWa

                            val response = RetrofitClient.instance.register(
                                RegisterRequest(
                                    namaLengkap = fullName,
                                    email = email,
                                    password = password,
                                    passwordConfirmation = confirmPassword,
                                    nomorTelepon = phone
                                )
                            )
                            val authData = response.data
                            if (authData != null) {
                                val prefs = context.getSharedPreferences("auth_prefs", android.content.Context.MODE_PRIVATE)
                                prefs.edit()
                                    .putString("token", authData.token)
                                    .putString("user_name", authData.user.namaLengkap)
                                    .apply()
                                
                                Toast.makeText(context, "Registrasi berhasil!", Toast.LENGTH_SHORT).show()
                                onRegisterSuccess()
                            } else {
                                Toast.makeText(context, response.message ?: "Registrasi gagal", Toast.LENGTH_SHORT).show()
                            }
                        } catch (e: Exception) {
                            Toast.makeText(context, "Gagal registrasi: ${e.message}", Toast.LENGTH_SHORT).show()
                        } finally {
                            isLoading = false
                        }
                    }
                } else {
                    Toast.makeText(context, "Semua kolom wajib diisi", Toast.LENGTH_SHORT).show()
                }
            },
            enabled = !isLoading
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = buildAnnotatedString {
                append("Dengan mendaftar, Anda menyetujui ")
                withStyle(style = SpanStyle(color = MaterialTheme.colorScheme.primary)) {
                    append("Syarat & Ketentuan")
                }
                append(" serta ")
                withStyle(style = SpanStyle(color = MaterialTheme.colorScheme.primary)) {
                    append("Kebijakan Privasi")
                }
                append(" kami.")
            },
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.secondary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.weight(1f))

        Divider(color = MaterialTheme.colorScheme.outlineVariant)
        Spacer(modifier = Modifier.height(24.dp))
        
        Row {
            Text(
                text = "Sudah punya akun? ",
                color = MaterialTheme.colorScheme.secondary
            )
            Text(
                text = "Masuk Sekarang",
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable { onNavigateToLogin() }
            )
        }
        Spacer(modifier = Modifier.height(16.dp))
    }
}
