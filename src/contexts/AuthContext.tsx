import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Linking } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// ── Deep link scheme ──────────────────────────────────────────────────────────
// Must match app.json "scheme" and the redirectTo passed to resetPasswordForEmail.
const APP_SCHEME = 'belugafit';

// ── Local onboarding cache ────────────────────────────────────────────────────

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

async function resolveOnboardingCompleted(userId: string): Promise<boolean> {
  const cached = await readOnboardingCache(userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    const completed = data?.onboarding_completed === true;
    await writeOnboardingCache(userId, completed);
    return completed;
  } catch {
    if (__DEV__) {
      console.warn('[Onboarding] Supabase unavailable — falling back to cache:', cached);
    }
    return cached === true;
  }
}

// ── Deep link parser ──────────────────────────────────────────────────────────
// Supabase password recovery emails redirect to:
//   belugafit://reset-password#access_token=xxx&refresh_token=xxx&type=recovery
//
// React Native's Linking module does not expose URL fragments on Android, so
// Supabase actually encodes the tokens as query params when using a custom
// scheme redirect. We parse both locations to be safe.

function parseRecoveryUrl(url: string): {
  accessToken: string;
  refreshToken: string;
} | null {
  if (!url || !url.startsWith(APP_SCHEME)) return null;

  // Try fragment first (#access_token=…)
  const hashIdx = url.indexOf('#');
  const qIdx    = url.indexOf('?');

  const paramStr = hashIdx !== -1
    ? url.slice(hashIdx + 1)
    : qIdx !== -1
      ? url.slice(qIdx + 1)
      : '';

  if (!paramStr) return null;

  const params: Record<string, string> = {};
  paramStr.split('&').forEach((pair) => {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) return;
    const k = decodeURIComponent(pair.slice(0, eqIdx));
    const v = decodeURIComponent(pair.slice(eqIdx + 1));
    params[k] = v;
  });

  if (params.type !== 'recovery') return null;
  if (!params.access_token || !params.refresh_token) return null;

  return { accessToken: params.access_token, refreshToken: params.refresh_token };
}

// ── Context types ─────────────────────────────────────────────────────────────

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  needsOnboarding: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  completeOnboarding: () => Promise<void>;
  triggerOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]                   = useState<Session | null>(null);
  const [user, setUser]                         = useState<User | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [needsOnboarding, setNeedsOnboarding]   = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const resolvedUserRef = useRef<string | null>(null);

  // ── Deep link handler ─────────────────────────────────────────────────────
  // Called for both cold-start URLs and URLs received while the app is open.
  // If the URL contains a Supabase recovery token, we call setSession so that
  // onAuthStateChange fires PASSWORD_RECOVERY and the app shows the reset screen.

  useEffect(() => {
    let mounted = true;

    const applyRecoveryUrl = async (url: string | null) => {
      if (!url) return;
      const tokens = parseRecoveryUrl(url);
      if (!tokens) return;

      if (__DEV__) console.log('[Auth] Recovery deep link detected');

      const { error } = await supabase.auth.setSession({
        access_token:  tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      if (error) {
        if (__DEV__) console.error('[Auth] setSession error:', error.message);
      }
      // On success, onAuthStateChange fires PASSWORD_RECOVERY which sets
      // isPasswordRecovery = true. No further action needed here.
    };

    // Cold start — app opened by tapping the reset link
    Linking.getInitialURL().then((url) => {
      if (mounted) applyRecoveryUrl(url);
    });

    // Warm start — link tapped while app is already running
    const linkSub = Linking.addEventListener('url', ({ url }) => {
      applyRecoveryUrl(url);
    });

    return () => {
      mounted = false;
      linkSub.remove();
    };
  }, []);

  // ── Auth state listener ───────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (__DEV__) console.log('[Auth] event:', event);

        setSession(session);
        setUser(session?.user ?? null);

        // Password recovery — show the new password screen instead of normal app.
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          return;
        }

        if (!session?.user) {
          setNeedsOnboarding(false);
          setIsPasswordRecovery(false);
          resolvedUserRef.current = null;
          return;
        }

        // Only re-resolve onboarding when the authenticated user actually changes.
        // Skips TOKEN_REFRESHED and other events for the same user.
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
    // redirectTo must use the registered app scheme so the OS routes the link
    // back into the app. The path after :// is arbitrary but helps with parsing.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${APP_SCHEME}://reset-password`,
    });
    return { error };
  };

  // Called from ResetPasswordScreen after the user enters their new password.
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) {
        // Clear recovery mode — App.tsx re-renders and shows the main app.
        setIsPasswordRecovery(false);
      }
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  // ── Onboarding actions ────────────────────────────────────────────────────

  const completeOnboarding = async () => {
    if (!user) return;
    try {
      await supabase
        .from('profiles')
        .upsert({ id: user.id, onboarding_completed: true }, { onConflict: 'id' });
    } catch {
      if (__DEV__) console.warn('[Onboarding] Failed to persist completion to Supabase');
    }
    await writeOnboardingCache(user.id, true);
    setNeedsOnboarding(false);
  };

  const triggerOnboarding = async () => {
    if (!user) return;
    try {
      await supabase
        .from('profiles')
        .upsert({ id: user.id, onboarding_completed: false }, { onConflict: 'id' });
    } catch {
      if (__DEV__) console.warn('[Onboarding] Failed to reset onboarding in Supabase');
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

      const { error: rpcError } = await supabase.rpc('delete_user');

      if (rpcError) {
        if (__DEV__) console.error('[deleteAccount] RPC error:', rpcError.message);
        return { error: rpcError };
      }

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
    isPasswordRecovery,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    resetPassword,
    updatePassword,
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
