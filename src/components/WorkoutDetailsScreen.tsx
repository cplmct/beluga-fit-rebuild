import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

interface WorkoutExercise {
  id: string;
  exercise_name: string;
  body_part: string;
  sets: number;
  reps: number;
  weight: number | null;
  completed: boolean;
}

interface Workout {
  id: string;
  date: string;
  body_parts: string[];
  exercises: WorkoutExercise[];
}

export function WorkoutDetailsScreen({ route }: any) {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutDetails();
  }, [workoutId]);

  const fetchWorkoutDetails = async () => {
    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .maybeSingle();

      if (workoutError || !workoutData) {
        throw new Error('Failed to fetch workout');
      }

      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_id', workoutId)
        .order('created_at', { ascending: true });

      if (exercisesError) {
        throw new Error('Failed to fetch exercises');
      }

      setWorkout({
        id: workoutData.id,
        date: workoutData.date,
        body_parts: workoutData.body_parts,
        exercises: exercisesData || [],
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error fetching workout details:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  const completedCount = workout.exercises.filter((ex) => ex.completed).length;
  const totalCount = workout.exercises.length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(workout.date)}</Text>
          <Text style={styles.time}>{formatTime(workout.date)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Body Parts</Text>
            <Text style={styles.summaryValue}>{workout.body_parts.join(', ')}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Exercises</Text>
            <Text style={styles.summaryValue}>{totalCount}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={styles.summaryValue}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Exercises</Text>

        {workout.exercises.map((exercise) => (
          <View
            key={exercise.id}
            style={[
              styles.exerciseCard,
              exercise.completed && styles.exerciseCardCompleted,
            ]}
          >
            <View style={styles.exerciseHeader}>
              <View style={[
                styles.statusDot,
                exercise.completed ? styles.statusDotCompleted : styles.statusDotIncomplete,
              ]} />
              <View style={styles.exerciseInfo}>
                <Text style={[
                  styles.exerciseName,
                  exercise.completed && styles.exerciseNameCompleted,
                ]}>
                  {exercise.exercise_name}
                </Text>
                <Text style={styles.bodyPartLabel}>{exercise.body_part}</Text>
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
              {exercise.weight && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Weight</Text>
                  <Text style={styles.detailValue}>{exercise.weight} lbs</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  date: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusDotCompleted: {
    backgroundColor: '#10b981',
  },
  statusDotIncomplete: {
    backgroundColor: '#d1d5db',
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
});
