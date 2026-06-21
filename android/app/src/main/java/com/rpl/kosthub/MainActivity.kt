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
                    // Dummy global auth state for prototype
                    var isLoggedIn by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }

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
                                onNavigateToDailyCleaning = { navController.navigate("daily_cleaning_detail") }
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
                    }
                }
            }
        }
    }
}