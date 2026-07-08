import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useUnits } from '../contexts/UnitsContext';

interface WorkoutExercise {
  id: string;
  exercise_name: string;
  body_part: string;
  sets: number;
  reps: number;
  weight: number | null;
  completed: boolean;
  is_pr: boolean;
}

interface Workout {
  id: string;
  started_at: string;
  body_parts: string[];
  duration_seconds: number | null;
  exercises: WorkoutExercise[];
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
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
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ alignItems: 'center', flex: 1, gap: 6 }}>
            <SkeletonBlock width={40} height={20} />
            <SkeletonBlock width={52} height={11} />
          </View>
        ))}
      </View>
      <View style={{ marginBottom: 16 }}>
        <SkeletonBlock width={120} height={18} />
      </View>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.exerciseCard, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <SkeletonBlock width={12} height={12} radius={6} />
            <View style={{ gap: 5 }}>
              <SkeletonBlock width={160} height={16} />
              <SkeletonBlock width={80} height={12} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SkeletonBlock width={60} height={40} radius={8} />
            <SkeletonBlock width={60} height={40} radius={8} />
            <SkeletonBlock width={80} height={40} radius={8} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export function WorkoutDetailsScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const { weightUnit } = useUnits();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchWorkoutDetails();
  }, [workoutId]);

  const fetchWorkoutDetails = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', workoutId)
        .maybeSingle();

      if (sessionError || !sessionData) {
        setNotFound(true);
        return;
      }

      const { data: sessionExercisesData, error: exercisesError } = await supabase
        .from('session_exercises')
        .select(
          'id, order_index, exercises(name, exercise_muscle_groups(muscle_groups(name))), session_sets(set_number, reps, weight_kg, is_completed, is_pr)'
        )
        .eq('session_id', workoutId)
        .order('order_index', { ascending: true });

      if (exercisesError) throw exercisesError;

      const { data: muscleGroupRows } = await supabase
        .from('session_muscle_groups')
        .select('muscle_groups(name)')
        .eq('session_id', workoutId);

      const bodyParts = (muscleGroupRows || [])
        .map((row: any) => row.muscle_groups?.name)
        .filter((name: string | undefined): name is string => !!name);

      const exercises: WorkoutExercise[] = (sessionExercisesData || []).map((se: any) => {
        const sets: any[] = se.session_sets || [];
        const sortedSets = [...sets].sort((a, b) => a.set_number - b.set_number);
        const firstSet = sortedSets[0];
        const bodyPart = se.exercises?.exercise_muscle_groups?.[0]?.muscle_groups?.name || '';

        return {
          id: se.id,
          exercise_name: se.exercises?.name || 'Unknown exercise',
          body_part: bodyPart,
          sets: sortedSets.length,
          reps: firstSet?.reps ?? 0,
          weight: firstSet?.weight_kg ?? null,
          completed: sortedSets.length > 0 && sortedSets.every((s) => s.is_completed === true),
          is_pr: sortedSets.some((s) => s.is_pr === true),
        };
      });

      setWorkout({
        id: sessionData.id,
        started_at: sessionData.started_at,
        body_parts: bodyParts,
        duration_seconds: sessionData.duration_seconds ?? null,
        exercises,
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
  const prCount = workout.exercises.filter((ex) => ex.is_pr).length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(workout.started_at)}</Text>
          <Text style={styles.time}>{formatTime(workout.started_at)}</Text>
        </View>

        {/* ── Summary ── */}
        <View style={styles.summaryCard}>
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
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{formatDuration(workout.duration_seconds)}</Text>
          </View>
          {prCount > 0 && (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>PRs</Text>
                <Text style={[styles.summaryValue, styles.prValue]}>{prCount}</Text>
              </View>
            </>
          )}
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
                    exercise.completed ? styles.statusDotCompleted : styles.statusDotIncomplete,
                  ]}
                />
                <View style={styles.exerciseInfo}>
                  <View style={styles.exerciseTitleRow}>
                    <Text
                      style={[
                        styles.exerciseName,
                        exercise.completed && styles.exerciseNameCompleted,
                      ]}
                    >
                      {exercise.exercise_name}
                    </Text>
                    {exercise.is_pr && (
                      <View style={styles.prBadge}>
                        <Text style={styles.prBadgeText}>PR</Text>
                      </View>
                    )}
                  </View>
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
                    <Text style={styles.detailValue}>
                      {exercise.weight} {weightUnit}
                    </Text>
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
    fontSize: 10,
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
  prValue: {
    color: '#f59e0b',
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
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  exerciseNameCompleted: {
    color: '#10b981',
  },
  prBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  prBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d97706',
    letterSpacing: 0.5,
  },
  bodyPartLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 10,
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
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
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
