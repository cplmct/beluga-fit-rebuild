import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { BodyTrackerScreen } from './BodyTrackerScreen';

const Stack = createNativeStackNavigator();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Beluga Fit' }}
      />
      <Stack.Screen
        name="BodyTracker"
        component={BodyTrackerScreen}
        options={{ title: 'Body Tracker' }}
      />
    </Stack.Navigator>
  );
}
