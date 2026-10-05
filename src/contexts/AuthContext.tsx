import React, { createContext, useState, useEffect, useContext, useRef } from 'react'
import { Linking } from 'react-native'
import { Session, User, AuthError } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { setWorkoutSessionOwner, clearWorkoutSessionForAccount } from '../utils/workoutSession'
import { withAccountTransitionLock } from '../utils/accountTransition'
import {
  PendingAccountCleanup, readPendingAccountCleanup,
  beginAccountCleanup, removeAccountCleanupMarker,
} from '../utils/accountCleanup'

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

async function resolveOnboardingCompleted(userId: string, isCurrent: () => boolean = () => true): Promise<boolean> {
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
  if (isCurrent()) await writeOnboardingCache(userId, completed)
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
  accountCleanupError: string
  accountCleanupBusy: boolean
  retryAccountCleanup: () => Promise<void>
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
  const [accountCleanupError, setAccountCleanupError] = useState('')
  const [accountCleanupBusy, setAccountCleanupBusy] = useState(false)
  const cleanupInProgressRef = useRef(false)
  const accountTransitionInProgressRef = useRef(false)
  const pendingCleanupRef = useRef<PendingAccountCleanup | null>(null)
  const authReadyRef = useRef(false)
  const authMountedRef = useRef(true)
  const currentUserIdRef = useRef<string | null>(null)

  // Tracks which user we last resolved onboarding for. Prevents redundant
  // Supabase round-trips on TOKEN_REFRESHED events for the same user.
  const resolvedUserRef = useRef<string | null>(null)

  // Account epoch: async work checks this before applying state. Same-account
  // token refreshes do not invalidate an already-running onboarding resolution.
  const authEventVersion = useRef(0)

  // ── Deep link handler ─────────────────────────────────────────────────────
  // Parses recovery tokens from belugafit:// URLs and calls setSession so that
  // onAuthStateChange fires PASSWORD_RECOVERY. Handles both cold starts
  // (app opened via tapping the link) and warm starts (app already open).

  useEffect(() => {
    let mounted = true

    const applyRecoveryUrl = async (url: string | null): Promise<void> => {
      if (!url || cleanupInProgressRef.current || accountTransitionInProgressRef.current) return
      const tokens = parseRecoveryUrl(url)
      if (!tokens) return

      const { data, error } = await beginAccountTransition(() => supabase.auth.setSession({
        access_token:  tokens.accessToken,
        refresh_token: tokens.refreshToken,
      }))

      if (error) {
        if (__DEV__) console.error('[Auth] setSession error:', error.message)
        return
      }

      // setSession() with a recovery token emits SIGNED_IN (not PASSWORD_RECOVERY)
      // when detectSessionInUrl is false. We therefore set the flag directly here,
      // using the successfully-parsed recovery URL as the proof of intent.
      // The PASSWORD_RECOVERY branch in onAuthStateChange remains as a secondary
      // path for environments where the event does fire.
      if (pendingCleanupRef.current && !currentUserIdRef.current) return
      if (currentUserIdRef.current && data.session?.user.id !== currentUserIdRef.current) return
      setIsPasswordRecovery(true)
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

  const invalidateLocalAuth = () => {
    ++authEventVersion.current
    setWorkoutSessionOwner(null)
    currentUserIdRef.current = null
    resolvedUserRef.current = null
    setSession(null)
    setUser(null)
    setNeedsOnboarding(false)
    setIsPasswordRecovery(false)
    setLoading(false)
  }

  const invalidateAccountAuth = (ownerUserId: string) => {
    if (!currentUserIdRef.current || currentUserIdRef.current === ownerUserId) invalidateLocalAuth()
  }

  const applyAuthSession = async (nextSession: Session | null, recovery = false): Promise<void> => {
    if (!authReadyRef.current || !authMountedRef.current) return
    const nextId = nextSession?.user?.id ?? null
    // Same-account token refresh must not strand an in-flight onboarding load.
    const version = nextId !== currentUserIdRef.current
      ? ++authEventVersion.current : authEventVersion.current
    // Recording delete intent must not unmount the review screen on a same-user
    // refresh before the RPC outcome is known. Writes remain marker-blocked.
    if (nextId && nextId === pendingCleanupRef.current?.ownerUserId &&
        pendingCleanupRef.current.kind === 'delete-account' &&
        cleanupInProgressRef.current && currentUserIdRef.current === nextId) return
    if (!nextId || nextId === pendingCleanupRef.current?.ownerUserId) {
      invalidateLocalAuth()
      return
    }
    setWorkoutSessionOwner(nextId)
    currentUserIdRef.current = nextId
    setSession(nextSession)
    setUser(nextSession!.user)
    if (recovery) setIsPasswordRecovery(true)
    if (nextId === resolvedUserRef.current) return
    resolvedUserRef.current = nextId
    setNeedsOnboarding(false)
    setLoading(true)
    try {
      const completed = await resolveOnboardingCompleted(nextId, () =>
        authMountedRef.current && authEventVersion.current === version && currentUserIdRef.current === nextId)
      if (authMountedRef.current && authEventVersion.current === version &&
          currentUserIdRef.current === nextId) setNeedsOnboarding(!completed)
    } catch (err) {
      if (__DEV__) console.error('[Auth] onboarding resolve error:', err)
    } finally {
      if (authMountedRef.current && authEventVersion.current === version) setLoading(false)
    }
  }

  const restoreAuthSession = async (): Promise<void> => {
    try {
      // Read the durable suppression marker before accepting any SDK session.
      pendingCleanupRef.current = await readPendingAccountCleanup()
      authReadyRef.current = true
      if (pendingCleanupRef.current) {
        setAccountCleanupError('Local account cleanup is incomplete. The previous account’s workout is blocked. Retry local cleanup.')
      } else {
        setAccountCleanupError('')
      }
      const version = authEventVersion.current
      const { data: { session: restored }, error } = await supabase.auth.getSession()
      if (error) throw error
      if (authMountedRef.current && version === authEventVersion.current) await applyAuthSession(restored)
    } catch {
      authReadyRef.current = false
      invalidateLocalAuth()
      setAccountCleanupError('Couldn’t safely check local account data. Retry local cleanup before signing in.')
    } finally {
      if (authMountedRef.current && !currentUserIdRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    authMountedRef.current = true
    void restoreAuthSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Do not await Supabase work inside its auth callback.
      void applyAuthSession(nextSession, event === 'PASSWORD_RECOVERY')
    })
    return () => {
      authMountedRef.current = false
      ++authEventVersion.current
      setWorkoutSessionOwner(null)
      subscription.unsubscribe()
    }
  }, [])

  // ── Auth actions ──────────────────────────────────────────────────────────

  const beginAccountTransition = async <T,>(
    operation: (currentSession: Session | null) => Promise<T>,
    requireSharedLock = false,
  ): Promise<T> => {
    if (accountTransitionInProgressRef.current) throw new Error('An account transition is already in progress. Please retry.')
    // Claim before any await, including the session read. Login/recovery that
    // started earlier owns this flag until its SDK operation actually finishes.
    accountTransitionInProgressRef.current = true
    try {
      return await withAccountTransitionLock(async () => {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        if (error) throw error
        return await operation(currentSession)
      }, requireSharedLock)
    } finally {
      accountTransitionInProgressRef.current = false
    }
  }

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: AuthError | null }> => {
    if (!authReadyRef.current || cleanupInProgressRef.current) throw new Error('Local account cleanup is not ready.')
    const { error } = await beginAccountTransition(() => supabase.auth.signInWithPassword({ email, password }))
    return { error }
  }

  const signUp = async (
    email: string,
    password: string,
  ): Promise<{ error: AuthError | null }> => {
    if (!authReadyRef.current || cleanupInProgressRef.current) throw new Error('Local account cleanup is not ready.')
    const { error } = await beginAccountTransition(() => supabase.auth.signUp({ email, password }))
    return { error }
  }

  const finishLocalAccountCleanup = async (cleanup: PendingAccountCleanup): Promise<boolean> => {
    try {
      await beginAccountTransition(async (storedSession) => {
        // Comparison and sign-out hold the same app lock. No supported login,
        // recovery, deletion or other-tab transition can change the owner here.
        if (storedSession?.user.id === cleanup.ownerUserId) {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
        }
      }, true)
      await clearWorkoutSessionForAccount(cleanup.ownerUserId)
      if (cleanup.kind === 'delete-account') {
        const keys = [onboardingKey(cleanup.ownerUserId)]
        // Shared preference keys may now belong to B when retrying A's cleanup.
        if (!currentUserIdRef.current || currentUserIdRef.current === cleanup.ownerUserId) {
          keys.push('beluga_notif_prefs', 'beluga_notif_id')
        }
        await AsyncStorage.multiRemove(keys)
      }
      await removeAccountCleanupMarker()
      pendingCleanupRef.current = null
      setAccountCleanupError('')
      return true
    } catch {
      setAccountCleanupError('Local account cleanup is incomplete. You are signed out of the previous account locally, but some saved data may remain blocked on this device. Retry local cleanup.')
      return false
    }
  }

  const retryAccountCleanup = async (): Promise<void> => {
    if (cleanupInProgressRef.current || accountTransitionInProgressRef.current) return
    cleanupInProgressRef.current = true
    setAccountCleanupBusy(true)
    try {
      const cleanup = pendingCleanupRef.current ?? await readPendingAccountCleanup()
      if (cleanup) {
        pendingCleanupRef.current = cleanup
        if (!currentUserIdRef.current || currentUserIdRef.current === cleanup.ownerUserId) invalidateLocalAuth()
        await finishLocalAccountCleanup(cleanup)
      }
      await restoreAuthSession()
    } catch {
      setAccountCleanupError('Couldn’t safely check local account data. Retry local cleanup.')
    } finally {
      cleanupInProgressRef.current = false
      setAccountCleanupBusy(false)
    }
  }

  const signOut = async (): Promise<void> => {
    if (!user || cleanupInProgressRef.current || accountTransitionInProgressRef.current) return
    if (pendingCleanupRef.current) {
      setAccountCleanupError('Finish the pending local account cleanup before signing out. Retry local cleanup.')
      return
    }
    cleanupInProgressRef.current = true
    setAccountCleanupBusy(true)
    const cleanup: PendingAccountCleanup = { ownerUserId: user.id, kind: 'sign-out' }
    try {
      await beginAccountCleanup(cleanup)
      pendingCleanupRef.current = cleanup
      invalidateAccountAuth(cleanup.ownerUserId)
      await finishLocalAccountCleanup(cleanup)
    } catch {
      setAccountCleanupError('Couldn’t prepare local cleanup. Sign-out was not performed. Please retry.')
    } finally {
      cleanupInProgressRef.current = false
      setAccountCleanupBusy(false)
    }
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
    if (cleanupInProgressRef.current) throw new Error('Local account cleanup is in progress.')
    const ownerUserId = currentUserIdRef.current
    const version = authEventVersion.current
    const { error } = await beginAccountTransition((currentSession) => {
      if (!ownerUserId || currentSession?.user.id !== ownerUserId) {
        throw new Error('The signed-in account changed. Password update was not performed.')
      }
      return supabase.auth.updateUser({ password: newPassword })
    }, true)
    if (!error && currentUserIdRef.current === ownerUserId && authEventVersion.current === version) setIsPasswordRecovery(false)
    return { error }
  }

  // ── Onboarding actions ────────────────────────────────────────────────────

  const completeOnboarding = async (): Promise<void> => {
    if (!user) return
    const version = authEventVersion.current
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
    if (version !== authEventVersion.current || currentUserIdRef.current !== user.id) return
    await writeOnboardingCache(user.id, true)
    if (authMountedRef.current && version === authEventVersion.current &&
        currentUserIdRef.current === user.id) setNeedsOnboarding(false)
  }

  const triggerOnboarding = async (): Promise<void> => {
    if (!user) return
    const version = authEventVersion.current
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
    if (version !== authEventVersion.current || currentUserIdRef.current !== user.id) return
    await writeOnboardingCache(user.id, false)
    if (authMountedRef.current && version === authEventVersion.current &&
        currentUserIdRef.current === user.id) setNeedsOnboarding(true)
  }

  // ── Account deletion ──────────────────────────────────────────────────────

  const deleteAccount = async (): Promise<{ error: AppError | null }> => {
    if (!user) {
      return { error: { message: 'No user logged in' } }
    }

    const userId = user.id
    if (cleanupInProgressRef.current || accountTransitionInProgressRef.current || pendingCleanupRef.current) {
      return { error: { message: 'Finish local account cleanup before deleting the account.' } }
    }
    cleanupInProgressRef.current = true
    setAccountCleanupBusy(true)
    const cleanup: PendingAccountCleanup = { ownerUserId: userId, kind: 'delete-account' }
    try {
      // If durable suppression cannot be recorded, do not start deletion.
      await beginAccountCleanup(cleanup)
    } catch (err: unknown) {
      cleanupInProgressRef.current = false
      setAccountCleanupBusy(false)
      return { error: { message: 'Couldn’t prepare local cleanup. Your account was not deleted. Please retry.' } }
    }
    pendingCleanupRef.current = cleanup
    if (currentUserIdRef.current === userId) setWorkoutSessionOwner(null)
    let deletionRejected = true
    try {
      const { error: rpcError } = await beginAccountTransition(async (currentSession) => {
        if (currentUserIdRef.current !== userId || currentSession?.user.id !== userId) {
          deletionRejected = true
          throw new Error('The signed-in account changed. Account deletion was not performed.')
        }
        deletionRejected = false
        return await supabase.rpc('delete_user')
      }, true)
      if (rpcError) {
        // A transport failure may occur after server deletion. Only an explicit
        // server rejection permits releasing the durable suppression marker.
        deletionRejected = !!rpcError.code && !/network|fetch|timeout|abort/i.test(rpcError.message)
        throw rpcError
      }
    } catch (err: unknown) {
      if (!deletionRejected) {
        invalidateAccountAuth(userId)
        setAccountCleanupError('Account deletion could not be confirmed. You are signed out locally and the old workout is blocked. Retry local cleanup; this will not repeat account deletion.')
        cleanupInProgressRef.current = false
        setAccountCleanupBusy(false)
        return { error: { message: 'Account deletion could not be confirmed. Local account data remains blocked.' } }
      }
      try {
        await removeAccountCleanupMarker()
        pendingCleanupRef.current = null
        setWorkoutSessionOwner(currentUserIdRef.current)
        await restoreAuthSession()
      } catch {
        invalidateAccountAuth(userId)
        setAccountCleanupError('Account deletion was not confirmed, and local cleanup is incomplete. Retry local cleanup to sign out safely.')
      }
      cleanupInProgressRef.current = false
      setAccountCleanupBusy(false)
      const message = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Unexpected error during account deletion'
      return { error: { message } }
    }
    // Server deletion succeeded. Never leave the deleted user in local context.
    invalidateAccountAuth(userId)
    const cleared = await finishLocalAccountCleanup(cleanup)
    if (!cleared) setAccountCleanupError('Your account was deleted, but some local data could not be cleared. You are signed out locally and the old workout is blocked. Retry local cleanup.')
    cleanupInProgressRef.current = false
    setAccountCleanupBusy(false)
    return { error: null }
  }

  // ── Context value ─────────────────────────────────────────────────────────

  const value: AuthContextType = {
    session,
    user,
    loading,
    needsOnboarding,
    isPasswordRecovery,
    accountCleanupError,
    accountCleanupBusy,
    retryAccountCleanup,
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
