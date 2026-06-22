package com.rpl.kosthub.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun Stepper(
    currentStep: Int,
    currentStepLabel: String,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Step 1
        StepCircle(stepNumber = 1, isActive = currentStep == 1, isCompleted = currentStep > 1)
        
        if (currentStep == 1) {
            Spacer(modifier = Modifier.width(8.dp))
            Text(currentStepLabel, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
        }
        
        Spacer(modifier = Modifier.width(8.dp))
        Divider(modifier = Modifier.width(32.dp), color = MaterialTheme.colorScheme.outlineVariant)
        Spacer(modifier = Modifier.width(8.dp))

        // Step 2
        StepCircle(stepNumber = 2, isActive = currentStep == 2, isCompleted = currentStep > 2)
        
        if (currentStep == 2) {
            Spacer(modifier = Modifier.width(8.dp))
            Text(currentStepLabel, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
        }

        Spacer(modifier = Modifier.width(8.dp))
        Divider(modifier = Modifier.width(32.dp), color = MaterialTheme.colorScheme.outlineVariant)
        Spacer(modifier = Modifier.width(8.dp))

        // Step 3
        StepCircle(stepNumber = 3, isActive = currentStep == 3, isCompleted = currentStep > 3)
        
        if (currentStep == 3) {
            Spacer(modifier = Modifier.width(8.dp))
            Text(currentStepLabel, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
        }
    }
}

@Composable
fun StepCircle(stepNumber: Int, isActive: Boolean, isCompleted: Boolean) {
    val backgroundColor = if (isActive) MaterialTheme.colorScheme.primary else Color.Transparent
    val contentColor = if (isActive) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.outline
    val borderColor = if (isActive) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant

    Box(
        modifier = Modifier
            .size(24.dp)
            .clip(CircleShape)
            .background(if (isCompleted) Color.Transparent else backgroundColor)
            .border(
                width = 1.dp,
                color = if (isCompleted) MaterialTheme.colorScheme.primary else borderColor,
                shape = CircleShape
            ),
        contentAlignment = Alignment.Center
    ) {
        if (isCompleted) {
            Icon(
                imageVector = Icons.Default.Check,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(16.dp)
            )
        } else {
            Text(
                text = stepNumber.toString(),
                color = contentColor,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
