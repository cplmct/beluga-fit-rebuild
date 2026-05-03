import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

const url = supabaseUrl?.trim()
const key = supabaseAnonKey?.trim()

const hasValidUrl = url?.startsWith('https://')
const hasValidKey = key && key.length > 20

if (__DEV__) {
  console.log('[Supabase] URL present:', !!url)
  console.log('[Supabase] Key present:', !!key)
  console.log('[Supabase] URL valid:', !!hasValidUrl)
  console.log('[Supabase] Key valid:', !!hasValidKey)
}

if (!hasValidUrl || !hasValidKey) {
  console.error(
    '[Supabase] Invalid configuration',
    'URL valid:', hasValidUrl,
    'Key valid:', hasValidKey
  )
}

export const supabase = createClient(url || '', key || '', {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
