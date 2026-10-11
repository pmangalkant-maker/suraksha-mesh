export interface AndroidCodeFile {
  path: string;
  category: 'BLE' | 'Mesh' | 'Database' | 'UI / Theme' | 'Manifest' | 'Docs';
  language: 'kotlin' | 'xml' | 'markdown' | 'gradle';
  description: string;
  content: string;
}

export const ANDROID_CODEBASE: AndroidCodeFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'Manifest',
    language: 'xml',
    description: 'Android Manifest declaring BLE, Location, Foreground Service, and Keystore permissions',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.surakshamesh.app">

    <!-- Bluetooth Low Energy & Mesh Permissions -->
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" tools:targetApi="s" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" tools:targetApi="s" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" tools:targetApi="s" />

    <!-- Location Permissions (for emergency GPS coordinates) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Foreground Services for Uninterrupted Emergency Mesh Operation -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" tools:targetApi="upside_down_cake" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Hardware requirements -->
    <uses-feature android:name="android.hardware.bluetooth_le" android:required="true" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />

    <application
        android:name=".SurakshaMeshApp"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SurakshaMesh">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Foreground Service for background BLE Advertising & Scanning -->
        <service
            android:name=".service.SurakshaMeshBleService"
            android:exported="false"
            android:foregroundServiceType="connectedDevice" />
    </application>
</manifest>`,
  },
  {
    path: 'app/src/main/java/com/surakshamesh/app/ble/advertiser/BleAdvertiser.kt',
    category: 'BLE',
    language: 'kotlin',
    description: 'BLE Advertiser using Android BluetoothLeAdvertiser with 128-bit Service UUID and compact beacon header',
    content: `package com.surakshamesh.app.ble.advertiser

import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.os.ParcelUuid
import android.util.Log
import com.surakshamesh.app.ble.BleConstants
import java.nio.ByteBuffer
import java.util.UUID

class SurakshaBleAdvertiser(
    private val bluetoothAdapter: BluetoothAdapter?
) {
    private var advertiser: BluetoothLeAdvertiser? = null
    private var isAdvertising = false

    private val callback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            isAdvertising = true
            Log.i("SurakshaBle", "BLE Advertisement started successfully. TX Power: \${settingsInEffect?.txPowerLevel}")
        }

        override fun onStartFailure(errorCode: Int) {
            isAdvertising = false
            Log.e("SurakshaBle", "BLE Advertisement failed to start with code: \$errorCode")
        }
    }

    fun startEmergencyBroadcast(alertIdShort: Int, emergencyTypeOrdinal: Byte) {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            Log.w("SurakshaBle", "Bluetooth adapter disabled; cannot advertise")
            return
        }

        advertiser = bluetoothAdapter.bluetoothLeAdvertiser
        if (advertiser == null) return

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(true)
            .setTimeout(0)
            .build()

        // Construct 4-byte manufacturer service payload: [AlertIdShort (2B), Type (1B), HopCount (1B)]
        val payload = ByteBuffer.allocate(4)
            .putShort(alertIdShort.toShort())
            .put(emergencyTypeOrdinal)
            .put(0.toByte()) // initial hop count = 0
            .array()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(false)
            .addServiceUuid(ParcelUuid(UUID.fromString(BleConstants.SURAKSHA_SERVICE_UUID)))
            .addServiceData(ParcelUuid(UUID.fromString(BleConstants.SURAKSHA_DATA_UUID)), payload)
            .build()

        advertiser?.startAdvertising(settings, data, callback)
    }

    fun stopBroadcast() {
        if (isAdvertising && advertiser != null) {
            advertiser?.stopAdvertising(callback)
            isAdvertising = false
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/surakshamesh/app/mesh/RelayManager.kt',
    category: 'Mesh',
    language: 'kotlin',
    description: 'Consent-based multi-hop forwarding with loop prevention, duplicate check, and hop limits',
    content: `package com.surakshamesh.app.mesh

import com.surakshamesh.app.data.entity.AlertEntity
import com.surakshamesh.app.data.repository.AlertRepository
import com.surakshamesh.app.security.MessageValidator
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RelayManager @Inject constructor(
    private val alertRepository: AlertRepository,
    private val messageValidator: MessageValidator,
    private val deduplicationManager: DeduplicationManager
) {
    companion object {
        const val MAX_HOPS_ALLOWED = 3
        const val ALERT_TTL_MILLIS = 30 * 60 * 1000L // 30 minutes
    }

    suspend fun processIncomingAlert(rawPayload: ByteArray, senderRssi: Int): RelayResult {
        // 1. Validate cryptographic signature and schema
        val alert = messageValidator.deserializeAndVerify(rawPayload) 
            ?: return RelayResult.Rejected("Invalid signature or malformed payload")

        // 2. Check for duplicate packet
        if (deduplicationManager.hasSeen(alert.alertId)) {
            return RelayResult.IgnoredDuplicate(alert.alertId)
        }
        deduplicationManager.markSeen(alert.alertId)

        // 3. Check for expiration
        val now = System.currentTimeMillis()
        if (now > alert.expiresAt || (now - alert.createdAt) > ALERT_TTL_MILLIS) {
            return RelayResult.Expired(alert.alertId)
        }

        // 4. Save alert locally first in Room database
        alertRepository.insertAlert(alert)

        // 5. Evaluate relay forwarding policy
        val isUserRelayConsented = alertRepository.isRelayConsentEnabled().first()
        if (!isUserRelayConsented) {
            return RelayResult.SavedLocallyOnly("Relay disabled by user preferences")
        }

        // 6. Check Hop Limit
        if (alert.hopCount >= MAX_HOPS_ALLOWED) {
            return RelayResult.HopLimitReached("Maximum hops ($MAX_HOPS_ALLOWED) reached")
        }

        // 7. Increment Hop and prepare for re-broadcast to next mesh node
        val forwardedAlert = alert.copy(
            hopCount = alert.hopCount + 1,
            relayHistory = alert.relayHistory + System.currentTimeMillis()
        )

        return RelayResult.ReadyForForwarding(forwardedAlert)
    }
}

sealed class RelayResult {
    data class ReadyForForwarding(val alert: AlertEntity) : RelayResult()
    data class SavedLocallyOnly(val reason: String) : RelayResult()
    data class IgnoredDuplicate(val alertId: String) : RelayResult()
    data class HopLimitReached(val reason: String) : RelayResult()
    data class Expired(val alertId: String) : RelayResult()
    data class Rejected(val error: String) : RelayResult()
}`,
  },
  {
    path: 'app/src/main/java/com/surakshamesh/app/data/local/RoomEntities.kt',
    category: 'Database',
    language: 'kotlin',
    description: 'Room entities for Emergency Alerts, Safe Havens, Trusted Contacts, and Seen Messages',
    content: `package com.surakshamesh.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters

@Entity(tableName = "emergency_alerts")
data class AlertEntity(
    @PrimaryKey val alertId: String,
    val senderId: String,
    val createdAt: Long,
    val expiresAt: Long,
    val latitude: Double?,
    val longitude: Double?,
    val locationAccuracyMeters: Float?,
    val locationTimestamp: Long?,
    val hopCount: Int,
    val maxHops: Int,
    val status: String,
    val emergencyType: String,
    val signatureHex: String,
    val acknowledgedByHelperId: String? = null,
    val acknowledgedTimestamp: Long? = null
)

@Entity(tableName = "safe_havens")
data class SafeHavenEntity(
    @PrimaryKey val placeId: String,
    val name: String,
    val category: String,
    val latitude: Double,
    val longitude: Double,
    val address: String,
    val verificationSource: String,
    val lastVerifiedAt: String,
    val publishedHours: String,
    val contactPhone: String,
    val isOpenNow: Boolean
)

@Entity(tableName = "trusted_contacts")
data class TrustedContactEntity(
    @PrimaryKey val contactId: String,
    val name: String,
    val phoneNumber: String,
    val relationship: String,
    val optedIn: Boolean,
    val notifyOnSos: Boolean
)

@Entity(tableName = "seen_messages")
data class SeenMessageEntity(
    @PrimaryKey val alertId: String,
    val firstSeenAt: Long
)`,
  },
  {
    path: 'app/src/main/java/com/surakshamesh/app/ui/theme/SurakshaTheme.kt',
    category: 'UI / Theme',
    language: 'kotlin',
    description: 'Jetpack Compose Material 3 Theme with Pink, Electric Blue and Glassmorphism styling',
    content: `package com.surakshamesh.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Suraksha Mesh Pink & Blue Glassmorphism Design Tokens
val PrimaryPink = Color(0xFFF472B6)
val DeepRose = Color(0xFFDB2777)
val SoftPinkBackground = Color(0xFFFFF1F7)
val PrimaryBlue = Color(0xFF3B82F6)
val ElectricBlueAccent = Color(0xFF60A5FA)
val DeepNavy = Color(0xFF172554)
val EmergencyRed = Color(0xFFDC2626)
val WarningAmber = Color(0xFFF59E0B)
val SuccessGreen = Color(0xFF16A34A)

// Glass surfaces
val DarkGlassSurface = Color(0x73172554) // 45% alpha Deep Navy
val LightGlassSurface = Color(0xCCFFFFFF) // 80% alpha White
val GlassBorderStroke = Color(0x3360A5FA) // 20% alpha Electric Blue

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryPink,
    secondary = ElectricBlueAccent,
    tertiary = DeepRose,
    background = Color(0xFF0F172A),
    surface = DeepNavy,
    error = EmergencyRed,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFFF8FAFC),
    onSurface = Color(0xFFF1F5F9)
)

private val LightColorScheme = lightColorScheme(
    primary = DeepRose,
    secondary = PrimaryBlue,
    tertiary = PrimaryPink,
    background = SoftPinkBackground,
    surface = Color.White,
    error = EmergencyRed,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = DeepNavy,
    onSurface = DeepNavy
)

@Composable
fun SurakshaMeshTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}`,
  },
  {
    path: 'docs/ARCHITECTURE.md',
    category: 'Docs',
    language: 'markdown',
    description: 'System Architecture, Threat Model, Offline Tile Strategy, and BLE Mesh Protocol specs',
    content: `# SURAKSHA MESH — SYSTEM ARCHITECTURE SPECIFICATION

## 1. Executive Summary
Suraksha Mesh is an offline-first emergency response application engineered for women safety in high-density urban environments and transit corridors where mobile data or cellular network coverage is compromised or unavailable.

## 2. Communication Topology
\`\`\`
[ Victim Device (Phone A) ]
        │  BLE Advertisement (128-bit UUID Beacon)
        ▼
[ Passerby Device (Phone B) ]
        │  GATT MTU 512 connection + Ed25519 payload validation
        ▼
[ Helper Terminal / Safe Haven Desk (Phone C) ]
        │  Signed Acknowledgement Return Packet
        ▼
[ Victim Device receives confirmed delivery feedback ]
\`\`\`

## 3. Cryptographic Authenticity & Privacy
- **Key Generation**: 256-bit Ed25519 keypair generated within the hardware-backed Android Keystore (StrongBox Keymaster if available).
- **Anti-Replay**: Each payload incorporates a high-entropy 12-byte nonce and monotonic timestamp bounded by a 30-minute expiry window.
- **Privacy Controls**: Medical data and exact coordinates are omitted unless explicitly permitted in the local Emergency Profile.

## 4. Truthful Delivery Guarantees
The UI strictly decouples local alert creation from verified remote delivery. An alert is only transitioned to "HELPER_ACKNOWLEDGED" upon cryptographic verification of an inbound response token from a registered device or Safe Haven desk.`,
  },
];
