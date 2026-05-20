import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalendarScreen } from './CalendarScreen';
import { WorkoutDetailsScreen } from './WorkoutDetailsScreen';

const Stack = createNativeStackNavigator();

export function CalendarStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        statusBarTranslucent: true,
        statusBarColor: 'transparent',
        statusBarStyle: 'light',
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
        name="CalendarView"
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Stack.Screen
        name="WorkoutDetails"
        component={WorkoutDetailsScreen}
        options={{ title: 'Workout Details' }}
      />
    </Stack.Navigator>
  );
}
