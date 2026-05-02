import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ExerciseSelection } from '../data/exercises';
import { supabase } from '../lib/supabase';
import { safeQuery } from '../lib/safeSupabase';
import { useAuth } from '../contexts/AuthContext';
import { VoiceButton } from './VoiceButton';
import { VoiceCommand } from '../utils/voiceCommandParser';

export function WorkoutChecklistScreen({ route, navigation }: any) {
  const { exercises, bodyParts } = route.params;
  const { user } = useAuth();
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const toggleComplete = (index: number) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedExercises(newCompleted);
  };

 const handleFinishWorkout = async () => {
  if (isSaving || !user) return;

  if (exercises.length === 0) {
    Alert.alert(
      'No exercises',
      'Please select at least one exercise before finishing.'
    );
    return;
  }

  setIsSaving(true);

  try {
    const workout = await safeQuery<{ id: string }>(
      supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          body_parts: bodyParts,
          date: new Date().toISOString(),
        })
        .select()
        .maybeSingle()
    );

    if (!workout || !workout.id) {
      throw new Error('Failed to create workout');
    }

    const workoutExercises = exercises.map((exercise: ExerciseSelection, index: number) => ({
      workout_id: workout.id,
      exercise_name: exercise.name,
      body_part: exercise.bodyPart,
      sets: exercise.sets,
      reps: exercise.reps,
      weight:
        exercise.weight !== null && exercise.weight !== ''
          ? parseFloat(exercise.weight)
          : null,
      completed: completedExercises.has(index),
    }));

    await safeQuery(
      supabase
        .from('workout_exercises')
        .insert(workoutExercises)
    );

    Alert.alert(
      'Workout Saved!',
      'Great job! Your workout has been saved successfully.',
      [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('WorkoutDetails', { workoutId: workout.id }),
        },
      ]
    );
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to save workout.');
  } finally {
    setIsSaving(false);
  }
};

  const completedCount = completedExercises.size;
  const totalCount = exercises.length;

  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    switch (command.type) {
      case 'ADD_SET':
        const nextIncompleteIndex = exercises.findIndex((_: any, idx: number) => !completedExercises.has(idx));
        if (nextIncompleteIndex !== -1) {
          toggleComplete(nextIncompleteIndex);
          Alert.alert('Voice Command', `Marked "${exercises[nextIncompleteIndex].name}" as complete`);
        } else {
          Alert.alert('Voice Command', 'All exercises completed!');
        }
        break;
      case 'FINISH_WORKOUT':
        handleFinishWorkout();
        break;
      case 'START_REST_TIMER':
        navigation.navigate('RestTimer');
        Alert.alert('Voice Command', 'Starting rest timer');
        break;
      default:
        break;
    }
  }, [exercises, completedExercises, navigation]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Workout Checklist</Text>
        <Text style={styles.subtitle}>
          Mark exercises as you complete them ({completedCount}/{totalCount})
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completedCount / totalCount) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.exercisesList}>
          {exercises.map((exercise: ExerciseSelection, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.exerciseCard,
                completedExercises.has(index) && styles.exerciseCardCompleted,
              ]}
              onPress={() => toggleComplete(index)}
            >
              <View style={styles.exerciseHeader}>
                <View style={[
                  styles.checkbox,
                  completedExercises.has(index) && styles.checkboxCompleted,
                ]}>
                  {completedExercises.has(index) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={[
                    styles.exerciseName,
                    completedExercises.has(index) && styles.exerciseNameCompleted,
                  ]}>
                    {exercise.name}
                  </Text>
                  <Text style={styles.bodyPartLabel}>{exercise.bodyPart}</Text>
                </View>
              </View>

              <View style={styles.exerciseDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Sets</Text>
                  <Text style={styles.detailValue}>{exercise.sets}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Reps</Text>
                  <Text style={styles.detailValue}>{exercise.reps}</Text>
                </View>
                {exercise.weight != null && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Weight</Text>
                    <Text style={styles.detailValue}>{exercise.weight} lbs</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.timerButton}
            onPress={() => navigation.navigate('RestTimer')}
          >
            <Text style={styles.timerButtonText}>⏱️ Rest Timer</Text>
          </TouchableOpacity>
          <VoiceButton
            onCommand={handleVoiceCommand}
            size="medium"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.finishButton,
            isSaving && styles.finishButtonDisabled,
          ]}
          onPress={handleFinishWorkout}
          disabled={isSaving}
        >
          <Text style={styles.finishButtonText}>
            {isSaving ? 'Saving...' : 'Finish Workout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  exerciseCardCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  exerciseNameCompleted: {
    color: '#10b981',
  },
  bodyPartLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  timerButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
