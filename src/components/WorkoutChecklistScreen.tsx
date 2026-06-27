import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { ExerciseSelection, Exercise, EXERCISES } from '../data/exercises';
import { SwapExerciseModal } from './SwapExerciseModal';
import { EditExerciseModal } from './EditExerciseModal';
import { ExerciseFormModal } from './ExerciseFormModal';
import { EXERCISE_GUIDANCE } from '../data/exerciseGuidance';
import { supabase } from '../lib/supabase';
import { safeQuery } from '../lib/safeSupabase';
import { useAuth } from '../contexts/AuthContext';
import { useUnits } from '../contexts/UnitsContext';
import { scheduleInactivityReminder } from '../utils/notifications';
import { haptic } from '../utils/haptics';
import {
  saveWorkoutSession,
  loadWorkoutSession,
  clearWorkoutSession,
} from '../utils/workoutSession';
import { useSaveStatus } from '../hooks/useSaveStatus';
import { SaveStatusBadge } from './SaveStatusBadge';

interface LastTimeData {
  sets: number;
  reps: number;
  weight: number | null;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function WorkoutChecklistScreen({ route, navigation }: any) {
  const { exercises: initialExercises, bodyParts } = route.params;
  const { user } = useAuth();
  const { weightUnit } = useUnits();

  const [exercises, setExercises] = useState<ExerciseSelection[]>(initialExercises);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formIndex, setFormIndex] = useState<number | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [lastTimeMap, setLastTimeMap] = useState<Record<string, LastTimeData>>({});
  const [lastTimeLoading, setLastTimeLoading] = useState(true);

  const startTimeRef = useRef(Date.now());
  // Latched to true the moment a workout is successfully saved.
  // Prevents both save paths from re-writing AsyncStorage after the session
  // has been cleared, which would cause the Home resume banner to reappear
  // on the next app launch even though the workout finished correctly.
  const workoutFinishedRef = useRef(false);

  // Save-confidence indicator — tracks the state of the most recent write.
  const saveStatus = useSaveStatus();

  // ── On mount: fetch last-time data + check for a rescued session ────────────
  useEffect(() => {
    fetchLastTimeData();
    checkForSavedSession();
  }, []);

  // ── On every focus: sync in-memory state with AsyncStorage ──────────────────
  // If the session was cleared externally (e.g. Home screen "Discard" button)
  // while this screen was still mounted in the Workout tab stack, reset the
  // local completedExercises Set so the user always sees a clean slate.
  // If a session still exists we leave the in-progress state untouched.
  useFocusEffect(
    useCallback(() => {
      loadWorkoutSession().then(saved => {
        if (!saved) {
          setCompletedExercises(new Set());
          startTimeRef.current = Date.now();
        }
      });
    }, [])
  );

  const checkForSavedSession = async () => {
    const saved = await loadWorkoutSession();
    if (!saved) return;

    // Match the saved session by body-part set + exercise count rather than
    // exact exercise names. This allows a mid-session swap to survive a
    // force-quit/relaunch cycle — the guard still rejects sessions from a
    // genuinely different workout (different body parts or different count).
    const savedKey =
      [...saved.bodyParts].sort().join(',') + ':' + saved.exercises.length;
    const currentKey =
      [...route.params.bodyParts].sort().join(',') + ':' + route.params.exercises.length;
    const sessionMatches = savedKey === currentKey;

    if (!sessionMatches) {
      await clearWorkoutSession();
      return;
    }

    // If the user arrived here via the Home resume banner, restore silently —
    // they already confirmed intent by tapping Resume there.
    if (route.params?.autoResume) {
      setExercises(saved.exercises);
      setCompletedExercises(new Set(saved.completedExercises));
      startTimeRef.current = saved.startTime;
      return;
    }

    // Session is valid and matches — offer to resume.
    const completed = saved.completedExercises.length;
    const total = saved.exerciseNames.length;
    Alert.alert(
      'Resume workout?',
      `You have an unfinished workout (${completed}/${total} sets checked off). Pick up where you left off?`,
      [
        {
          text: 'Start Fresh',
          style: 'destructive',
          onPress: () => clearWorkoutSession(),
        },
        {
          text: 'Resume',
          onPress: () => {
            // Restore exercise list (captures any mid-session swaps),
            // checked-off sets, and original start time.
            setExercises(saved.exercises);
            setCompletedExercises(new Set(saved.completedExercises));
            startTimeRef.current = saved.startTime;
          },
        },
      ],
      { cancelable: false }
    );
  };

  // ── Save session whenever checked-off sets OR exercise list changes ─────────
  // exercises is included so a swap never leaves a stale closure overwriting
  // the just-saved updated list.
  useEffect(() => {
    // Skip if the workout has already been saved and the session cleared.
    if (workoutFinishedRef.current) return;
    // Skip the initial empty state — no point persisting a blank session.
    if (completedExercises.size === 0 && exercises === initialExercises) return;
    saveWorkoutSession({
      exerciseNames: exercises.map((ex: ExerciseSelection) => ex.name),
      completedExercises: Array.from(completedExercises),
      startTime: startTimeRef.current,
      exercises,
      bodyParts,
    });
  }, [completedExercises, exercises]);

  // ── Save session when app moves to background (belt + suspenders) ───────────
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        // Do not re-save if the workout has already been finished and cleared.
        if (workoutFinishedRef.current) return;
        saveWorkoutSession({
          exerciseNames: exercises.map((ex: ExerciseSelection) => ex.name),
          completedExercises: Array.from(completedExercises),
          startTime: startTimeRef.current,
          exercises,
          bodyParts,
        });
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [completedExercises, exercises]);

  const fetchLastTimeData = async () => {
    if (!user) {
      setLastTimeLoading(false);
      return;
    }
    try {
      const { data: recentWorkouts } = await supabase
        .from('workouts')
        .select('id, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(50);

      if (!recentWorkouts || recentWorkouts.length === 0) {
        setLastTimeLoading(false);
        return;
      }

      const workoutIds = recentWorkouts.map((w) => w.id);
      const exerciseNames = exercises.map((ex: ExerciseSelection) => ex.name);

      const { data: pastExercises } = await supabase
        .from('workout_exercises')
        .select('exercise_name, sets, reps, weight, workout_id')
        .in('workout_id', workoutIds)
        .in('exercise_name', exerciseNames);

      const workoutDateMap: Record<string, string> = {};
      for (const w of recentWorkouts) {
        workoutDateMap[w.id] = w.date;
      }

      const sorted = (pastExercises || []).sort((a, b) => {
        const dateA = workoutDateMap[a.workout_id] || '';
        const dateB = workoutDateMap[b.workout_id] || '';
        return dateB.localeCompare(dateA);
      });

      const map: Record<string, LastTimeData> = {};
      for (const ex of sorted) {
        if (!map[ex.exercise_name]) {
          map[ex.exercise_name] = { sets: ex.sets, reps: ex.reps, weight: ex.weight };
        }
      }
      setLastTimeMap(map);
    } catch {
    } finally {
      setLastTimeLoading(false);
    }
  };

  const toggleComplete = (index: number) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
      haptic.light(); // subtle confirmation when a set is checked off
    }
    setCompletedExercises(newCompleted);
  };

  const handleSwapSelect = (replacement: Exercise) => {
    if (swapIndex === null) return;
    const updated = exercises.map((ex, i) =>
      i !== swapIndex
        ? ex
        : {
            ...ex,
            name: replacement.name,
            category: replacement.category,
            equipment: replacement.equipment,
            // bodyPart preserved (same group), sets/reps/weight preserved
          }
    );
    setExercises(updated);
    // The swapped slot must not be checked — it's a new exercise.
    // (Swap button is only shown for uncompleted slots, but guard anyway.)
    if (completedExercises.has(swapIndex)) {
      const newCompleted = new Set(completedExercises);
      newCompleted.delete(swapIndex);
      setCompletedExercises(newCompleted);
    }
    setSwapIndex(null);
    haptic.light();
  };

  const handleEditSave = (sets: number, reps: number, weight: string) => {
    if (editIndex === null) return;
    const updated = exercises.map((ex, i) =>
      i !== editIndex ? ex : { ...ex, sets, reps, weight }
    );
    setExercises(updated);
    setEditIndex(null);
  };

  // Core save logic — called after any confirmation guards pass.
  const doSaveWorkout = async () => {
    if (!user) return;
    setIsSaving(true);
    saveStatus.setSaving();
    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const exercisesWithWeights = exercises.filter(
        (ex: ExerciseSelection) => ex.weight !== null && ex.weight !== ''
      );
      const exerciseNames = [...new Set(exercisesWithWeights.map((ex: ExerciseSelection) => ex.name))];

      let maxWeightMap: Record<string, number> = {};

      if (exerciseNames.length > 0) {
        const { data: userWorkoutIds } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', user.id);

        const workoutIds = (userWorkoutIds || []).map((w) => w.id);

        if (workoutIds.length > 0) {
          const { data: historicalWeights } = await supabase
            .from('workout_exercises')
            .select('exercise_name, weight')
            .in('workout_id', workoutIds)
            .in('exercise_name', exerciseNames as string[])
            .not('weight', 'is', null);

          for (const ex of historicalWeights || []) {
            if (ex.weight > (maxWeightMap[ex.exercise_name] || 0)) {
              maxWeightMap[ex.exercise_name] = ex.weight;
            }
          }
        }
      }

      const workout = await safeQuery<{ id: string }>(
        supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            body_parts: bodyParts,
            date: new Date().toISOString(),
            duration_seconds: durationSeconds,
          })
          .select()
          .maybeSingle()
      );

      if (!workout || !workout.id) throw new Error('Failed to create workout');

      const workoutExercises = exercises.map((exercise: ExerciseSelection, index: number) => {
        const weight =
          exercise.weight !== null && exercise.weight !== ''
            ? parseFloat(exercise.weight as string)
            : null;
        const prevMax = maxWeightMap[exercise.name] || 0;
        const isPr = weight !== null && weight > 0 && weight > prevMax;
        return {
          workout_id: workout.id,
          exercise_name: exercise.name,
          body_part: exercise.bodyPart,
          sets: exercise.sets,
          reps: exercise.reps,
          weight,
          completed: completedExercises.has(index),
          is_pr: isPr,
        };
      });

      await safeQuery(supabase.from('workout_exercises').insert(workoutExercises));

      scheduleInactivityReminder(user.id);

      // Only count PRs for exercises the user actually checked off.
      // Deduplicate names in case the same exercise appears more than once.
      const prExercises = workoutExercises.filter((ex) => ex.is_pr && ex.completed);
      const prNames = [...new Set(prExercises.map((ex) => ex.exercise_name))];
      const durationText = formatDuration(durationSeconds);
      const lines = [`Duration: ${durationText}`];
      if (prNames.length > 0) {
        lines.push(
          `${prNames.length} personal record${prNames.length > 1 ? 's' : ''}:\n` +
          prNames.map((n) => `• ${n}`).join('\n')
        );
      }

      haptic.success(); // reward the user for completing a workout
      saveStatus.setSuccess();
      workoutFinishedRef.current = true; // latch before clearing — stops both save paths from re-writing AsyncStorage
      await clearWorkoutSession(); // workout is done — remove the rescue checkpoint
      Alert.alert('Workout Saved!', `Great job!\n\n${lines.join('\n')}`, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('WorkoutDetails', { workoutId: workout.id }),
        },
      ]);
    } catch (error: any) {
      haptic.error(); // signal that the save failed
      saveStatus.setError(error);
      Alert.alert('Error', error.message || 'Failed to save workout.');
    } finally {
      setIsSaving(false);
    }
  };

  const completedCount = completedExercises.size;
  const totalCount = exercises.length;

  // Guard wrapper — confirms before saving a partial workout.
  const handleFinishWorkout = () => {
    if (isSaving || !user) return;

    if (exercises.length === 0) {
      haptic.error();
      Alert.alert('No exercises', 'Please select at least one exercise before finishing.');
      return;
    }

    if (completedCount < totalCount) {
      Alert.alert(
        'Finish early?',
        `You've checked off ${completedCount} of ${totalCount} exercises. Save this workout anyway?`,
        [
          { text: 'Keep going', style: 'cancel' },
          { text: 'Save anyway', style: 'default', onPress: () => { void doSaveWorkout(); } },
        ]
      );
      return;
    }

    void doSaveWorkout();
  };

  const formatWeightDisplay = (weight: string | number | null): string | null => {
    if (weight === null || weight === '') return null;
    const num = typeof weight === 'string' ? parseFloat(weight) : weight;
    if (isNaN(num)) return null;
    return `${num} ${weightUnit}`;
  };

  const formatLastTime = (data: LastTimeData): string => {
    // Only show sets×reps — weight excluded because unit provenance cannot be proven
    return `${data.sets}×${data.reps}`;
  };

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
              {
                width:
                  totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%',
              },
            ]}
          />
        </View>

        <View style={styles.exercisesList}>
          {exercises.map((exercise: ExerciseSelection, index: number) => {
            const lastTime = lastTimeMap[exercise.name];
            const weightDisplay = formatWeightDisplay(exercise.weight);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.exerciseCard,
                  completedExercises.has(index) && styles.exerciseCardCompleted,
                ]}
                onPress={() => toggleComplete(index)}
                activeOpacity={0.82}
              >
                {!lastTimeLoading && lastTime && (
                  <View style={styles.lastTimeBadge}>
                    <Text style={styles.lastTimeText}>
                      Last time: {formatLastTime(lastTime)}
                    </Text>
                  </View>
                )}

                <View style={styles.exerciseHeader}>
                  <View
                    style={[
                      styles.checkbox,
                      completedExercises.has(index) && styles.checkboxCompleted,
                    ]}
                  >
                    {completedExercises.has(index) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text
                      style={[
                        styles.exerciseName,
                        completedExercises.has(index) && styles.exerciseNameCompleted,
                      ]}
                    >
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
                  {weightDisplay && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Weight</Text>
                      <Text style={styles.detailValue}>{weightDisplay}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={(e) => { e.stopPropagation(); setEditIndex(index); }}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.editButtonText}>✎ Edit</Text>
                  </TouchableOpacity>

                  {!!EXERCISE_GUIDANCE[exercise.name] && (
                    <TouchableOpacity
                      style={styles.formButton}
                      onPress={(e) => { e.stopPropagation(); setFormIndex(index); }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.formButtonText}>Form</Text>
                    </TouchableOpacity>
                  )}

                  {!completedExercises.has(index) && (
                    <TouchableOpacity
                      style={styles.swapButton}
                      onPress={(e) => { e.stopPropagation(); setSwapIndex(index); }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.swapButtonText}>⇄ Swap</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <SwapExerciseModal
        visible={swapIndex !== null}
        bodyPart={
          swapIndex !== null ? exercises[swapIndex].bodyPart : 'Chest'
        }
        excludeNames={exercises.map((ex) => ex.name)}
        onSelect={handleSwapSelect}
        onCancel={() => setSwapIndex(null)}
      />

      <EditExerciseModal
        visible={editIndex !== null}
        sets={editIndex !== null ? exercises[editIndex].sets : 3}
        reps={editIndex !== null ? exercises[editIndex].reps : 10}
        weight={editIndex !== null ? (exercises[editIndex].weight ?? '') : ''}
        weightUnit={weightUnit}
        onSave={handleEditSave}
        onCancel={() => setEditIndex(null)}
      />

      <ExerciseFormModal
        visible={formIndex !== null}
        exerciseName={formIndex !== null ? exercises[formIndex].name : ''}
        bodyPart={formIndex !== null ? exercises[formIndex].bodyPart : ''}
        onClose={() => setFormIndex(null)}
      />

      {/* Save confidence indicator — visible only while saving or if an error occurred */}
      <SaveStatusBadge status={saveStatus.status} />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => navigation.navigate('RestTimer')}
        >
          <Text style={styles.timerButtonText}>Rest Timer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.finishButton, isSaving && styles.finishButtonDisabled]}
          onPress={handleFinishWorkout}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.finishButtonText}>Finish Workout</Text>
          )}
        </TouchableOpacity>
      </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  swapButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  swapButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  formButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  formButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  exerciseCardCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  lastTimeBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  lastTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563eb',
    letterSpacing: 0.1,
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
    fontSize: 16,
    fontWeight: '700',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  exerciseNameCompleted: {
    color: '#10b981',
  },
  bodyPartLabel: {
    fontSize: 13,
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
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 10,
  },
  timerButton: {
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timerButtonText: {
    color: '#0f172a',
    fontSize: 15,
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
    fontSize: 17,
    fontWeight: '700',
  },
});
