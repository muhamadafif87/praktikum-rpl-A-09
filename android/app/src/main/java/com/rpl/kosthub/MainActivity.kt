package com.rpl.kosthub

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.NavType
import androidx.navigation.navArgument
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.LaunchedEffect
import com.rpl.kosthub.data.remote.AuthEventBus
import com.rpl.kosthub.ui.screens.auth.LoginScreen
import com.rpl.kosthub.ui.screens.auth.RegisterScreen
import com.rpl.kosthub.ui.screens.home.HomeScreen
import com.rpl.kosthub.ui.theme.KostHubAppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            KostHubAppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    // Global LocationViewModel
                    val locationViewModel: com.rpl.kosthub.ui.screens.map.LocationViewModel = androidx.lifecycle.viewmodel.compose.viewModel {
                        com.rpl.kosthub.ui.screens.map.LocationViewModel(applicationContext)
                    }
                    val orderViewModel: com.rpl.kosthub.ui.screens.order.OrderViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
                    
                    // Load actual auth state from shared preferences
                    val context = androidx.compose.ui.platform.LocalContext.current
                    var isLoggedIn by androidx.compose.runtime.remember {
                        androidx.compose.runtime.mutableStateOf(
                            context.getSharedPreferences("auth_prefs", android.content.Context.MODE_PRIVATE)
                                .getString("token", null) != null
                        )
                    }

                    // Auto-redirect ke Login saat menerima event HTTP 401 dari mana pun
                    LaunchedEffect(Unit) {
                        AuthEventBus.unauthorizedEvent.collect {
                            // Bersihkan token dari SharedPreferences
                            context.getSharedPreferences("auth_prefs", android.content.Context.MODE_PRIVATE)
                                .edit().remove("token").apply()
                            isLoggedIn = false
                            locationViewModel.clearLocation()
                            // Navigasi ke login dan bersihkan seluruh back stack
                            navController.navigate("login") {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    }

                    // Sync location profile if logged in
                    LaunchedEffect(isLoggedIn) {
                        if (isLoggedIn) {
                            locationViewModel.syncWithUserProfile()
                        }
                    }

                    NavHost(navController = navController, startDestination = "splash") {
                        composable("splash") {
                            com.rpl.kosthub.ui.screens.splash.SplashScreen(
                                onSplashComplete = {
                                    navController.navigate("home") {
                                        popUpTo("splash") { inclusive = true }
                                    }
                                }
                            )
                        }
                        composable("login") {
                            com.rpl.kosthub.ui.screens.auth.LoginScreen(
                                onNavigateToRegister = { navController.navigate("register") },
                                onLoginSuccess = { 
                                    isLoggedIn = true 
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("register") {
                            com.rpl.kosthub.ui.screens.auth.RegisterScreen(
                                onNavigateToLogin = { navController.navigate("login") },
                                onRegisterSuccess = {
                                    isLoggedIn = true
                                    navController.popBackStack("home", inclusive = false)
                                }
                            )
                        }
                        composable("home") {
                            com.rpl.kosthub.ui.screens.home.HomeScreen(
                                isLoggedIn = isLoggedIn,
                                onNavigateToLogin = { navController.navigate("login") },
                                	onNavigateToRegister = { navController.navigate("register") },
                                onNavigateToGasGalon = { mitraId -> navController.navigate("gas_galon_detail/$mitraId") },
                                onNavigateToLaundry = { mitraId -> navController.navigate("laundry_detail/$mitraId") },
                                onNavigateToDailyCleaning = { mitraId -> navController.navigate("daily_cleaning_detail/$mitraId") },
                                onNavigateToMap = { navController.navigate("map_picker") },
                                locationViewModel = locationViewModel,
                                onLogout = {
                                    isLoggedIn = false
                                    context.getSharedPreferences("auth_prefs", android.content.Context.MODE_PRIVATE)
                                        .edit().remove("token").remove("user_name").apply()
                                    locationViewModel.clearLocation()
                                }
                            )
                        }
                        composable(
                            "gas_galon_detail/{id_mitra}",
                            arguments = listOf(navArgument("id_mitra") { type = NavType.IntType })
                        ) { backStackEntry ->
                            val mitraId = backStackEntry.arguments?.getInt("id_mitra") ?: 0
                            com.rpl.kosthub.ui.screens.order.GasGalonDetailScreen(
                                mitraId = mitraId,
                                orderViewModel = orderViewModel,
                                locationViewModel = locationViewModel,
                                onNavigateBack = { navController.popBackStack() },
                                onNavigateToPayment = { idPesanan -> navController.navigate("payment/$idPesanan") }
                            )
                        }
                        composable(
                            "payment/{id_pesanan}",
                            arguments = listOf(navArgument("id_pesanan") { type = NavType.StringType })
                        ) { backStackEntry ->
                            val idPesanan = backStackEntry.arguments?.getString("id_pesanan") ?: ""
                            com.rpl.kosthub.ui.screens.payment.PaymentScreen(
                                idPesanan = idPesanan,
                                orderViewModel = orderViewModel,
                                onNavigateBack = { navController.popBackStack() },
                                onPaymentSuccess = { navController.navigate("home") {
                                    popUpTo("home") { inclusive = true }
                                } }
                            )
                        }
                        composable(
                            "laundry_detail/{id_mitra}",
                            arguments = listOf(navArgument("id_mitra") { type = NavType.IntType })
                        ) { backStackEntry ->
                            val mitraId = backStackEntry.arguments?.getInt("id_mitra") ?: 0
                            com.rpl.kosthub.ui.screens.order.LaundryDetailScreen(
                                mitraId = mitraId,
                                orderViewModel = orderViewModel,
                                locationViewModel = locationViewModel,
                                onNavigateBack = { navController.popBackStack() },
                                onNavigateToPayment = { idPesanan -> navController.navigate("payment/$idPesanan") }
                            )
                        }
                        composable(
                            "daily_cleaning_detail/{id_mitra}",
                            arguments = listOf(navArgument("id_mitra") { type = NavType.IntType })
                        ) { backStackEntry ->
                            val mitraId = backStackEntry.arguments?.getInt("id_mitra") ?: 0
                            com.rpl.kosthub.ui.screens.order.DailyCleaningDetailScreen(
                                mitraId = mitraId,
                                orderViewModel = orderViewModel,
                                locationViewModel = locationViewModel,
                                onNavigateBack = { navController.popBackStack() },
                                onNavigateToPayment = { idPesanan -> navController.navigate("payment/$idPesanan") }
                            )
                        }
                        composable("map_picker") {
                            val locationState by locationViewModel.locationState.collectAsState()
                            com.rpl.kosthub.ui.screens.map.LocationSearchScreen(
                                onLocationConfirmed = { address, lat, lng ->
                                    locationViewModel.setLocation(address.ifEmpty { "Titik Peta Terpilih" }, lat, lng)
                                    navController.popBackStack()
                                },
                                onBack = { navController.popBackStack() },
                                initialLat = locationState.lat,
                                initialLng = locationState.lng
                            )
                        }
                    }
                }
            }
        }
    }
}