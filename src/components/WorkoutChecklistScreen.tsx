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
      const { data: recentSessions } = await supabase
        .from('workout_sessions')
        .select('id, started_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(50);

      if (!recentSessions || recentSessions.length === 0) {
        setLastTimeLoading(false);
        return;
      }

      const sessionIds = recentSessions.map((s) => s.id);
      const exerciseNames = exercises.map((ex: ExerciseSelection) => ex.name);

      const { data: exerciseRows } = await supabase
        .from('exercises')
        .select('id, name')
        .in('name', exerciseNames);

      const exIdToName: Record<string, string> = {};
      for (const row of exerciseRows || []) {
        exIdToName[row.id] = row.name;
      }
      const exerciseIds = Object.keys(exIdToName);

      if (exerciseIds.length === 0) {
        setLastTimeLoading(false);
        return;
      }

      const { data: pastExercises } = await supabase
        .from('session_exercises')
        .select('session_id, exercise_id, session_sets(reps, weight_kg, set_number)')
        .in('session_id', sessionIds)
        .in('exercise_id', exerciseIds);

      const sessionDateMap: Record<string, string> = {};
      for (const s of recentSessions) {
        sessionDateMap[s.id] = s.started_at;
      }

      const sorted = (pastExercises || []).sort((a, b) => {
        const dateA = sessionDateMap[a.session_id] || '';
        const dateB = sessionDateMap[b.session_id] || '';
        return dateB.localeCompare(dateA);
      });

      const map: Record<string, LastTimeData> = {};
      for (const ex of sorted) {
        const exName = exIdToName[ex.exercise_id];
        if (!exName || map[exName]) continue;
        const sets = (ex.session_sets as any[])?.length || 0;
        const firstSet = (ex.session_sets as any[])?.[0];
        map[exName] = {
          sets,
          reps: firstSet?.reps || 0,
          weight: firstSet?.weight_kg ?? null,
        };
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
      const exerciseNamesForPr = [
        ...new Set(exercisesWithWeights.map((ex: ExerciseSelection) => ex.name)),
      ];

      let maxWeightMap: Record<string, number> = {};

      if (exerciseNamesForPr.length > 0) {
        const { data: prExerciseRows } = await supabase
          .from('exercises')
          .select('id, name')
          .in('name', exerciseNamesForPr);

        const prExIdToName: Record<string, string> = {};
        for (const row of prExerciseRows || []) {
          prExIdToName[row.id] = row.name;
        }
        const prExerciseIds = Object.keys(prExIdToName);

        if (prExerciseIds.length > 0) {
          const { data: userSessions } = await supabase
            .from('workout_sessions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed');

          const sessionIds = (userSessions || []).map((s) => s.id);

          if (sessionIds.length > 0) {
            const { data: historicalExercises } = await supabase
              .from('session_exercises')
              .select('exercise_id, session_sets(weight_kg)')
              .in('session_id', sessionIds)
              .in('exercise_id', prExerciseIds);

            for (const ex of historicalExercises || []) {
              const exName = prExIdToName[ex.exercise_id];
              if (!exName) continue;
              for (const s of (ex.session_sets as any[]) || []) {
                if (s.weight_kg !== null && s.weight_kg > (maxWeightMap[exName] || 0)) {
                  maxWeightMap[exName] = s.weight_kg;
                }
              }
            }
          }
        }
      }

      // Look up exercise IDs for all exercises in this workout
      const allExerciseNames = exercises.map((ex: ExerciseSelection) => ex.name);
      const { data: allExerciseRows } = await supabase
        .from('exercises')
        .select('id, name')
        .in('name', allExerciseNames);

      const nameToExId: Record<string, string> = {};
      for (const row of allExerciseRows || []) {
        nameToExId[row.name] = row.id;
      }

      // ── (A) Fetch current personal_records for all exercises in this workout ──
      // Used as the authoritative comparison guard for the upsert below.
      // prWeightMap / prRepsMap keyed by exercise_id (not name).
      let prWeightMap: Record<string, number> = {};
      let prRepsMap: Record<string, number> = {};

      const exerciseIds = Object.values(nameToExId);
      if (exerciseIds.length > 0) {
        const { data: existingPrs } = await supabase
          .from('personal_records')
          .select('exercise_id, record_type, value')
          .eq('user_id', user.id)
          .in('exercise_id', exerciseIds);

        for (const pr of existingPrs || []) {
          if (pr.record_type === 'max_weight') prWeightMap[pr.exercise_id] = pr.value;
          if (pr.record_type === 'max_reps')   prRepsMap[pr.exercise_id]   = pr.value;
        }
      }
      // ── END (A) ───────────────────────────────────────────────────────────────

      // INSERT workout_sessions row
      const session = await safeQuery<{ id: string }>(
        supabase
          .from('workout_sessions')
          .insert({
            user_id: user.id,
            name: bodyParts.join(', ') + ' Workout',
            status: 'completed',
            started_at: new Date(startTimeRef.current).toISOString(),
            completed_at: new Date().toISOString(),
            duration_seconds: durationSeconds,
          })
          .select()
          .maybeSingle()
      );

      if (!session || !session.id) throw new Error('Failed to create workout session');

      // Build session_exercises rows — skip exercises not in master table
      const validExercises: { exercise: ExerciseSelection; originalIndex: number }[] = [];
      exercises.forEach((exercise: ExerciseSelection, idx: number) => {
        if (nameToExId[exercise.name]) {
          validExercises.push({ exercise, originalIndex: idx });
        } else if (__DEV__) {
          console.warn(
            `[WorkoutChecklist] Exercise not in master table, skipped: ${exercise.name}`
          );
        }
      });

      if (validExercises.length > 0) {
        const sessionExerciseRows = validExercises.map(({ exercise, originalIndex }) => ({
          session_id: session.id,
          exercise_id: nameToExId[exercise.name],
          order_index: originalIndex,
        }));

        const insertedExercises = await safeQuery<{ id: string; order_index: number }[]>(
          supabase
            .from('session_exercises')
            .insert(sessionExerciseRows)
            .select('id, order_index')
        );

        // Batch-insert session_sets — one row per set per exercise
        const allSetRows: object[] = [];
        for (const insertedEx of insertedExercises || []) {
          const match = validExercises.find((ve) => ve.originalIndex === insertedEx.order_index);
          if (!match) continue;
          const { exercise, originalIndex } = match;

          const weight =
            exercise.weight !== null && exercise.weight !== ''
              ? parseFloat(exercise.weight as string)
              : null;
          const prevMax = maxWeightMap[exercise.name] || 0;
          const isPr = weight !== null && weight > 0 && weight > prevMax;

          for (let setNum = 1; setNum <= exercise.sets; setNum++) {
            allSetRows.push({
              session_exercise_id: insertedEx.id,
              set_number: setNum,
              reps: exercise.reps,
              weight_kg: weight,
              is_completed: completedExercises.has(originalIndex),
              is_pr: setNum === 1 && isPr,
            });
          }
        }

        if (allSetRows.length > 0) {
          // ── (B) Return inserted set IDs so we can reference them in personal_records ──
          const insertedSets = await safeQuery<
            { id: string; session_exercise_id: string; set_number: number }[]
          >(
            supabase
              .from('session_sets')
              .insert(allSetRows)
              .select('id, session_exercise_id, set_number')
          );
          // ── END (B) ────────────────────────────────────────────────────────────────

          // ── (C) Upsert personal_records for max_weight and max_reps PRs ──────────
          // Build a lookup: session_exercise_id → id of set_number=1
          const seIdToFirstSetId: Record<string, string> = {};
          for (const s of insertedSets || []) {
            if (s.set_number === 1) seIdToFirstSetId[s.session_exercise_id] = s.id;
          }

          const prUpsertRows: object[] = [];
          for (const insertedEx of insertedExercises || []) {
            const match = validExercises.find((ve) => ve.originalIndex === insertedEx.order_index);
            if (!match) continue;
            const { exercise } = match;
            const exId = nameToExId[exercise.name];
            if (!exId) continue;

            const weight =
              exercise.weight !== null && exercise.weight !== ''
                ? parseFloat(exercise.weight as string)
                : null;
            const setId = seIdToFirstSetId[insertedEx.id];
            if (!setId) continue;

            // max_weight — only upsert if new weight exceeds current personal record
            if (weight !== null && weight > 0 && weight > (prWeightMap[exId] || 0)) {
              prUpsertRows.push({
                user_id: user.id,
                exercise_id: exId,
                record_type: 'max_weight',
                value: weight,
                session_set_id: setId,
                achieved_at: new Date().toISOString(),
              });
            }

            // max_reps — only upsert if new reps exceed current personal record
            if (exercise.reps > (prRepsMap[exId] || 0)) {
              prUpsertRows.push({
                user_id: user.id,
                exercise_id: exId,
                record_type: 'max_reps',
                value: exercise.reps,
                session_set_id: setId,
                achieved_at: new Date().toISOString(),
              });
            }
          }

          if (prUpsertRows.length > 0) {
            await safeQuery(
              supabase
                .from('personal_records')
                .upsert(prUpsertRows, {
                  onConflict: 'user_id,exercise_id,record_type',
                  ignoreDuplicates: false,
                })
            );
          }
          // ── END (C) ────────────────────────────────────────────────────────────────
        }
      }

      scheduleInactivityReminder(user.id);

      // Build PR names for alert — completed exercises only, deduplicated
      const prNames: string[] = [
        ...new Set(
          validExercises
            .filter(({ exercise, originalIndex }) => {
              const weight =
                exercise.weight !== null && exercise.weight !== ''
                  ? parseFloat(exercise.weight as string)
                  : null;
              const prevMax = maxWeightMap[exercise.name] || 0;
              return (
                weight !== null &&
                weight > 0 &&
                weight > prevMax &&
                completedExercises.has(originalIndex)
              );
            })
            .map(({ exercise }) => exercise.name)
        ),
      ];

      const durationText = formatDuration(durationSeconds);
      const lines = [`Duration: ${durationText}`];
      if (prNames.length > 0) {
        lines.push(
          `${prNames.length} personal record${prNames.length > 1 ? 's' : ''}:\n` +
            prNames.map((n) => `• ${n}`).join('\n')
        );
      }

      haptic.success();
      saveStatus.setSuccess();
      workoutFinishedRef.current = true;
      await clearWorkoutSession();
      Alert.alert('Workout Saved!', `Great job!\n\n${lines.join('\n')}`, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('WorkoutDetails', { workoutId: session.id }),
        },
      ]);
    } catch (error: any) {
      haptic.error();
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
