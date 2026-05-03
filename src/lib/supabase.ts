import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
const extraUrl = (Constants.expoConfig?.extra?.supabaseUrl as string) || ''
const extraKey = (Constants.expoConfig?.extra?.supabaseAnonKey as string) || ''

const url = (envUrl || extraUrl)?.trim()
const key = (envKey || extraKey)?.trim()

const hasValidUrl = Boolean(url && url.startsWith('https://'))
const hasValidKey = Boolean(key && key.length > 20)

if (__DEV__) {
  console.log('[Supabase] env URL:', !!envUrl, '| extra URL:', !!extraUrl, '| valid:', hasValidUrl)
  console.log('[Supabase] env Key:', !!envKey, '| extra Key:', !!extraKey, '| valid:', hasValidKey)
}

if (!hasValidUrl || !hasValidKey) {
  if (__DEV__) {
    console.error('[Supabase] Missing or invalid configuration — requests will fail')
  }
}

const safeClient = createClient(
  hasValidUrl ? url! : 'https://empty.supabase.co',
  hasValidKey ? key! : 'empty',
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
