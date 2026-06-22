package com.rpl.kosthub.data.remote

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

/**
 * Application-level event bus untuk sinyal autentikasi.
 * Ketika interceptor OkHttp mendeteksi respons HTTP 401,
 * ia akan emit ke sini. MainActivity akan mengamati dan
 * melakukan redirect otomatis ke halaman Login.
 */
object AuthEventBus {
    private val _unauthorizedEvent = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val unauthorizedEvent = _unauthorizedEvent.asSharedFlow()

    fun sendUnauthorized() {
        _unauthorizedEvent.tryEmit(Unit)
    }
}
