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
                    
                    // Load actual auth state from shared preferences
                    val context = androidx.compose.ui.platform.LocalContext.current
                    var isLoggedIn by androidx.compose.runtime.remember {
                        androidx.compose.runtime.mutableStateOf(
                            context.getSharedPreferences("auth_prefs", android.content.Context.MODE_PRIVATE)
                                .getString("token", null) != null
                        )
                    }

                    // Sync location profile if logged in
                    androidx.compose.runtime.LaunchedEffect(isLoggedIn) {
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
                                onNavigateToGasGalon = { navController.navigate("gas_galon_detail") },
                                onNavigateToLaundry = { navController.navigate("laundry_detail") },
                                onNavigateToDailyCleaning = { navController.navigate("daily_cleaning_detail") },
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
                        composable("gas_galon_detail") {
                            com.rpl.kosthub.ui.screens.order.GasGalonDetailScreen(
                                onNavigateBack = { navController.popBackStack() },
                                onNavigateToPayment = { navController.navigate("payment") }
                            )
                        }
                        composable("payment") {
                            com.rpl.kosthub.ui.screens.payment.PaymentScreen(
                                onNavigateBack = { navController.popBackStack() },
                                onPaymentSuccess = { navController.navigate("home") {
                                    popUpTo("home") { inclusive = true }
                                } }
                            )
                        }
                        composable("laundry_detail") {
                            com.rpl.kosthub.ui.screens.order.LaundryDetailScreen(
                                onNavigateBack = { navController.popBackStack() },
                                onNavigateToPayment = { navController.navigate("payment") }
                            )
                        }
                        composable("daily_cleaning_detail") {
                            com.rpl.kosthub.ui.screens.order.DailyCleaningDetailScreen(
                                onNavigateBack = { navController.popBackStack() },
                                onNavigateToPayment = { navController.navigate("payment") }
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