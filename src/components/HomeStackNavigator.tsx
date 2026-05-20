import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { BodyTrackerScreen } from './BodyTrackerScreen';
import { StatsScreen } from './StatsScreen';

const Stack = createNativeStackNavigator();

const sharedHeaderOptions = {
  statusBarTranslucent: true,
  statusBarColor: '#cc0000' as const,
  statusBarStyle: 'light' as const,
  headerStyle: { backgroundColor: '#cc0000' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' as const },
};

const lightHeaderOptions = {
  statusBarStyle: 'dark' as const,
  headerStyle: { backgroundColor: '#ffffff' },
  headerTintColor: '#0f172a',
  headerTitleStyle: { fontWeight: '600' as const, color: '#0f172a' },
};

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={sharedHeaderOptions}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Beluga Fit' }}
      />
      <Stack.Screen
        name="BodyTracker"
        component={BodyTrackerScreen}
        options={{ title: 'Body Tracker', ...lightHeaderOptions }}
      />
      <Stack.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: 'Progress & Stats', ...lightHeaderOptions }}
      />
    </Stack.Navigator>
  );
}
