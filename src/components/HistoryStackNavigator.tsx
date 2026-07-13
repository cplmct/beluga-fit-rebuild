import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HistoryScreen } from './HistoryScreen';
import { WorkoutDetailsScreen } from './WorkoutDetailsScreen';
import { PRHistoryScreen } from './PRHistoryScreen';
import { ExerciseDetailScreen } from './ExerciseDetailScreen';

const Stack = createNativeStackNavigator();

export function HistoryStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        statusBarTranslucent: true,
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
        name="HistoryList"
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Stack.Screen
        name="WorkoutDetails"
        component={WorkoutDetailsScreen}
        options={{ title: 'Workout Details' }}
      />
      <Stack.Screen
        name="PRHistory"
        component={PRHistoryScreen}
        options={{ title: 'Personal Records' }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={({ route }: any) => ({ title: (route.params as any)?.exerciseName ?? 'Exercise' })}
      />
    </Stack.Navigator>
  );
}
