import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

const resolvedUrl = supabaseUrl?.trim()
const resolvedKey = supabaseAnonKey?.trim()

const isValidUrl = resolvedUrl?.startsWith('https://')
const isValidKey = resolvedKey && resolvedKey.length > 20

if (__DEV__) {
  console.log('Supabase URL available:', !!resolvedUrl)
  console.log('Supabase Key available:', !!resolvedKey)
  console.log('URL starts with https:', !!isValidUrl)
  console.log('Key looks valid:', !!isValidKey)
}

if (!isValidUrl || !isValidKey) {
  console.error(
    'Supabase configuration is invalid or missing.',
    'URL valid:', isValidUrl,
    'Key valid:', isValidKey
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
