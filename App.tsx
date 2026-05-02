import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AuthStackNavigator } from './src/components/AuthStackNavigator';
import { BottomTabNavigator } from './src/components/BottomTabNavigator';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY
)

function AppContent() {
  const { user, loading } = useAuth();

  // 🔥 Supabase test runs once on startup
  useEffect(() => {
	console.log("ENV CHECK:", EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
    async function testSupabase() {
      console.log("Testing Supabase connection...");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      console.log("SUPABASE TEST RESULT:", { data, error });
    }

    testSupabase();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user ? <BottomTabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
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
