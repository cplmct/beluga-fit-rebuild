import React, { createContext, useState, useEffect, useContext, useRef } from 'react'
import { Linking } from 'react-native'
import { Session, User, AuthError } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'

// ── Deep link scheme ──────────────────────────────────────────────────────────
// Must match app.json "scheme" and the redirectTo passed to resetPasswordForEmail.
const APP_SCHEME = 'belugafit'

// ── Error type ────────────────────────────────────────────────────────────────
// Minimal interface satisfied by AuthError, PostgrestError, and plain Error.
// Used for operations that can fail at either the auth or database layer.
export interface AppError {
  message: string
}

// ── Local onboarding cache ────────────────────────────────────────────────────

function onboardingKey(userId: string) {
  return `@beluga/onboarding_${userId}`
}

async function readOnboardingCache(userId: string): Promise<boolean | null> {
  try {
    const val = await AsyncStorage.getItem(onboardingKey(userId))
    return val === 'true' ? true : null
  } catch {
    return null
  }
}

async function writeOnboardingCache(userId: string, completed: boolean): Promise<void> {
  try {
    if (completed) {
      await AsyncStorage.setItem(onboardingKey(userId), 'true')
    } else {
      await AsyncStorage.removeItem(onboardingKey(userId))
    }
  } catch {}
}

async function resolveOnboardingCompleted(userId: string): Promise<boolean> {
  const cached = await readOnboardingCache(userId)

  const run = () =>
    supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle()

  let { data, error } = await run()

  // PGRST002 = PostgREST schema-cache reload in progress (transient).
  // Wait 1.5 s and retry once before falling back to the local cache.
  if (error?.code === 'PGRST002') {
    if (__DEV__) {
      console.warn(
        '[Onboarding] PGRST002 on first attempt — retrying in 1.5 s.\n',
        JSON.stringify(error),
      )
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 1500))
    ;({ data, error } = await run())
  }

  if (error) {
    if (__DEV__) {
      console.warn(
        '[Onboarding] Supabase unavailable — falling back to cache:', cached,
        '\nmessage:', error.message,
        '| code:', error.code,
        '| details:', error.details,
        '| hint:', error.hint,
        '\nFull error:', JSON.stringify(error),
      )
    }
    return cached === true
  }

  const completed = data?.onboarding_completed === true
  await writeOnboardingCache(userId, completed)
  return completed
}

// ── Deep link parser ──────────────────────────────────────────────────────────
// Supabase password recovery emails redirect to:
//   belugafit://reset-password#access_token=xxx&refresh_token=xxx&type=recovery
//
// React Native's Linking module does not expose URL fragments on Android, so
// Supabase encodes the tokens as query params when using a custom scheme.
// We parse both locations to be safe.

function parseRecoveryUrl(url: string): {
  accessToken: string
  refreshToken: string
} | null {
  if (!url || !url.startsWith(APP_SCHEME)) return null

  const hashIdx = url.indexOf('#')
  const qIdx    = url.indexOf('?')

  const paramStr = hashIdx !== -1
    ? url.slice(hashIdx + 1)
    : qIdx !== -1
      ? url.slice(qIdx + 1)
      : ''

  if (!paramStr) return null

  const params: Record<string, string> = {}
  paramStr.split('&').forEach((pair) => {
    const eqIdx = pair.indexOf('=')
    if (eqIdx === -1) return
    params[decodeURIComponent(pair.slice(0, eqIdx))] =
      decodeURIComponent(pair.slice(eqIdx + 1))
  })

  if (params.type !== 'recovery') return null
  if (!params.access_token || !params.refresh_token) return null

  return { accessToken: params.access_token, refreshToken: params.refresh_token }
}

// ── Context types ─────────────────────────────────────────────────────────────

interface AuthContextType {
  session:            Session | null
  user:               User | null
  loading:            boolean
  needsOnboarding:    boolean
  isPasswordRecovery: boolean
  signIn:             (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp:             (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut:            () => Promise<void>
  deleteAccount:      () => Promise<{ error: AppError | null }>
  resetPassword:      (email: string) => Promise<{ error: AuthError | null }>
  updatePassword:     (newPassword: string) => Promise<{ error: AuthError | null }>
  completeOnboarding: () => Promise<void>
  triggerOnboarding:  () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]                       = useState<Session | null>(null)
  const [user, setUser]                             = useState<User | null>(null)
  const [loading, setLoading]                       = useState(true)
  const [needsOnboarding, setNeedsOnboarding]       = useState(false)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  // Tracks which user we last resolved onboarding for. Prevents redundant
  // Supabase round-trips on TOKEN_REFRESHED events for the same user.
  const resolvedUserRef = useRef<string | null>(null)

  // Incremented on every auth event. Async onboarding resolution checks this
  // before applying state — stale results from earlier events are discarded.
  const authEventVersion = useRef(0)

  // ── Deep link handler ─────────────────────────────────────────────────────
  // Parses recovery tokens from belugafit:// URLs and calls setSession so that
  // onAuthStateChange fires PASSWORD_RECOVERY. Handles both cold starts
  // (app opened via tapping the link) and warm starts (app already open).

  useEffect(() => {
    let mounted = true

    const applyRecoveryUrl = async (url: string | null): Promise<void> => {
      if (!url) return
      const tokens = parseRecoveryUrl(url)
      if (!tokens) return

      if (__DEV__) console.log('[Auth] Recovery deep link received')

      const { error } = await supabase.auth.setSession({
        access_token:  tokens.accessToken,
        refresh_token: tokens.refreshToken,
      })

      if (error && __DEV__) {
        console.error('[Auth] setSession error:', error.message)
      }
      // On success, onAuthStateChange fires PASSWORD_RECOVERY, which sets
      // isPasswordRecovery = true. Nothing else to do here.
    }

    Linking.getInitialURL()
      .then((url) => { if (mounted) applyRecoveryUrl(url) })
      .catch((err) => { if (__DEV__) console.warn('[Auth] getInitialURL error:', err) })

    const linkSub = Linking.addEventListener('url', ({ url }) => { applyRecoveryUrl(url) })

    return () => {
      mounted = false
      linkSub.remove()
    }
  }, [])

  // ── Auth state listener ───────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true

    // Initial session load. The finally block guarantees loading is always
    // cleared even if getSession rejects (e.g. corrupted storage).
    const init = async (): Promise<void> => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          if (__DEV__) console.error('[Auth] getSession error:', error.message)
          // Continue — user is simply unauthenticated.
          return
        }

        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          resolvedUserRef.current = session.user.id
          const version   = ++authEventVersion.current
          const completed = await resolveOnboardingCompleted(session.user.id)
          if (mounted && authEventVersion.current === version) {
            setNeedsOnboarding(!completed)
          }
        }
      } catch (err) {
        if (__DEV__) console.error('[Auth] init error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    // onAuthStateChange callback is intentionally NOT async.
    // Synchronous state updates are applied immediately; the one piece of
    // async work (onboarding resolution) runs as a guarded promise chain.
    // The authEventVersion counter ensures only the most recent event's
    // async result is applied — earlier in-flight results are discarded.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (__DEV__) console.log('[Auth] event:', event)

        // ── Synchronous updates (always safe, last write wins) ──────────────
        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true)
          return
        }

        if (!session?.user) {
          setNeedsOnboarding(false)
          setIsPasswordRecovery(false)
          resolvedUserRef.current = null
          return
        }

        // ── Async onboarding resolution ────────────────────────────────────
        // Only runs when the authenticated user actually changes. Skip
        // TOKEN_REFRESHED and other events for the same user.
        if (session.user.id === resolvedUserRef.current) return

        resolvedUserRef.current = session.user.id
        const version = ++authEventVersion.current

        resolveOnboardingCompleted(session.user.id)
          .then((completed) => {
            if (mounted && authEventVersion.current === version) {
              setNeedsOnboarding(!completed)
            }
          })
          .catch((err) => {
            if (__DEV__) console.error('[Auth] onboarding resolve error:', err)
            if (mounted && authEventVersion.current === version) {
              setNeedsOnboarding(false)
            }
          })
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // ── Auth actions ──────────────────────────────────────────────────────────

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (
    email: string,
    password: string,
  ): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error && __DEV__) console.error('[Auth] signOut error:', error.message)
  }

  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${APP_SCHEME}://reset-password`,
    })
    return { error }
  }

  const updatePassword = async (
    newPassword: string,
  ): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) setIsPasswordRecovery(false)
    return { error }
  }

  // ── Onboarding actions ────────────────────────────────────────────────────

  const completeOnboarding = async (): Promise<void> => {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, onboarding_completed: true }, { onConflict: 'id' })
    if (error && __DEV__) {
      console.warn(
        '[Onboarding] completeOnboarding: Supabase write failed — local state will still update.',
        '| message:', error.message,
        '| code:', error.code,
        '| details:', error.details,
        '| hint:', error.hint,
        '\nFull error:', JSON.stringify(error),
      )
    }
    await writeOnboardingCache(user.id, true)
    setNeedsOnboarding(false)
  }

  const triggerOnboarding = async (): Promise<void> => {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, onboarding_completed: false }, { onConflict: 'id' })
    if (error && __DEV__) {
      console.warn(
        '[Onboarding] triggerOnboarding: Supabase write failed — local state will still update.',
        '| message:', error.message,
        '| code:', error.code,
        '| details:', error.details,
        '| hint:', error.hint,
        '\nFull error:', JSON.stringify(error),
      )
    }
    await writeOnboardingCache(user.id, false)
    setNeedsOnboarding(true)
  }

  // ── Account deletion ──────────────────────────────────────────────────────

  const deleteAccount = async (): Promise<{ error: AppError | null }> => {
    if (!user) {
      return { error: { message: 'No user logged in' } }
    }

    const userId = user.id

    try {
      const { error: rpcError } = await supabase.rpc('delete_user')

      if (rpcError) {
        if (__DEV__) console.error('[Auth] deleteAccount RPC error:', rpcError.message)
        return { error: rpcError }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error during account deletion'
      if (__DEV__) console.error('[Auth] deleteAccount error:', message)
      return { error: { message } }
    }

    // Deletion confirmed server-side. Clean up local state.
    try {
      await AsyncStorage.multiRemove([
        onboardingKey(userId),
        'beluga_notif_prefs',
        'beluga_notif_id',
      ])
    } catch {}

    // Session is already invalidated server-side; signOut may fail — ignore it.
    try {
      await supabase.auth.signOut()
    } catch {}

    return { error: null }
  }

  // ── Context value ─────────────────────────────────────────────────────────

  const value: AuthContextType = {
    session,
    user,
    loading,
    needsOnboarding,
    isPasswordRecovery,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    resetPassword,
    updatePassword,
    completeOnboarding,
    triggerOnboarding,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
