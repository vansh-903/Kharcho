package com.kharcho

/**
 * Singleton holder so SmsReceiver (a BroadcastReceiver with no
 * React context) can reach the SmsModule instance to emit events.
 */
object SmsModuleHolder {
    var module: SmsModule? = null
}
