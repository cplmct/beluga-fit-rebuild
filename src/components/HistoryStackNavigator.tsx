import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HistoryScreen } from './HistoryScreen';
import { WorkoutDetailsScreen } from './WorkoutDetailsScreen';

const Stack = createNativeStackNavigator();

export function HistoryStackNavigator() {
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
        name="HistoryList"
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Stack.Screen
        name="WorkoutDetails"
        component={WorkoutDetailsScreen}
        options={{ title: 'Workout Details' }}
      />
    </Stack.Navigator>
  );
}
