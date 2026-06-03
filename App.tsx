import React, { useRef, useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { UnitsProvider } from './src/contexts/UnitsContext';
import { AuthStackNavigator } from './src/components/AuthStackNavigator';
import { BottomTabNavigator } from './src/components/BottomTabNavigator';
import { OnboardingScreen } from './src/components/OnboardingScreen';
import { ChangePasswordScreen } from './src/components/ChangePasswordScreen';
import { scheduleInactivityReminder, setupNotificationHandler } from './src/utils/notifications';

// Keep the native splash visible until auth state is resolved.
// This eliminates the ActivityIndicator flash on startup.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const { user, loading, needsOnboarding, completeOnboarding, isPasswordRecovery } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const pendingTabRef = useRef<string | null>(null);

  useEffect(() => {
    setupNotificationHandler();
  }, []);

  useEffect(() => {
    if (user?.id) {
      scheduleInactivityReminder(user.id);
    }
  }, [user?.id]);

  // ── Hide native splash once auth resolves ────────────────────────────────
  // While loading is true the native splash is still covering the screen,
  // so returning null here produces no visible flash.
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  if (loading) {
    return null;
  }

  // ── Password recovery ─────────────────────────────────────────────────────
  // Shown when the user opens the app via the reset-password deep link.
  // Rendered outside NavigationContainer — no navigation needed for this screen.
  if (isPasswordRecovery) {
    return <ChangePasswordScreen />;
  }

  // ── Onboarding ────────────────────────────────────────────────────────────
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

  // ── Main app ──────────────────────────────────────────────────────────────
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
}

export default function App() {
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

