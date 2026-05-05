import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// ── Local cache ───────────────────────────────────────────────────────────────
// AsyncStorage holds a fast-path boolean so the app can render without waiting
// for a Supabase round-trip on every cold start. Supabase is always the source
// of truth; the cache is only used when Supabase is temporarily unreachable.

function onboardingKey(userId: string) {
  return `@beluga/onboarding_${userId}`;
}

async function readOnboardingCache(userId: string): Promise<boolean | null> {
  try {
    const val = await AsyncStorage.getItem(onboardingKey(userId));
    return val === 'true' ? true : null;
  } catch {
    return null;
  }
}

async function writeOnboardingCache(userId: string, completed: boolean): Promise<void> {
  try {
    if (completed) {
      await AsyncStorage.setItem(onboardingKey(userId), 'true');
    } else {
      await AsyncStorage.removeItem(onboardingKey(userId));
    }
  } catch {}
}

// ── Supabase resolution ───────────────────────────────────────────────────────
// Returns true if the user has completed onboarding, false if not.
// Falls back to the local cache if Supabase is unreachable, then to false
// (show onboarding) when neither source has data.

async function resolveOnboardingCompleted(userId: string): Promise<boolean> {
  const cached = await readOnboardingCache(userId);

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    // null data means no profile row yet — brand new user, needs onboarding.
    const completed = data?.onboarding_completed === true;
    await writeOnboardingCache(userId, completed);
    return completed;
  } catch {
    if (__DEV__) {
      console.warn('[Onboarding] Supabase unavailable — falling back to cache:', cached);
    }
    // Cache === true  →  existing user on a flaky network, trust the cache.
    // Cache === null  →  unknown (possibly brand new user), show onboarding.
    return cached === true;
  }
}

// ── Context types ─────────────────────────────────────────────────────────────

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  completeOnboarding: () => Promise<void>;
  triggerOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]           = useState<Session | null>(null);
  const [user, setUser]                 = useState<User | null>(null);
  const [loading, setLoading]           = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Track which user ID we last resolved onboarding for. Prevents re-fetching
  // on TOKEN_REFRESHED events where the user hasn't changed.
  const resolvedUserRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // ── Initial session load ──────────────────────────────────────────────────
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        resolvedUserRef.current = session.user.id;
        const completed = await resolveOnboardingCompleted(session.user.id);
        if (mounted) setNeedsOnboarding(!completed);
      }

      if (mounted) setLoading(false);
    };

    init();

    // ── Auth state changes ────────────────────────────────────────────────────
    // Fires on: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          // Signed out or session expired.
          setNeedsOnboarding(false);
          resolvedUserRef.current = null;
          return;
        }

        // Re-resolve only when the user actually changes (new sign-in on a
        // different account, or first sign-in on this device). Skip the fetch
        // for TOKEN_REFRESHED and other events for the same user since the
        // onboarding state won't have changed.
        if (session.user.id !== resolvedUserRef.current) {
          resolvedUserRef.current = session.user.id;
          const completed = await resolveOnboardingCompleted(session.user.id);
          if (mounted) setNeedsOnboarding(!completed);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  // ── Onboarding actions ────────────────────────────────────────────────────

  const completeOnboarding = async () => {
    if (!user) return;

    // Persist to Supabase first (source of truth). upsert handles the case
    // where no profile row exists yet (brand new user completing onboarding
    // before any other profile interaction).
    try {
      await supabase
        .from('profiles')
        .upsert(
          { id: user.id, onboarding_completed: true },
          { onConflict: 'id' }
        );
    } catch {
      if (__DEV__) {
        console.warn('[Onboarding] Failed to persist completion to Supabase');
      }
      // Non-fatal: still update local state so the user is not blocked.
    }

    await writeOnboardingCache(user.id, true);
    setNeedsOnboarding(false);
  };

  // Called from the Settings → Getting Started flow to replay onboarding.
  const triggerOnboarding = async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .upsert(
          { id: user.id, onboarding_completed: false },
          { onConflict: 'id' }
        );
    } catch {
      if (__DEV__) {
        console.warn('[Onboarding] Failed to reset onboarding in Supabase');
      }
    }

    await writeOnboardingCache(user.id, false);
    setNeedsOnboarding(true);
  };

  // ── Account deletion ──────────────────────────────────────────────────────

  const deleteAccount = async () => {
    try {
      if (!user) {
        return { error: { message: 'No user logged in' } };
      }

      const userId = user.id;

      // Single RPC call — handles all table cleanup atomically server-side.
      const { error: rpcError } = await supabase.rpc('delete_user');

      if (rpcError) {
        if (__DEV__) {
          console.error('[deleteAccount] RPC error:', rpcError.message);
        }
        return { error: rpcError };
      }

      // Deletion confirmed. Clear all local state for this device.
      const localKeys = [
        onboardingKey(userId),
        'beluga_notif_prefs',
        'beluga_notif_id',
      ];
      try {
        await AsyncStorage.multiRemove(localKeys);
      } catch {}

      try {
        await supabase.auth.signOut();
      } catch {}

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // ── Context value ─────────────────────────────────────────────────────────

  const value: AuthContextType = {
    session,
    user,
    loading,
    needsOnboarding,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    resetPassword,
    completeOnboarding,
    triggerOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
