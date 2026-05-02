package com.tranbtc.belugafitworkout // ← adjust to match your actual package name

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.postgrest.Postgrest

object SupabaseClient {

    val client = createSupabaseClient(
        supabaseUrl = "https://tlubxgafmtaczttavtjn.supabase.co",
        supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsdWJ4Z2FmbXRhY3p0dGF2dGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjI0NjYsImV4cCI6MjA4Mzg5ODQ2Nn0.Jb1hSjqhQql3a_cyNr1MpVJ4Ka49ABkxM1hPYgnHOQg"
    ) {
        install(Auth)
        install(Postgrest)
    }
}
