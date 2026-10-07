import React, { createContext, useState, useEffect, useContext, useRef } from 'react'
import { Linking } from 'react-native'
import { Session, User, AuthError } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { setWorkoutSessionOwner, clearWorkoutSessionForAccount } from '../utils/workoutSession'
import { withAccountTransitionLock } from '../utils/accountTransition'
import { parseRecoveryUrl, recoverySessionFailure, RECOVERY_CLEANUP_MESSAGE, RecoveryLinkState } from '../utils/passwordRecovery'
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

export type SignOutResult = { ok: boolean; message?: string }

// ── Local onboarding cache ────────────────────────────────────────────────────

function onboardingKey(userId: string) {
  return `@beluga/onboarding_${userId}`
}

async function readOnboardingCache(userId: string): Promise<boolean | null> {
  try {
    const val = await AsyncStorage.getItem(onboardingKey(userId))
    // Older "true" values could have been written after a failed server save.
    return val === 'server-confirmed:true' ? true : null
  } catch {
    return null
  }
}

async function writeOnboardingCache(userId: string, completed: boolean): Promise<void> {
  try {
    if (completed) {
      await AsyncStorage.setItem(onboardingKey(userId), 'server-confirmed:true')
    } else {
      await AsyncStorage.removeItem(onboardingKey(userId))
    }
  } catch {}
}

async function withAuthTimeout<T>(operation: Promise<T>, milliseconds = 15000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Session check timed out. Please retry.')), milliseconds)
      }),
    ])
  } finally {
    if (timer !== undefined) clearTimeout(timer)
  }
}

async function resolveOnboardingCompleted(userId: string, isCurrent: () => boolean = () => true): Promise<boolean> {
  const cached = await readOnboardingCache(userId)

  const run = () =>
    supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle()

  let result
  try {
    result = await run()
    if (result.error?.code === 'PGRST002') {
      await new Promise<void>((resolve) => setTimeout(resolve, 1500))
      result = await run()
    }
  } catch {
    if (cached === true) return true
    throw new Error('Couldn’t check onboarding. Check your connection and retry.')
  }
  const { data, error } = result

  // PGRST002 = PostgREST schema-cache reload in progress (transient).
  // Wait 1.5 s and retry once before falling back to the local cache.
  if (error) {
    if (cached === true) return true
    throw new Error('Couldn’t check onboarding. Check your connection and retry.')
  }

  const completed = data?.onboarding_completed === true
  if (isCurrent()) await writeOnboardingCache(userId, completed)
  return completed
}

// ── Context types ─────────────────────────────────────────────────────────────

interface AuthContextType {
  session:            Session | null
  user:               User | null
  loading:            boolean
  startupError: string
  retryStartup: () => Promise<void>
  onboardingBusy: boolean
  needsOnboarding:    boolean
  isPasswordRecovery: boolean
  recoveryOwnerId: string | null
  recoveryLinkState: RecoveryLinkState
  recoveryRequestMode: boolean
  cancelRecovery: () => void
  requestAnotherResetLink: () => void
  accountCleanupError: string
  accountCleanupBusy: boolean
  retryAccountCleanup: () => Promise<void>
  signIn:             (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp:             (email: string, password: string) => ReturnType<typeof supabase.auth.signUp>
  signOut:            () => Promise<SignOutResult>
  deleteAccount:      () => Promise<{ error: AppError | null }>
  resetPassword:      (email: string) => Promise<{ error: AuthError | null }>
  updatePassword:     (newPassword: string) => Promise<{ error: AppError | null }>
  completeOnboarding: () => Promise<boolean>
  triggerOnboarding:  () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]                       = useState<Session | null>(null)
  const [user, setUser]                             = useState<User | null>(null)
  const [loading, setLoading]                       = useState(true)
  const [startupError, setStartupError] = useState('')
  const [onboardingBusy, setOnboardingBusy] = useState(false)
  const onboardingInProgressRef = useRef(false)
  const profileResolutionRef = useRef(0)
  const restoreAttemptRef = useRef(0)
  const [needsOnboarding, setNeedsOnboarding]       = useState(false)
  const [recoveryOwnerId, setRecoveryOwnerId] = useState<string | null>(null)
  const [recoveryLinkState, setRecoveryLinkState] = useState<RecoveryLinkState>({ status: 'idle', message: '' })
  const [recoveryRequestMode, setRecoveryRequestMode] = useState(false)
  const recoveryOwnerRef = useRef<string | null>(null)
  const recoveryAttemptRef = useRef(0)
  const authRestorePromiseRef = useRef<Promise<void> | null>(null)
  const isPasswordRecovery = !!recoveryOwnerId && recoveryOwnerId === user?.id
  const [accountCleanupError, setAccountCleanupError] = useState('')
  const [accountCleanupBusy, setAccountCleanupBusy] = useState(false)
  const cleanupInProgressRef = useRef(false)
  const accountTransitionInProgressRef = useRef(false)
  const signOutScreenOwnerRef = useRef<string | null>(null)
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

  const bindRecoveryOwner = (owner: string | null) => {
    recoveryOwnerRef.current = owner
    setRecoveryOwnerId(owner)
  }

  const cancelRecovery = () => {
    ++recoveryAttemptRef.current
    bindRecoveryOwner(null)
    setRecoveryLinkState({ status: 'idle', message: '' })
    setRecoveryRequestMode(false)
    // Never restore a previous owner's session/data on cancel.
  }

  const requestAnotherResetLink = () => {
    cancelRecovery()
    setRecoveryRequestMode(true)
  }

  const applyRecoveryUrl = async (url: string | null): Promise<void> => {
    if (!url || !authMountedRef.current) return
    // Linking.getInitialURL() also returns ordinary web/Expo launch URLs.
    // Do not turn opening the app into an invalid-reset-link screen. A URL
    // targeting the reset destination still receives controlled validation.
    try {
      const initial = new URL(url)
      if (initial.protocol !== `${APP_SCHEME}:` && initial.hostname !== 'reset-password' &&
          initial.pathname !== '/reset-password') return
    } catch {
      if (!url.startsWith(APP_SCHEME)) return
    }
    const attempt = ++recoveryAttemptRef.current
    const current = () => authMountedRef.current && recoveryAttemptRef.current === attempt
    bindRecoveryOwner(null)
    setRecoveryRequestMode(false)
    setRecoveryLinkState({ status: 'processing', message: '' })
    let completed = false
    try {
      const parsed = parseRecoveryUrl(url)
      if (parsed.status !== 'valid') {
        completed = true
        if (current()) setRecoveryLinkState(parsed)
        return
      }
      if (!authReadyRef.current) await authRestorePromiseRef.current
      if (!current()) return
      if (!authReadyRef.current) throw new Error(RECOVERY_CLEANUP_MESSAGE)
      if (cleanupInProgressRef.current || accountTransitionInProgressRef.current) {
        throw new Error('Please wait for the current account operation to finish, then open your reset link again.')
      }
      await beginAccountTransition(async () => {
        // Before importing credentials, the link owner is unverified. Block all
        // imports on pending cleanup rather than trusting unverified JWT claims.
        const cleanup = await readPendingAccountCleanup()
        if (cleanup || pendingCleanupRef.current) {
          if (cleanup) pendingCleanupRef.current = cleanup
          setAccountCleanupError(RECOVERY_CLEANUP_MESSAGE)
          throw new Error(RECOVERY_CLEANUP_MESSAGE)
        }
        if (!current()) return
        const importVersion = authEventVersion.current
        const { data, error } = await supabase.auth.setSession({
          access_token: parsed.accessToken, refresh_token: parsed.refreshToken,
        })
        if (!current()) return
        if (error) {
          completed = true
          bindRecoveryOwner(null)
          setRecoveryLinkState(recoverySessionFailure(error))
          return
        }
        const owner = data.session?.user?.id
        if (!owner) throw new Error('Recovery session unavailable')
        // A normal SDK import may already have applied this owner. An
        // intervening different-owner event must not be overwritten by its
        // older response (including sign-out or another-tab sign-in).
        if (authEventVersion.current !== importVersion && currentUserIdRef.current !== owner) {
          throw new Error('Recovery account changed')
        }
        // Apply identity before releasing the app lock; profile resolution may
        // continue asynchronously with its existing owner/epoch guards.
        void applyAuthSession(data.session)
        if (currentUserIdRef.current !== owner) throw new Error('Recovery account changed')
        bindRecoveryOwner(owner)
        setRecoveryLinkState({ status: 'ready', message: '' })
        completed = true
      })
    } catch (error) {
      if (current()) {
        completed = true
        bindRecoveryOwner(null)
        const message = error instanceof Error ? error.message : ''
        setRecoveryLinkState(message === RECOVERY_CLEANUP_MESSAGE ||
          message === 'Please wait for the current account operation to finish, then open your reset link again.'
          ? { status: 'failed', message } : recoverySessionFailure({}))
      }
    } finally {
      if (current() && !completed) {
        bindRecoveryOwner(null)
        setRecoveryLinkState(recoverySessionFailure({}))
      }
    }
  }

  useEffect(() => {
    let mounted = true
    const initialAttempt = recoveryAttemptRef.current
    void Linking.getInitialURL().then(async url => {
      if (mounted) await applyRecoveryUrl(url)
    }).catch(() => {
      if (mounted && recoveryAttemptRef.current === initialAttempt) {
        bindRecoveryOwner(null)
        setRecoveryLinkState(recoverySessionFailure({}))
      }
    })
    const linkSub = Linking.addEventListener('url', ({ url }) => { void applyRecoveryUrl(url) })
    return () => {
      mounted = false
      ++recoveryAttemptRef.current
      linkSub.remove()
    }
  }, [])

  // ── Auth state listener ───────────────────────────────────────────────────

  const invalidateLocalAuth = () => {
    signOutScreenOwnerRef.current = null
    ++authEventVersion.current
    ++profileResolutionRef.current
    setStartupError('')
    setWorkoutSessionOwner(null)
    currentUserIdRef.current = null
    resolvedUserRef.current = null
    setSession(null)
    setUser(null)
    setNeedsOnboarding(false)
    if (recoveryOwnerRef.current) cancelRecovery()
    else bindRecoveryOwner(null)
    setLoading(false)
  }

  const invalidateAccountAuth = (ownerUserId: string) => {
    if (!currentUserIdRef.current || currentUserIdRef.current === ownerUserId) invalidateLocalAuth()
  }

  const applyAuthSession = async (nextSession: Session | null, recovery = false): Promise<void> => {
    if (!authReadyRef.current || !authMountedRef.current) return
    const nextId = nextSession?.user?.id ?? null
    if (recoveryOwnerRef.current && recoveryOwnerRef.current !== nextId) cancelRecovery()
    // Same-account token refresh must not strand an in-flight onboarding load.
    const version = nextId !== currentUserIdRef.current
      ? ++authEventVersion.current : authEventVersion.current
    // Keep the initiating screen while deletion is in flight, or while an SDK
    // logout failure is being reported. Draft reads/writes remain marker-blocked.
    if (nextId && nextId === pendingCleanupRef.current?.ownerUserId &&
        currentUserIdRef.current === nextId &&
        ((pendingCleanupRef.current.kind === 'sign-out' && signOutScreenOwnerRef.current === nextId) ||
          (pendingCleanupRef.current.kind === 'delete-account' && cleanupInProgressRef.current))) return
    if (!nextId || nextId === pendingCleanupRef.current?.ownerUserId) {
      invalidateLocalAuth()
      return
    }
    setWorkoutSessionOwner(nextId)
    currentUserIdRef.current = nextId
    setSession(nextSession)
    setUser(nextSession!.user)
    if (recovery && !cleanupInProgressRef.current && !pendingCleanupRef.current) {
      bindRecoveryOwner(nextId)
      setRecoveryLinkState({ status: 'ready', message: '' })
    }
    if (nextId === resolvedUserRef.current) return
    resolvedUserRef.current = nextId
    const attempt = ++profileResolutionRef.current
    const current = () => authMountedRef.current && authEventVersion.current === version &&
      currentUserIdRef.current === nextId && profileResolutionRef.current === attempt
    setStartupError('')
    setNeedsOnboarding(true)
    setLoading(true)
    try {
      const completed = await withAuthTimeout(resolveOnboardingCompleted(nextId, current))
      if (current()) setNeedsOnboarding(!completed)
    } catch {
      if (current()) {
        resolvedUserRef.current = null
        setNeedsOnboarding(true)
        setStartupError('Couldn’t check your onboarding status. Check your connection and retry.')
      }
    } finally {
      if (current()) {
        setLoading(false)
        ++profileResolutionRef.current
      }
    }
  }

  const restoreAuthSession = async (): Promise<void> => {
    const attempt = ++restoreAttemptRef.current
    const version = authEventVersion.current
    const current = () => authMountedRef.current && restoreAttemptRef.current === attempt &&
      authEventVersion.current === version
    setStartupError('')
    // Background cleanup retry must not unmount an already-resolved B screen.
    if (!currentUserIdRef.current || resolvedUserRef.current !== currentUserIdRef.current) setLoading(true)
    try {
      // Read the durable suppression marker before accepting any SDK session.
      const cleanup = await withAuthTimeout(readPendingAccountCleanup())
      if (!current()) return
      pendingCleanupRef.current = cleanup
      authReadyRef.current = true
      if (pendingCleanupRef.current) {
        setAccountCleanupError('Local account cleanup is incomplete. The previous account’s workout is blocked. Retry local cleanup.')
      } else {
        setAccountCleanupError('')
      }
      const { data: { session: restored }, error } = await withAuthTimeout(supabase.auth.getSession())
      if (error) throw error
      if (current()) await applyAuthSession(restored)
    } catch {
      if (!current()) return
      authReadyRef.current = false
      invalidateLocalAuth()
      setStartupError('Couldn’t safely restore your session and local account state. Check your connection and retry.')
    } finally {
      if (authMountedRef.current && !currentUserIdRef.current) setLoading(false)
    }
  }

  const retryStartup = async (): Promise<void> => {
    if (cleanupInProgressRef.current || accountTransitionInProgressRef.current) return
    resolvedUserRef.current = null
    ++profileResolutionRef.current
    authRestorePromiseRef.current = restoreAuthSession()
    await authRestorePromiseRef.current
  }

  useEffect(() => {
    authMountedRef.current = true
    authRestorePromiseRef.current = restoreAuthSession()
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
  ): ReturnType<typeof supabase.auth.signUp> => {
    if (!authReadyRef.current || cleanupInProgressRef.current) throw new Error('Local account cleanup is not ready.')
    return await beginAccountTransition(() => supabase.auth.signUp({ email, password }))
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
      setAccountCleanupError(currentUserIdRef.current === cleanup.ownerUserId
        ? 'Couldn’t finish signing out. Retry local account cleanup.'
        : 'Local account cleanup is incomplete. You are signed out of the previous account locally, but some saved data may remain blocked on this device. Retry local cleanup.')
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

  const signOut = async (): Promise<SignOutResult> => {
    if (cleanupInProgressRef.current || accountTransitionInProgressRef.current) {
      return { ok: false, message: 'Please wait for the current account operation to finish.' }
    }
    if (pendingCleanupRef.current) {
      const message = 'Finish local account cleanup before signing out.'
      setAccountCleanupError(message)
      return { ok: false, message }
    }
    if (!user) return { ok: true, message: 'You are already signed out.' }
    cleanupInProgressRef.current = true
    setAccountCleanupBusy(true)
    const cleanup: PendingAccountCleanup = { ownerUserId: user.id, kind: 'sign-out' }
    try {
      await beginAccountCleanup(cleanup)
      pendingCleanupRef.current = cleanup
      signOutScreenOwnerRef.current = cleanup.ownerUserId
      setWorkoutSessionOwner(null)
      const cleared = await finishLocalAccountCleanup(cleanup)
      if (!cleared) return {
        ok: !currentUserIdRef.current,
        message: !currentUserIdRef.current
          ? 'You are signed out, but local cleanup is incomplete. Retry local account cleanup.'
          : 'Couldn’t finish signing out. Retry local account cleanup.',
      }
      if (currentUserIdRef.current && currentUserIdRef.current !== cleanup.ownerUserId) {
        return { ok: false, message: 'The signed-in account changed. Please try signing out again.' }
      }
      invalidateAccountAuth(cleanup.ownerUserId)
      return { ok: true }
    } catch {
      const message = 'Couldn’t prepare local cleanup. Sign-out was not performed. Please retry.'
      setAccountCleanupError(message)
      return { ok: false, message }
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
  ): Promise<{ error: AppError | null }> => {
    if (cleanupInProgressRef.current) return { error: { message: RECOVERY_CLEANUP_MESSAGE } }
    const ownerUserId = currentUserIdRef.current
    if (pendingCleanupRef.current?.ownerUserId === ownerUserId) {
      return { error: { message: RECOVERY_CLEANUP_MESSAGE } }
    }
    const version = authEventVersion.current
    const { error } = await beginAccountTransition(async (currentSession) => {
      const cleanup = await readPendingAccountCleanup()
      if (cleanup?.ownerUserId === ownerUserId) return { error: { message: RECOVERY_CLEANUP_MESSAGE } }
      if (!ownerUserId || currentSession?.user.id !== ownerUserId) {
        return { error: { message: 'The signed-in account changed. Password update was not performed.' } }
      }
      return supabase.auth.updateUser({ password: newPassword })
    }, true)
    if (!error && currentUserIdRef.current === ownerUserId && authEventVersion.current === version) cancelRecovery()
    return { error }
  }

  // ── Onboarding actions ────────────────────────────────────────────────────

  const completeOnboarding = async (): Promise<boolean> => {
    if (onboardingInProgressRef.current) return false
    const ownerUserId = user?.id
    const version = authEventVersion.current
    const current = () => authMountedRef.current && currentUserIdRef.current === ownerUserId &&
      authEventVersion.current === version
    if (!ownerUserId || !authReadyRef.current || !current() ||
        cleanupInProgressRef.current || pendingCleanupRef.current || accountTransitionInProgressRef.current) {
      throw new Error('Account state changed or cleanup is pending. Finish account cleanup and retry.')
    }
    onboardingInProgressRef.current = true
    setOnboardingBusy(true)
    try {
      return await beginAccountTransition(async (storedSession) => {
        const marker = await readPendingAccountCleanup()
        if (!current() || marker || cleanupInProgressRef.current || pendingCleanupRef.current ||
            storedSession?.user.id !== ownerUserId) throw new Error('Account state changed.')
        const { error } = await supabase.from('profiles')
          .upsert({ id: ownerUserId, onboarding_completed: true }, { onConflict: 'id' })
        if (error) throw error
        if (!current() || cleanupInProgressRef.current || pendingCleanupRef.current) throw new Error('Account state changed.')
        await writeOnboardingCache(ownerUserId, true)
        if (!current()) throw new Error('Account state changed.')
        setNeedsOnboarding(false)
        return true
      }, true)
    } catch {
      throw new Error('Couldn’t save onboarding completion. Check your connection and retry.')
    } finally {
      onboardingInProgressRef.current = false
      if (authMountedRef.current) setOnboardingBusy(false)
    }
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
    startupError,
    retryStartup,
    onboardingBusy,
    needsOnboarding,
    isPasswordRecovery,
    recoveryOwnerId,
    recoveryLinkState,
    recoveryRequestMode,
    cancelRecovery,
    requestAnotherResetLink,
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
