import 'react-native-url-polyfill/auto'
import { AppState } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

// ── Config resolution ─────────────────────────────────────────────────────────
//
// Two identical sources, one clear priority:
//
//   1. EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
//      Baked in at Metro bundle time (dev .env) or EAS build time (EAS secrets).
//      This is the primary source and is always present in correctly configured builds.
//
//   2. Constants.expoConfig.extra.supabaseUrl / .supabaseAnonKey
//      Baked in by app.config.js from the same EXPO_PUBLIC_ env vars.
//      Acts as a fallback for edge cases where the metro inline replacement
//      of process.env.EXPO_PUBLIC_* does not run (e.g. certain native build configs).
//
// Both sources contain the same value. If neither is present the app will log
// a clear error and all Supabase requests will fail with a network error — there
// is no silent fake-URL fallback.

function resolveConfig(): { url: string; anonKey: string } {
  const url = (
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    (Constants.expoConfig?.extra?.supabaseUrl as string | undefined) ||
    ''
  ).trim()

  const anonKey = (
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    (Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined) ||
    ''
  ).trim()

  if (__DEV__) {
    console.log('[Supabase] URL resolved:', url ? url.replace(/\/\/.*@/, '//***@') : 'MISSING')
    console.log('[Supabase] Key resolved:', anonKey ? `${anonKey.slice(0, 12)}…` : 'MISSING')
  }

  if (!url || !url.startsWith('https://')) {
    console.error(
      '[Supabase] EXPO_PUBLIC_SUPABASE_URL is missing or invalid.\n' +
      '  Development: add it to your .env file.\n' +
      '  Production:  set it as an EAS secret and rebuild.'
    )
  }

  if (!anonKey || anonKey.length < 20) {
    console.error(
      '[Supabase] EXPO_PUBLIC_SUPABASE_ANON_KEY is missing or invalid.\n' +
      '  Development: add it to your .env file.\n' +
      '  Production:  set it as an EAS secret and rebuild.'
    )
  }

  return { url, anonKey }
}

const { url: supabaseUrl, anonKey: supabaseAnonKey } = resolveConfig()

// ── Client ────────────────────────────────────────────────────────────────────

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // React Native handles deep links manually via Linking — Supabase must not
    // try to parse the session from the URL on its own.
    detectSessionInUrl: false,
  },
})

// ── Foreground / background token refresh ─────────────────────────────────────
//
// On mobile, background timer throttling can prevent autoRefreshToken from
// firing before the JWT expires. Explicitly stopping and restarting the refresh
// loop when the app moves between foreground and background ensures sessions
// remain valid after the app is resumed.
//
// This listener is registered once when the module is first imported (app
// startup) and lives for the duration of the process.

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
