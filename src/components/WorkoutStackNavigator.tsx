import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StartWorkoutScreen } from './StartWorkoutScreen';
import { WorkoutTemplatesScreen } from './WorkoutTemplatesScreen';
import { BodyPartsScreen } from './BodyPartsScreen';
import { ExercisesScreen } from './ExercisesScreen';
import { WorkoutChecklistScreen } from './WorkoutChecklistScreen';
import { RestTimerScreen } from './RestTimerScreen';

const Stack = createNativeStackNavigator();

export function WorkoutStackNavigator() {
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
        name="StartWorkout"
        component={StartWorkoutScreen}
        options={{ title: 'Workout' }}
      />
      <Stack.Screen
        name="Templates"
        component={WorkoutTemplatesScreen}
        options={{ title: 'Workout Templates' }}
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
        name="RestTimer"
        component={RestTimerScreen}
        options={{ title: 'Rest Timer' }}
      />
    </Stack.Navigator>
  );
}
