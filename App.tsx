import React, { useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { UnitsProvider } from './src/contexts/UnitsContext';
import { AuthStackNavigator } from './src/components/AuthStackNavigator';
import { BottomTabNavigator } from './src/components/BottomTabNavigator';
import { OnboardingScreen } from './src/components/OnboardingScreen';

function AppContent() {
  const { user, loading, needsOnboarding, completeOnboarding } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const pendingTabRef = useRef<string | null>(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

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
    <AuthProvider>
      <UnitsProvider>
        <AppContent />
      </UnitsProvider>
    </AuthProvider>
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
