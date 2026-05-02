import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalendarScreen } from './CalendarScreen';
import { WorkoutDetailsScreen } from './WorkoutDetailsScreen';

const Stack = createNativeStackNavigator();

export function CalendarStackNavigator() {
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
