package com.kharcho

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

/**
 * Listens for new incoming SMS and forwards them to SmsModule
 * so JS can parse new transaction SMS in real time.
 */
class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        messages?.forEach { sms ->
            val sender = sms.originatingAddress ?: return@forEach
            val body = sms.messageBody ?: return@forEach
            val timestamp = sms.timestampMillis

            // Forward to JS via the SmsModule emitter
            SmsModuleHolder.module?.emitNewSms(sender, body, timestamp)
        }
    }
}
