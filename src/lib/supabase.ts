import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

const url = supabaseUrl?.trim()
const key = supabaseAnonKey?.trim()

const hasValidUrl = url && url.startsWith('https://')
const hasValidKey = key && key.length > 20

if (__DEV__) {
  console.log('[Supabase] URL:', !!url, 'starts https:', hasValidUrl)
  console.log('[Supabase] Key:', !!key, 'looks valid:', hasValidKey)
}

if (!hasValidUrl || !hasValidKey) {
  if (__DEV__) {
    console.error(
      '[Supabase] Missing configuration',
      'URL valid:', hasValidUrl,
      'Key valid:', hasValidKey
    )
  }
}

const safeClient = createClient(
  hasValidUrl ? url : 'https://empty.supabase.co',
  hasValidKey ? key : 'empty',
  {
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

type ValidSupabaseClient = SupabaseClient & { options: { auth: { storage: any } } }

export const supabase = safeClient as unknown as ValidSupabaseClient
