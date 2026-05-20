import React, { useRef, useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { UnitsProvider } from './src/contexts/UnitsContext';
import { AuthStackNavigator } from './src/components/AuthStackNavigator';
import { BottomTabNavigator } from './src/components/BottomTabNavigator';
import { OnboardingScreen } from './src/components/OnboardingScreen';
import { ResetPasswordScreen } from './src/components/ResetPasswordScreen';
import { scheduleInactivityReminder, setupNotificationHandler } from './src/utils/notifications';

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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // ── Password recovery ─────────────────────────────────────────────────────
  // Shown when the user opens the app via the reset-password deep link.
  // Rendered outside NavigationContainer — no navigation needed for this screen.
  if (isPasswordRecovery) {
    return <ResetPasswordScreen />;
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
      <StatusBar style="auto" />
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
