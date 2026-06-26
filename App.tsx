import React, { useRef, useEffect, useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { UnitsProvider } from './src/contexts/UnitsContext';
import { AuthStackNavigator } from './src/components/AuthStackNavigator';
import { BottomTabNavigator } from './src/components/BottomTabNavigator';
import { OnboardingScreen } from './src/components/OnboardingScreen';
import { ChangePasswordScreen } from './src/components/ChangePasswordScreen';
import { LaunchScreen } from './src/components/LaunchScreen';
import { scheduleInactivityReminder, setupNotificationHandler } from './src/utils/notifications';

// Keep the native splash visible until auth state is resolved.
// This eliminates the ActivityIndicator flash on startup.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const { user, loading, needsOnboarding, completeOnboarding, isPasswordRecovery } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const pendingTabRef = useRef<string | null>(null);

  // ── Launch screen state ───────────────────────────────────────────────────
  const launchStartRef = useRef(Date.now());
  const [launchMounted, setLaunchMounted] = useState(true);
  const [launchShouldFade, setLaunchShouldFade] = useState(false);

  useEffect(() => {
    setupNotificationHandler();
  }, []);

  useEffect(() => {
    if (user?.id) {
      scheduleInactivityReminder(user.id);
    }
  }, [user?.id]);

  // ── Dismiss launch screen once auth resolves + 1500ms have elapsed ────────
  useEffect(() => {
    if (!loading) {
      const elapsed = Date.now() - launchStartRef.current;
      const remaining = Math.max(0, 1500 - elapsed);
      const timer = setTimeout(() => setLaunchShouldFade(true), remaining);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // ── App content (preserves all existing routing logic) ────────────────────
  const renderContent = () => {
    if (loading) return null;

    // ── Password recovery ──────────────────────────────────────────────────
    if (isPasswordRecovery) {
      return <ChangePasswordScreen />;
    }

    // ── Onboarding ─────────────────────────────────────────────────────────
    if (user && needsOnboarding) {
      return (
        <OnboardingScreen
          onComplete={async (goToPlans) => {
            if (goToPlans) {
              pendingTabRef.current = 'Workout';
            }
            await completeOnboarding();
          }}
        />
      );
    }

    // ── Main app ───────────────────────────────────────────────────────────
    return (
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          if (pendingTabRef.current) {
            navigationRef.navigate(pendingTabRef.current as never);
            pendingTabRef.current = null;
          }
        }}
      >
        {user ? <BottomTabNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
    );
  };

  return (
    <>
      {renderContent()}
      {launchMounted && (
        <LaunchScreen
          shouldFade={launchShouldFade}
          onDismissed={() => setLaunchMounted(false)}
        />
      )}
    </>
  );
}

export default function App() {
  // Hide the native splash immediately when JS loads — the in-app LaunchScreen
  // takes over from this point. Both share #091722 so the cut is invisible.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UnitsProvider>
          <AppContent />
        </UnitsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

