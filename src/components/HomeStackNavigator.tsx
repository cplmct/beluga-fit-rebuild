import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { BodyTrackerScreen } from './BodyTrackerScreen';
import { AICoachScreen } from './AICoachScreen';
import { VoicePreviewScreen } from './VoicePreviewScreen';

const Stack = createNativeStackNavigator();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b82f6',
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
        options={{ title: 'Home' }}
      />
      <Stack.Screen
        name="BodyTracker"
        component={BodyTrackerScreen}
        options={{ title: 'Body Tracker' }}
      />
      <Stack.Screen
        name="AICoach"
        component={AICoachScreen}
        options={{ title: 'AI Workout Coach' }}
      />
      <Stack.Screen
        name="VoicePreview"
        component={VoicePreviewScreen}
        options={{ title: 'Voice Input Preview' }}
      />
    </Stack.Navigator>
  );
}
