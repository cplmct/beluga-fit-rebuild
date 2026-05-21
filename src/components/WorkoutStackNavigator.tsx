import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StartWorkoutScreen } from './StartWorkoutScreen';
import { WorkoutTemplatesScreen } from './WorkoutTemplatesScreen';
import { PlanLibraryScreen } from './PlanLibraryScreen';
import { PlanDetailScreen } from './PlanDetailScreen';
import { BodyPartsScreen } from './BodyPartsScreen';
import { ExercisesScreen } from './ExercisesScreen';
import { WorkoutChecklistScreen } from './WorkoutChecklistScreen';
import { WorkoutDetailsScreen } from './WorkoutDetailsScreen';
import { RestTimerScreen } from './RestTimerScreen';

const Stack = createNativeStackNavigator();

export function WorkoutStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        statusBarTranslucent: true,
        statusBarStyle: 'light',
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="StartWorkout"
        component={StartWorkoutScreen}
        options={{ title: 'Workout' }}
      />
      <Stack.Screen
        name="PlanLibrary"
        component={PlanLibraryScreen}
        options={{ title: 'Workout Plans' }}
      />
      <Stack.Screen
        name="PlanDetail"
        component={PlanDetailScreen}
        options={{ title: 'Plan Details' }}
      />
      <Stack.Screen
        name="Templates"
        component={WorkoutTemplatesScreen}
        options={{ title: 'Quick Start Templates' }}
      />
      <Stack.Screen
        name="BodyParts"
        component={BodyPartsScreen}
        options={{ title: 'Select Body Parts' }}
      />
      <Stack.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{ title: 'Select Exercises' }}
      />
      <Stack.Screen
        name="WorkoutChecklist"
        component={WorkoutChecklistScreen}
        options={{ title: 'Workout Checklist' }}
      />
      <Stack.Screen
        name="WorkoutDetails"
        component={WorkoutDetailsScreen}
        options={{ title: 'Workout Details' }}
      />
      <Stack.Screen
        name="RestTimer"
        component={RestTimerScreen}
        options={{ title: 'Rest Timer' }}
      />
    </Stack.Navigator>
  );
}
