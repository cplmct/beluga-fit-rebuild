import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
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

function SkeletonBlock({
  width,
  height = 14,
  radius = 6,
}: {
  width: number | string;
  height?: number;
  radius?: number;
}) {
  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius: radius,
        backgroundColor: '#f1f5f9',
      }}
    />
  );
}

function WorkoutDetailsSkeleton() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={{ gap: 6, marginBottom: 28 }}>
        <SkeletonBlock width={220} height={22} />
        <SkeletonBlock width={100} height={14} />
      </View>
      <View style={styles.summaryCard}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ alignItems: 'center', flex: 1, gap: 6 }}>
            <SkeletonBlock width={40} height={20} />
            <SkeletonBlock width={64} height={12} />
          </View>
        ))}
      </View>
      <SkeletonBlock width={120} height={18} style={{ marginBottom: 16 }} />
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.exerciseCard, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <SkeletonBlock width={12} height={12} radius={6} />
            <View style={{ gap: 5 }}>
              <SkeletonBlock width={160} height={16} />
              <SkeletonBlock width={80} height={12} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <SkeletonBlock width={60} height={36} radius={8} />
            <SkeletonBlock width={60} height={36} radius={8} />
            <SkeletonBlock width={80} height={36} radius={8} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export function WorkoutDetailsScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
        setNotFound(true);
        return;
      }

      const { data: exercisesData } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_id', workoutId)
        .order('created_at', { ascending: true });

      setWorkout({
        id: workoutData.id,
        date: workoutData.date,
        body_parts: workoutData.body_parts || [],
        exercises: exercisesData || [],
      });
    } catch (err) {
      if (__DEV__) console.error('WorkoutDetailsScreen:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <View style={styles.container}>
        <WorkoutDetailsSkeleton />
      </View>
    );
  }

  if (notFound || !workout) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <View style={styles.emptyIconRing}>
            <View style={styles.emptyIconDot} />
          </View>
          <Text style={styles.emptyTitle}>Workout not found</Text>
          <Text style={styles.emptySub}>
            This workout may have been deleted or there was a problem loading it.
          </Text>
          {navigation.canGoBack() && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const completedCount = workout.exercises.filter((ex) => ex.completed).length;
  const totalCount = workout.exercises.length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(workout.date)}</Text>
          <Text style={styles.time}>{formatTime(workout.date)}</Text>
        </View>

        {/* ── Summary ── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Body Parts</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {workout.body_parts.join(', ') || '—'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Exercises</Text>
            <Text style={styles.summaryValue}>{totalCount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={styles.summaryValue}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        </View>

        {/* ── Exercises ── */}
        <Text style={styles.sectionTitle}>Exercises</Text>

        {totalCount === 0 ? (
          <View style={styles.noExercisesCard}>
            <Text style={styles.noExercisesTitle}>No exercises recorded</Text>
            <Text style={styles.noExercisesSub}>
              This workout was saved without any exercises logged.
            </Text>
          </View>
        ) : (
          workout.exercises.map((exercise) => (
            <View
              key={exercise.id}
              style={[
                styles.exerciseCard,
                exercise.completed && styles.exerciseCardCompleted,
              ]}
            >
              <View style={styles.exerciseHeader}>
                <View
                  style={[
                    styles.statusDot,
                    exercise.completed
                      ? styles.statusDotCompleted
                      : styles.statusDotIncomplete,
                  ]}
                />
                <View style={styles.exerciseInfo}>
                  <Text
                    style={[
                      styles.exerciseName,
                      exercise.completed && styles.exerciseNameCompleted,
                    ]}
                  >
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
                {exercise.weight != null && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Weight</Text>
                    <Text style={styles.detailValue}>{exercise.weight} lbs</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // ── Header ──
  header: {
    marginBottom: 20,
  },
  date: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // ── Summary ──
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },

  // ── Section ──
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // ── No exercises ──
  noExercisesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    alignItems: 'center',
  },
  noExercisesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  noExercisesSub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 19,
  },

  // ── Exercise cards ──
  exerciseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    flexShrink: 0,
  },
  statusDotCompleted: {
    backgroundColor: '#10b981',
  },
  statusDotIncomplete: {
    backgroundColor: '#e2e8f0',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  exerciseNameCompleted: {
    color: '#10b981',
  },
  bodyPartLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },

  // ── Empty / Error ──
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#cbd5e1',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
});
