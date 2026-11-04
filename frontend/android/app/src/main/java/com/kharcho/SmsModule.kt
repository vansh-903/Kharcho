package com.kharcho

import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.provider.Telephony
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener

class SmsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), PermissionListener {

    companion object {
        const val NAME = "SmsModule"
        private const val TAG = "SmsModule"
        private const val SMS_PERMISSION_REQUEST = 1001
        private const val READ_SMS = android.Manifest.permission.READ_SMS
        private const val RECEIVE_SMS = android.Manifest.permission.RECEIVE_SMS
    }

    private var permissionPromise: Promise? = null

    override fun getName() = NAME

    // ── Permission ──────────────────────────────────────────────────────────

    @ReactMethod
    fun requestSmsPermission(promise: Promise) {
        val activity = reactContext.currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "No active activity")
            return
        }

        val readGranted = ContextCompat.checkSelfPermission(reactContext, READ_SMS) ==
                PackageManager.PERMISSION_GRANTED
        val receiveGranted = ContextCompat.checkSelfPermission(reactContext, RECEIVE_SMS) ==
                PackageManager.PERMISSION_GRANTED

        if (readGranted && receiveGranted) {
            promise.resolve("granted")
            return
        }

        permissionPromise = promise
        val permissionActivity = activity as? PermissionAwareActivity ?: run {
            promise.reject("NOT_PERMISSION_AWARE", "Activity does not support permissions")
            return
        }
        permissionActivity.requestPermissions(
            arrayOf(READ_SMS, RECEIVE_SMS),
            SMS_PERMISSION_REQUEST,
            this
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ): Boolean {
        if (requestCode != SMS_PERMISSION_REQUEST) return false
        val allGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
        permissionPromise?.resolve(if (allGranted) "granted" else "denied")
        permissionPromise = null
        return true
    }

    // ── Historic SMS scan ────────────────────────────────────────────────────

    @ReactMethod
    fun getHistoricSms(daysBack: Int, promise: Promise) {
        try {
            // Query content://sms which includes both standard inbox and OEM service/transaction messages (Realme, Xiaomi, Oppo)
            val uri = Telephony.Sms.CONTENT_URI
            val projection = arrayOf("_id", "address", "body", "date")

            val selection: String?
            val selectionArgs: Array<String>?

            if (daysBack > 0) {
                val cutoffMs = System.currentTimeMillis() - (daysBack.toLong() * 24 * 60 * 60 * 1000)
                selection = "date >= ?"
                selectionArgs = arrayOf(cutoffMs.toString())
            } else {
                selection = null
                selectionArgs = null
            }

            val cursor: Cursor? = reactContext.contentResolver.query(
                uri, projection, selection, selectionArgs, "date DESC"
            )

            val results = Arguments.createArray()
            var count = 0

            cursor?.use {
                val idIdx = it.getColumnIndex("_id")
                val addressIdx = it.getColumnIndex("address")
                val bodyIdx = it.getColumnIndex("body")
                val dateIdx = it.getColumnIndex("date")

                while (it.moveToNext()) {
                    val msg = Arguments.createMap()
                    if (idIdx >= 0) msg.putString("id", it.getString(idIdx))
                    if (addressIdx >= 0) msg.putString("sender", it.getString(addressIdx) ?: "")
                    if (bodyIdx >= 0) msg.putString("body", it.getString(bodyIdx) ?: "")
                    if (dateIdx >= 0) msg.putDouble("timestamp", it.getLong(dateIdx).toDouble())

                    results.pushMap(msg)
                    count++
                }
            }

            Log.d(TAG, "getHistoricSms: read $count raw SMS messages (daysBack=$daysBack)")
            promise.resolve(results)
        } catch (e: Exception) {
            Log.e(TAG, "getHistoricSms error: ${e.message}", e)
            promise.reject("SMS_READ_ERROR", e.message, e)
        }
    }

    // ── Emit new SMS to JS ───────────────────────────────────────────────────

    fun emitNewSms(sender: String, body: String, timestamp: Long) {
        val params = Arguments.createMap()
        params.putString("sender", sender)
        params.putString("body", body)
        params.putDouble("timestamp", timestamp.toDouble())
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onNewSms", params)
    }

    @ReactMethod
    fun addListener(eventName: String) { /* Required for RN built-in event emitter */ }

    @ReactMethod
    fun removeListeners(count: Int) { /* Required for RN built-in event emitter */ }
}
