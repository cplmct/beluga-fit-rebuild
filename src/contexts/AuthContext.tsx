import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

function onboardingKey(userId: string) {
  return `@beluga/onboarding_${userId}`;
}

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const done = await AsyncStorage.getItem(onboardingKey(session.user.id));
        setNeedsOnboarding(done === null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const done = await AsyncStorage.getItem(onboardingKey(session.user.id));
        if (event === 'SIGNED_IN' && done === null) {
          setNeedsOnboarding(true);
        } else if (done === null) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      } else {
        setNeedsOnboarding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const completeOnboarding = async () => {
    if (user) {
      await AsyncStorage.setItem(onboardingKey(user.id), 'done');
    }
    setNeedsOnboarding(false);
  };

  const triggerOnboarding = async () => {
    if (user) {
      await AsyncStorage.removeItem(onboardingKey(user.id));
    }
    setNeedsOnboarding(true);
  };

  const deleteAccount = async () => {
    try {
      if (!user) {
        return { error: { message: 'No user logged in' } };
      }

      const { error: dbError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (dbError) {
        return { error: dbError };
      }

      const { error: authError } = await supabase.rpc('delete_user');

      if (authError) {
        return { error: authError };
      }

      await signOut();
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const value = {
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
