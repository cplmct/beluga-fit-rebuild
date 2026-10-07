import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { UnitsProvider } from './src/contexts/UnitsContext';
import { AuthStackNavigator } from './src/components/AuthStackNavigator';
import { BottomTabNavigator } from './src/components/BottomTabNavigator';
import { OnboardingScreen } from './src/components/OnboardingScreen';
import { ChangePasswordScreen } from './src/components/ChangePasswordScreen';
import { RecoveryLinkScreen } from './src/components/RecoveryLinkScreen';
import { ForgotPasswordScreen } from './src/components/ForgotPasswordScreen';
import { LaunchScreen } from './src/components/LaunchScreen';
import { scheduleInactivityReminder, setupNotificationHandler } from './src/utils/notifications';

// Keep the native splash visible until auth state is resolved.
// This eliminates the ActivityIndicator flash on startup.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const { user, loading, needsOnboarding, completeOnboarding, isPasswordRecovery,
    startupError, retryStartup, onboardingBusy,
    accountCleanupError, accountCleanupBusy, retryAccountCleanup,
    recoveryLinkState, recoveryOwnerId, recoveryRequestMode, cancelRecovery } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const pendingTabRef = useRef<{ ownerUserId: string; tab: string } | null>(null);
  const currentOwnerRef = useRef(user?.id ?? null);
  currentOwnerRef.current = user?.id ?? null;
  const consumePendingTab = () => {
    const intent = pendingTabRef.current;
    pendingTabRef.current = null;
    if (intent && intent.ownerUserId === currentOwnerRef.current) {
      navigationRef.navigate(intent.tab as never);
    }
  };

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
    if (!loading || recoveryLinkState.status !== 'idle' || recoveryRequestMode) {
      const elapsed = Date.now() - launchStartRef.current;
      const remaining = Math.max(0, 7000 - elapsed);
      const timer = setTimeout(() => setLaunchShouldFade(true), remaining);
      return () => clearTimeout(timer);
    }
  }, [loading, recoveryLinkState.status, recoveryRequestMode]);

  // ── App content (preserves all existing routing logic) ────────────────────
  const renderContent = () => {
    if (recoveryRequestMode) return <ForgotPasswordScreen onBack={cancelRecovery} />;
    if (['processing', 'invalid', 'expired', 'failed'].includes(recoveryLinkState.status)) {
      return <RecoveryLinkScreen />;
    }
    if (isPasswordRecovery) return <ChangePasswordScreen key={recoveryOwnerId} />;
    if (loading || startupError) return (
      <View testID="startup-status" style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        {loading ? <><ActivityIndicator /><Text>Checking your session…</Text></> :
          <View accessibilityRole="alert"><Text>{startupError}</Text>
            <TouchableOpacity onPress={() => { void retryStartup(); }}><Text>Retry</Text></TouchableOpacity>
          </View>}
      </View>
    );

    // ── Onboarding ─────────────────────────────────────────────────────────
    if (user && needsOnboarding) {
      return (
        <OnboardingScreen
          key={user.id}
          busy={onboardingBusy}
          onComplete={async (goToPlans) => {
            const ownerUserId = user.id;
            const completed = await completeOnboarding();
            if (completed && goToPlans && currentOwnerRef.current === ownerUserId) {
              pendingTabRef.current = { ownerUserId, tab: 'Workout' };
              if (navigationRef.isReady()) consumePendingTab();
            }
          }}
        />
      );
    }

    // ── Main app ───────────────────────────────────────────────────────────
    return (
      <NavigationContainer
        ref={navigationRef}
        onReady={consumePendingTab}
      >
        {user ? <BottomTabNavigator key={user.id} /> : <AuthStackNavigator />}
      </NavigationContainer>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {accountCleanupError !== '' && (
        <View accessibilityRole="alert" style={{ padding: 16, paddingTop: 48, backgroundColor: '#fff4e5' }}>
          <Text>{accountCleanupError}</Text>
          <TouchableOpacity onPress={retryAccountCleanup} disabled={accountCleanupBusy}>
            <Text style={{ marginTop: 8, fontWeight: '600' }}>Retry local cleanup</Text>
          </TouchableOpacity>
        </View>
      )}
      <View
        style={{ flex: 1 }}
        pointerEvents={accountCleanupBusy ? 'none' : 'auto'}
        accessibilityElementsHidden={accountCleanupBusy}
        importantForAccessibility={accountCleanupBusy ? 'no-hide-descendants' : 'auto'}
      >
        {renderContent()}
      </View>
      {accountCleanupBusy && (
        <Modal transparent visible onRequestClose={() => {}}>
        <View
          testID="account-cleanup-overlay"
          accessibilityRole="progressbar"
          accessibilityLabel="Finishing local account cleanup"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
            zIndex: 100, backgroundColor: 'rgba(9, 23, 34, 0.55)',
            justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
        </Modal>
      )}
      {launchMounted && (
        <LaunchScreen
          shouldFade={launchShouldFade}
          onDismissed={() => setLaunchMounted(false)}
        />
      )}
    </View>
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

