import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { ExerciseSelection, Exercise, EXERCISES } from '../data/exercises';
import { SwapExerciseModal } from './SwapExerciseModal';
import { EditExerciseModal } from './EditExerciseModal';
import { ExerciseFormModal } from './ExerciseFormModal';
import { ExerciseCoachButton } from './ExerciseCoachButton';
import { ExerciseCoachingSheet } from './ExerciseCoachingSheet';
import { EXERCISE_GUIDANCE } from '../data/exerciseGuidance';
import { COACHING_NAME_TO_KEY } from '../data/exerciseCoaching';
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
  WorkoutSessionPayload,
  WorkoutSaveOutcome,
} from '../utils/workoutSession';
import { useSaveStatus } from '../hooks/useSaveStatus';
import { SaveStatusBadge } from './SaveStatusBadge';
import {
  WorkoutTarget,
  restoreWorkoutTarget,
  formatWorkoutTarget,
  formatWorkoutTargetLabel,
  canSaveWorkoutTargets,
  isMaxRepsPrCandidate,
  restoreSavedWorkoutTarget,
} from '../utils/workoutTarget';

interface LastTimeData {
  sets: number;
  reps: number | null;
  weight: number | null;
  target: WorkoutTarget | null;
}

const UNSUPPORTED_SAVE_MESSAGE =
  'Unsupported target formats cannot be saved. Use a positive whole-number target within the supported range (1–2,147,483,647) for reps, seconds, or steps.';

function getTarget(exercise: ExerciseSelection): WorkoutTarget {
  return restoreWorkoutTarget(exercise.target, exercise.reps);
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getCompletedSetNumbers(
  completedSets: WorkoutSessionPayload['completedSets'],
  exerciseIndex: number,
): number[] {
  return completedSets[String(exerciseIndex)] || [];
}

function countCompletedSetsForExercise(
  completedSets: WorkoutSessionPayload['completedSets'],
  exerciseIndex: number,
  plannedSets: number,
): number {
  return getCompletedSetNumbers(completedSets, exerciseIndex).filter(
    (setNumber) => setNumber >= 1 && setNumber <= plannedSets,
  ).length;
}

export function WorkoutChecklistScreen({ route, navigation }: any) {
  const { exercises: initialExercises, bodyParts } = route.params;
  const { user } = useAuth();
  const { weightUnit } = useUnits();

  const initialTargetedExercises = useRef<ExerciseSelection[]>(
    initialExercises.map((exercise: ExerciseSelection) => ({
      ...exercise,
      target: getTarget(exercise),
    }))
  ).current;
  const [exercises, setExercises] = useState<ExerciseSelection[]>(initialTargetedExercises);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formIndex, setFormIndex] = useState<number | null>(null);
  const [completedSets, setCompletedSets] = useState<WorkoutSessionPayload['completedSets']>({});
  const [isSaving, setIsSaving] = useState(false);
  const [unsupportedFinishVisible, setUnsupportedFinishVisible] = useState(false);
  const [resolutionFailure, setResolutionFailure] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [completedWorkout, setCompletedWorkout] = useState<WorkoutSaveOutcome | null>(null);
  const [resultStorageError, setResultStorageError] = useState('');
  const [resultWriteFailed, setResultWriteFailed] = useState(false);
  const [sessionStorageError, setSessionStorageError] = useState('');
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [lastTimeMap, setLastTimeMap] = useState<Record<string, LastTimeData>>({});
  const [lastTimeLoading, setLastTimeLoading] = useState(true);
  const [restDuration] = useState(90);
  const [coachingKey, setCoachingKey] = useState<string | null>(null);

  const startTimeRef = useRef(Date.now());
  const restTriggerRef = useRef(0);
  // Latched to true the moment a workout is successfully saved.
  // Prevents both save paths from re-writing AsyncStorage after the session
  // has been cleared, which would cause the Home resume banner to reappear
  // on the next app launch even though the workout finished correctly.
  const workoutFinishedRef = useRef(false);
  // State updates are not synchronous; this ref closes the double-tap window.
  const saveInProgressRef = useRef(false);
  const sessionRestoreBlockedRef = useRef(true);
  const initialRestoreRef = useRef(true);

  // Save-confidence indicator — tracks the state of the most recent write.
  const saveStatus = useSaveStatus();

  // ── On mount: fetch last-time data + check for a rescued session ────────────
  useEffect(() => {
    fetchLastTimeData();
  }, []);

  // ── On every focus: sync in-memory state with AsyncStorage ──────────────────
  // If the session was cleared externally (e.g. Home screen "Discard" button)
  // while this screen was still mounted in the Workout tab stack, reset the
  // local completedSets map so the user always sees a clean slate.
  // If a session still exists we leave the in-progress state untouched.
  useFocusEffect(
    useCallback(() => {
      void checkForSavedSession(initialRestoreRef.current);
      initialRestoreRef.current = false;
    }, [])
  );

  const checkForSavedSession = async (offerResume = true) => {
    sessionRestoreBlockedRef.current = true;
    setIsRestoringSession(true);
    setSessionStorageError('');
    try {
      const saved = await loadWorkoutSession();
      if (!saved) {
        if (!offerResume) {
          setCompletedSets({});
          startTimeRef.current = Date.now();
        }
        sessionRestoreBlockedRef.current = false;
        return;
      }

      // Restore pending outcomes before mismatch cleanup or resume prompts.
      if (saved.saveOutcome) {
        setExercises(saved.exercises);
        setCompletedSets(saved.completedSets);
        startTimeRef.current = saved.startTime;
        workoutFinishedRef.current = true;
        sessionRestoreBlockedRef.current = false;
        setResultWriteFailed(false);
        setResultStorageError('');
        setCompletedWorkout(saved.saveOutcome);
        return;
      }

      sessionRestoreBlockedRef.current = false;
      if (!offerResume) return;

      // Match body parts and count so mid-session swaps can still be restored.
      const savedKey =
        [...saved.bodyParts].sort().join(',') + ':' + saved.exercises.length;
      const currentKey =
        [...route.params.bodyParts].sort().join(',') + ':' + route.params.exercises.length;
      const sessionMatches = savedKey === currentKey;

      if (!sessionMatches) {
        await clearWorkoutSession();
        return;
      }

      // Home's Resume action has already confirmed the user's intent.
      if (route.params?.autoResume) {
        setExercises(saved.exercises);
        setCompletedSets(saved.completedSets);
        startTimeRef.current = saved.startTime;
        return;
      }

      const completed = saved.exercises.reduce(
        (sum, exercise, index) =>
          sum + countCompletedSetsForExercise(saved.completedSets, index, exercise.sets),
        0,
      );
      const total = saved.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
      Alert.alert(
        'Resume workout?',
        `You have an unfinished workout (${completed}/${total} sets checked off). Pick up where you left off?`,
        [
          {
            text: 'Start Fresh',
            style: 'destructive',
            onPress: () => {
              void clearWorkoutSession().catch(() => {
                sessionRestoreBlockedRef.current = true;
                setSessionStorageError('Couldn’t clear the retained workout. It has not been discarded. Retry checking storage before saving.');
              });
            },
          },
          {
            text: 'Resume',
            onPress: () => {
              setExercises(saved.exercises);
              setCompletedSets(saved.completedSets);
              startTimeRef.current = saved.startTime;
            },
          },
        ],
        { cancelable: false }
      );
    } catch {
      sessionRestoreBlockedRef.current = true;
      setSessionStorageError('Couldn’t check the retained workout on this device. Saving is blocked to avoid repeating a previous save. Retry checking storage.');
    } finally {
      setIsRestoringSession(false);
    }
  };

  // ── Save session whenever checked-off sets OR exercise list changes ─────────
  // exercises is included so a swap never leaves a stale closure overwriting
  // the just-saved updated list.
  useEffect(() => {
    // Skip if the workout has already been saved and the session cleared.
    if (workoutFinishedRef.current || sessionRestoreBlockedRef.current) return;
    // Skip the initial empty state — no point persisting a blank session.
    if (Object.keys(completedSets).length === 0 && exercises === initialTargetedExercises) return;
    saveWorkoutSession({
      exerciseNames: exercises.map((ex: ExerciseSelection) => ex.name),
      completedSets,
      startTime: startTimeRef.current,
      exercises,
      bodyParts,
    }).catch(error => saveStatus.setError(error));
  }, [completedSets, exercises, isRestoringSession]);

  // ── Save session when app moves to background (belt + suspenders) ───────────
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        // Do not re-save if the workout has already been finished and cleared.
        if (workoutFinishedRef.current || sessionRestoreBlockedRef.current) return;
        saveWorkoutSession({
          exerciseNames: exercises.map((ex: ExerciseSelection) => ex.name),
          completedSets,
          startTime: startTimeRef.current,
          exercises,
          bodyParts,
        }).catch(error => saveStatus.setError(error));
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [completedSets, exercises]);

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

      const chunkSize = 50;
      const allExerciseRows: { id: string; name: string }[] = [];
      for (let i = 0; i < exerciseNames.length; i += chunkSize) {
        const chunk = exerciseNames.slice(i, i + chunkSize);
        const { data: chunk_rows } = await supabase
          .from('exercises')
          .select('id, name')
          .in('name', chunk);
        if (chunk_rows) allExerciseRows.push(...chunk_rows);
      }

      const exIdToName: Record<string, string> = {};
      for (const row of allExerciseRows) {
        exIdToName[row.id] = row.name;
      }
      const exerciseIds = Object.keys(exIdToName);

      if (exerciseIds.length === 0) {
        setLastTimeLoading(false);
        return;
      }

      const { data: pastExercises } = await supabase
        .from('session_exercises')
        .select('session_id, exercise_id, session_sets(reps, weight_kg, set_number, target_kind, target_value, target_raw)')
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
        const firstSet = [...((ex.session_sets as any[]) || [])]
          .sort((a, b) => a.set_number - b.set_number)[0];
        map[exName] = {
          sets,
          reps: firstSet?.reps ?? null,
          weight: firstSet?.weight_kg ?? null,
          target: restoreSavedWorkoutTarget(firstSet || {}),
        };
      }
      setLastTimeMap(map);
    } catch (err) {
      if (__DEV__) console.warn('[fetchLastTimeData] failed:', err);
    } finally {
      setLastTimeLoading(false);
    }
  };

  const toggleSet = (exerciseIndex: number, setNumber: number) => {
    const exercise = exercises[exerciseIndex];
    if (!exercise) return;

    const exerciseKey = String(exerciseIndex);
    const currentSetNumbers = new Set(getCompletedSetNumbers(completedSets, exerciseIndex));

    if (currentSetNumbers.has(setNumber)) {
      currentSetNumbers.delete(setNumber);
      haptic.light();
      setCompletedSets((previous) => {
        const next = { ...previous };
        const nextSetNumbers = Array.from(currentSetNumbers).sort((a, b) => a - b);
        if (nextSetNumbers.length > 0) {
          next[exerciseKey] = nextSetNumbers;
        } else {
          delete next[exerciseKey];
        }
        return next;
      });
      return;
    }

    currentSetNumbers.add(setNumber);
    const nextCompletedSets = {
      ...completedSets,
      [exerciseKey]: Array.from(currentSetNumbers).sort((a, b) => a - b),
    };
    const exerciseCompleted = currentSetNumbers.size >= exercise.sets;
    const nextExercise = exercises.find((candidate, index) => {
      if (index === exerciseIndex) return false;
      return countCompletedSetsForExercise(
        nextCompletedSets,
        index,
        candidate.sets,
      ) < candidate.sets;
    });

    haptic.light();
    setCompletedSets(nextCompletedSets);

    restTriggerRef.current += 1;
    navigation.navigate('RestTimer', {
      initialSeconds: restDuration,
      triggerKey: `${exerciseIndex}-${setNumber}-${restTriggerRef.current}`,
      completedSetLabel: `${exercise.name} — Set ${setNumber}`,
      exerciseCompleted,
      nextExerciseName: nextExercise?.name,
    });
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
            // Body part and typed target preserved for explicit review in the card.
          }
    );
    setExercises(updated);
    // The swapped slot must not retain completion — it is a new exercise.
    setCompletedSets((previous) => {
      const next = { ...previous };
      delete next[String(swapIndex)];
      return next;
    });
    setSwapIndex(null);
    haptic.light();
  };

  const handleEditSave = (sets: number, target: WorkoutTarget, weight: string) => {
    if (editIndex === null) return;
    const updated = exercises.map((ex, i) =>
      i !== editIndex ? ex : { ...ex, sets, target, reps: target.kind === 'reps' ? target.value : undefined, weight }
    );
    setExercises(updated);
    setCompletedSets((previous) => {
      const exerciseKey = String(editIndex);
      const existingSetNumbers = getCompletedSetNumbers(previous, editIndex)
        .filter((setNumber) => setNumber <= sets)
        .sort((a, b) => a - b);
      const next = { ...previous };
      if (existingSetNumbers.length > 0) {
        next[exerciseKey] = existingSetNumbers;
      } else {
        delete next[exerciseKey];
      }
      return next;
    });
    setEditIndex(null);
  };

  const persistSavedWorkoutResult = async (outcome: WorkoutSaveOutcome) => {
    await saveWorkoutSession({
      exerciseNames: exercises.map((exercise: ExerciseSelection) => exercise.name),
      completedSets,
      startTime: startTimeRef.current,
      exercises,
      bodyParts,
      saveOutcome: outcome,
    });
  };

  // Core save logic — called after any confirmation guards pass.
  const doSaveWorkout = async () => {
    if (saveInProgressRef.current || workoutFinishedRef.current || sessionRestoreBlockedRef.current || !user) return;
    if (!canSaveWorkoutTargets(exercises.map(getTarget))) {
      haptic.error();
      setUnsupportedFinishVisible(true);
      return;
    }
    saveInProgressRef.current = true;
    setIsSaving(true);
    setResolutionFailure(null);
    saveStatus.setSaving();
    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    let unresolvedResult: { title: string; message: string } | null = null;

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
          // Single query against personal_records — canonical PR source,
          // avoids the session_id .in() URL-limit issue on large histories.
          const { data: existingWeightPRs } = await supabase
            .from('personal_records')
            .select('exercise_id, value')
            .eq('user_id', user.id)
            .eq('record_type', 'max_weight')
            .in('exercise_id', prExerciseIds);

          for (const pr of existingWeightPRs || []) {
            const exName = prExIdToName[pr.exercise_id];
            if (exName) {
              maxWeightMap[exName] = pr.value;
            }
          }
        }
      }

      // Look up exercise IDs for all exercises in this workout
      const allExerciseNames = exercises.map((ex: ExerciseSelection) => ex.name);
      const { data: allExerciseRows, error: resolutionError } = await supabase
        .from('exercises')
        .select('id, name')
        .in('name', allExerciseNames);

      if (resolutionError) {
        unresolvedResult = {
          title: 'Workout not saved',
          message: `Could not look up exercises:\n${allExerciseNames.map((name: string) => `• ${name}`).join('\n')}\n\nNo exercises were saved. Your active workout has been kept. Please try again.`,
        };
        throw new Error(unresolvedResult.message);
      }

      const nameToExId: Record<string, string> = {};
      for (const row of allExerciseRows || []) {
        if (row.id) nameToExId[row.name] = row.id;
      }

      // Resolve before creating a session so an entirely unresolved selection
      // cannot produce an empty completed workout.
      const validExercises: { exercise: ExerciseSelection; originalIndex: number }[] = [];
      exercises.forEach((exercise: ExerciseSelection, originalIndex: number) => {
        if (nameToExId[exercise.name]) validExercises.push({ exercise, originalIndex });
      });
      if (validExercises.length === 0) {
        unresolvedResult = {
          title: 'Workout not saved',
          message: `No exercises could be saved. Unresolved exercises:\n${allExerciseNames.map((name: string) => `• ${name}`).join('\n')}\n\nYour active workout has been kept. Please try again.`,
        };
        throw new Error(unresolvedResult.message);
      }
      const savedExerciseIndices = new Set<number>();

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

      // Convert each entered weight to the canonical storage unit (kg) once,
      // keyed by the exercise's original index so the set-insert, PR-upsert,
      // and PR-alert paths all compare/store the same value. personal_records
      // .value and session_sets.weight_kg both hold kilograms; the user's
      // display unit only affects data entry. Reusing one converted value
      // guarantees no branch mixes a raw lbs figure against stored kg baselines.
      //
      // NOTE: rows written before this conversion existed, by users whose
      // display unit was lbs, may hold lbs-shaped values in weight_kg /
      // personal_records.value with no entered_unit provenance captured. Those
      // rows require a separate data review — do NOT backfill blind
      // conversions here without a proven entered-unit column.
      const weightKgByIndex = new Map<number, number | null>();
      for (const { exercise, originalIndex } of validExercises) {
        const entered = exercise.weight;
        weightKgByIndex.set(
          originalIndex,
          entered !== null && entered !== ''
            ? Math.round(
                parseFloat(entered as string) *
                  (weightUnit === 'lbs' ? 0.453592 : 1) *
                  100
              ) / 100
            : null
        );
      }

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
        const firstCompletedSetNumberBySessionExerciseId: Record<string, number> = {};
        for (const insertedEx of insertedExercises || []) {
          const match = validExercises.find((ve) => ve.originalIndex === insertedEx.order_index);
          if (!match || !insertedEx.id) continue;
          const { exercise, originalIndex } = match;
          savedExerciseIndices.add(originalIndex);
          const completedSetNumbers = getCompletedSetNumbers(completedSets, originalIndex)
            .filter((setNumber) => setNumber >= 1 && setNumber <= exercise.sets)
            .sort((a, b) => a - b);
          const firstCompletedSetNumber = completedSetNumbers[0];
          if (firstCompletedSetNumber !== undefined) {
            firstCompletedSetNumberBySessionExerciseId[insertedEx.id] = firstCompletedSetNumber;
          }

          // weight_kg is always kilograms (see weightKgByIndex above).
          const weightKg = weightKgByIndex.get(originalIndex) ?? null;
          const prevMax = maxWeightMap[exercise.name] || 0;
          // prevMax comes from personal_records.value (kg), so compare kg-vs-kg.
          const isPr =
            firstCompletedSetNumber !== undefined &&
            weightKg !== null &&
            weightKg > 0 &&
            weightKg > prevMax;

          const target = getTarget(exercise);
          for (let setNum = 1; setNum <= exercise.sets; setNum++) {
            allSetRows.push({
              session_exercise_id: insertedEx.id,
              set_number: setNum,
              target_kind: target.kind,
              target_value: target.kind === 'unknown' ? null : target.value,
              target_raw: target.kind === 'unknown' ? target.raw : null,
              reps: target.kind === 'reps' ? target.value : null,
              // Only planned targets and completion are captured, not elapsed set time.
              duration_seconds: null,
              weight_kg: weightKg,
              is_completed: completedSetNumbers.includes(setNum),
              is_pr: setNum === firstCompletedSetNumber && isPr,
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
          // Build a lookup to the first completed set for each exercise. PRs
          // must never reference an unchecked set in a partially completed workout.
          const seIdToFirstCompletedSetId: Record<string, string> = {};
          for (const s of insertedSets || []) {
            if (
              s.set_number ===
              firstCompletedSetNumberBySessionExerciseId[s.session_exercise_id]
            ) {
              seIdToFirstCompletedSetId[s.session_exercise_id] = s.id;
            }
          }

          const prUpsertRows: object[] = [];
          for (const insertedEx of insertedExercises || []) {
            const match = validExercises.find((ve) => ve.originalIndex === insertedEx.order_index);
            if (!match) continue;
            const { exercise, originalIndex } = match;
            const exId = nameToExId[exercise.name];
            if (!exId) continue;

            // Reuse the canonical kg value from the precompute map so the PR
            // upsert is kg-consistent with session_sets.weight_kg above.
            // personal_records .value (max_weight) is stored in kilograms.
            const weightKg = weightKgByIndex.get(originalIndex) ?? null;
            const setId = seIdToFirstCompletedSetId[insertedEx.id];
            if (!setId) continue;

            // max_weight — only upsert if new kg weight exceeds current personal record
            if (weightKg !== null && weightKg > 0 && weightKg > (prWeightMap[exId] || 0)) {
              prUpsertRows.push({
                user_id: user.id,
                exercise_id: exId,
                record_type: 'max_weight',
                value: weightKg,
                session_set_id: setId,
                achieved_at: new Date().toISOString(),
              });
            }

            // max_reps — only upsert if new reps exceed current personal record
            const target = getTarget(exercise);
            if (target.kind === 'reps' && isMaxRepsPrCandidate(target, prRepsMap[exId] || 0)) {
              prUpsertRows.push({
                user_id: user.id,
                exercise_id: exId,
                record_type: 'max_reps',
                value: target.value,
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

      if (savedExerciseIndices.size === 0) {
        unresolvedResult = {
          title: 'Save incomplete',
          message: `No exercises could be confirmed saved:\n${allExerciseNames.map((name: string) => `• ${name}`).join('\n')}\n\nYour active workout has been kept. Some session data may have been written. Check History before retrying.`,
        };
        throw new Error(unresolvedResult.message);
      }

      // ── (D) Update challenge progress after workout save ─────────────────────
      try {
        // D1 — Mark expired active challenges as failed
        await supabase
          .from('user_challenges')
          .update({ status: 'failed' })
          .eq('user_id', user.id)
          .eq('status', 'active')
          .lt('ends_at', new Date().toISOString());

        // D2 — Fetch remaining active challenges with their config
        const { data: activeUCs } = await supabase
          .from('user_challenges')
          .select('id, started_at, ends_at, target_value, challenges(challenge_type, target_exercise_id)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('ends_at', new Date().toISOString());

        // D3 — Compute and write progress for each active challenge
        for (const uc of activeUCs || []) {
          const ch = (uc as any).challenges;
          if (!ch) continue;
          const type: string = ch.challenge_type;
          const targetExId: string | null = ch.target_exercise_id ?? null;
          let newProgress = 0;
          let shouldComplete = false;

          if (type === 'consistency' || type === 'streak') {
            // Count completed sessions within the challenge window
            const { count } = await supabase
              .from('workout_sessions')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('status', 'completed')
              .gte('started_at', uc.started_at)
              .lte('started_at', uc.ends_at);
            newProgress = count ?? 0;
            shouldComplete = newProgress >= uc.target_value;

          } else if (type === 'duration') {
            // Sum total workout minutes within the challenge window
            const { data: durationSessions } = await supabase
              .from('workout_sessions')
              .select('duration_seconds')
              .eq('user_id', user.id)
              .eq('status', 'completed')
              .gte('started_at', uc.started_at)
              .lte('started_at', uc.ends_at);
            const totalSeconds = (durationSessions || []).reduce(
              (sum: number, s: any) => sum + (s.duration_seconds ?? 0),
              0
            );
            newProgress = Math.floor(totalSeconds / 60);
            shouldComplete = newProgress >= uc.target_value;

          } else if (type === 'volume' && targetExId) {
            // 3-step: session IDs → session_exercise IDs → reps sum
            const { data: windowSessions } = await supabase
              .from('workout_sessions')
              .select('id')
              .eq('user_id', user.id)
              .eq('status', 'completed')
              .gte('started_at', uc.started_at)
              .lte('started_at', uc.ends_at);
            const windowIds = (windowSessions || []).map((s: any) => s.id);

            if (windowIds.length > 0) {
              const { data: seRows } = await supabase
                .from('session_exercises')
                .select('id')
                .in('session_id', windowIds)
                .eq('exercise_id', targetExId);
              const seIds = (seRows || []).map((r: any) => r.id);

              if (seIds.length > 0) {
                const { data: setRows } = await supabase
                  .from('session_sets')
                  .select('reps')
                  .in('session_exercise_id', seIds);
                 newProgress = (setRows || []).reduce(
                   (sum: number, r: { reps: number | null }) =>
                     typeof r.reps === 'number' ? sum + r.reps : sum,
                  0
                );
              }
            }
            shouldComplete = newProgress >= uc.target_value;

          } else if (type === 'pr' && targetExId) {
            // Check for a PR on the target exercise achieved within the challenge window
            const { data: prRows } = await supabase
              .from('personal_records')
              .select('id')
              .eq('user_id', user.id)
              .eq('exercise_id', targetExId)
              .gte('achieved_at', uc.started_at)
              .limit(1);
            if ((prRows || []).length > 0) {
              newProgress = 1;
              shouldComplete = true;
            }
          }

          // Write updated progress (and completion if threshold crossed)
          const updatePayload: Record<string, any> = { current_progress: newProgress };
          if (shouldComplete) {
            updatePayload.status = 'completed';
            updatePayload.completed_at = new Date().toISOString();
          }
          await supabase
            .from('user_challenges')
            .update(updatePayload)
            .eq('id', uc.id);
        }
      } catch (challengeErr) {
        // Best-effort: challenge update failure must not fail the workout save
        if (__DEV__) console.warn('[WorkoutChecklist] Challenge progress update failed:', challengeErr);
      }
      // ── END (D) ────────────────────────────────────────────────────────────────

      scheduleInactivityReminder(user.id);

      // Build PR names for alert — saved, completed exercises only, deduplicated.
      // Uses the canonical kg value (weightKgByIndex) vs the kg baseline from
      // personal_records (maxWeightMap), mirroring the session_sets/PR-upsert
      // comparisons above so a lbs-entered weight is never compared raw.
      const prNames: string[] = [
        ...new Set(
          validExercises
            .filter(({ exercise, originalIndex }) => {
              const weightKg = weightKgByIndex.get(originalIndex) ?? null;
              const prevMax = maxWeightMap[exercise.name] || 0;
              return (
                savedExerciseIndices.has(originalIndex) &&
                weightKg !== null &&
                weightKg > 0 &&
                weightKg > prevMax &&
                countCompletedSetsForExercise(
                  completedSets,
                  originalIndex,
                  exercise.sets,
                ) > 0
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

      const omittedNames = exercises
        .filter((_exercise: ExerciseSelection, index: number) => !savedExerciseIndices.has(index))
        .map((exercise: ExerciseSelection) => exercise.name);
      const partial = omittedNames.length > 0;
      const message = partial
        ? `The workout was partially saved.\n\nExercises not saved:\n${omittedNames.map((name: string) => `• ${name}`).join('\n')}\n\n${lines.join('\n')}\n\nYour active workout has been kept.`
        : `Great job!\n\n${lines.join('\n')}`;

      // Latch before showing the confirmation; no
      // second press may start another session after the first one is saved.
      // Keep the active workout until the user acknowledges the accurate result.
      workoutFinishedRef.current = true;
      const outcome = { id: session.id, message, partial };
      let resultPersisted = false;
      setResultStorageError('');
      setResultWriteFailed(false);
      try {
        await persistSavedWorkoutResult(outcome);
        resultPersisted = true;
      } catch {
        setResultWriteFailed(true);
        setResultStorageError('The workout was saved, but its pending result could not be stored on this device. Keep this screen open: reopening could allow a duplicate save. Retry storing the result.');
      }
      if (partial) {
        haptic.error();
        saveStatus.setError(new Error('Workout partially saved.'));
      } else if (resultPersisted) {
        haptic.success();
        saveStatus.setSuccess();
      } else {
        haptic.error();
        saveStatus.setError(new Error('The pending workout result could not be stored.'));
      }
      setCompletedWorkout(outcome);
    } catch (error: any) {
      haptic.error();
      saveStatus.setError(error);
      if (unresolvedResult) {
        setResolutionFailure(unresolvedResult);
      } else {
        Alert.alert('Error', error.message || 'Failed to save workout.');
      }
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  };

  const completedCount = exercises.reduce(
    (sum, exercise, index) =>
      sum + countCompletedSetsForExercise(completedSets, index, exercise.sets),
    0,
  );
  const totalCount = exercises.reduce(
    (sum, exercise) => sum + Math.max(0, exercise.sets),
    0,
  );

  // Guard wrapper — confirms before saving a partial workout.
  const handleFinishWorkout = () => {
    if (saveInProgressRef.current || workoutFinishedRef.current || sessionRestoreBlockedRef.current || isSaving || !user) return;

    if (exercises.length === 0) {
      haptic.error();
      Alert.alert('No exercises', 'Please select at least one exercise before finishing.');
      return;
    }

    if (!canSaveWorkoutTargets(exercises.map(getTarget))) {
      haptic.error();
      setUnsupportedFinishVisible(true);
      return;
    }

    if (completedCount < totalCount) {
      Alert.alert(
        'Finish early?',
        `You've completed ${completedCount} of ${totalCount} sets. Save this workout anyway?`,
        [
          { text: 'Keep going', style: 'cancel' },
          { text: 'Save anyway', style: 'default', onPress: () => { void doSaveWorkout(); } },
        ]
      );
      return;
    }

    void doSaveWorkout();
  };

  const handleRetrySavedResult = async () => {
    if (!completedWorkout || saveInProgressRef.current) return;
    saveInProgressRef.current = true;
    setIsSaving(true);
    try {
      await persistSavedWorkoutResult(completedWorkout);
      setResultStorageError('');
      setResultWriteFailed(false);
      if (completedWorkout.partial) {
        saveStatus.setError(new Error('Workout partially saved.'));
      } else {
        saveStatus.setSuccess();
      }
    } catch {
      setResultWriteFailed(true);
      setResultStorageError('The pending result still could not be stored. Keep this screen open: reopening could allow a duplicate save. Please retry.');
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  };

  const handleSavedWorkoutClose = async () => {
    if (!completedWorkout || saveInProgressRef.current) return;
    saveInProgressRef.current = true;
    const workoutId = completedWorkout.id;
    try {
      await clearWorkoutSession();
    } catch {
      setResultStorageError('Couldn’t clear the retained workout on this device. The result is still open and the draft has not been cleared. Try the acknowledgement again.' +
        (resultWriteFailed ? ' The pending result is also not stored; keep this screen open to avoid a duplicate save.' : ''));
      return;
    } finally {
      saveInProgressRef.current = false;
    }
    setCompletedWorkout(null);
    navigation.navigate('WorkoutDetails', { workoutId });
  };

  const formatWeightDisplay = (weight: string | number | null): string | null => {
    if (weight === null || weight === '') return null;
    const num = typeof weight === 'string' ? parseFloat(weight) : weight;
    if (isNaN(num)) return null;
    return `${num} ${weightUnit}`;
  };

  const formatLastTime = (data: LastTimeData): string => {
    // Weight excluded because unit provenance cannot be proven.
    if (data.target && data.target.kind !== 'reps') {
      return `${data.sets} sets · planned target: ${formatWorkoutTarget(data.target)}`;
    }
    return data.reps === null ? `${data.sets} sets · reps not recorded` : `${data.sets}×${data.reps}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Workout Checklist</Text>
        <Text style={styles.subtitle}>
          {completedCount} of {totalCount} sets completed
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
            const target = getTarget(exercise);
            const lastTime = lastTimeMap[exercise.name];
            const weightDisplay = formatWeightDisplay(exercise.weight);
            const exerciseCompletedSetCount = countCompletedSetsForExercise(
              completedSets,
              index,
              exercise.sets,
            );
            const exerciseCompleted =
              exercise.sets > 0 && exerciseCompletedSetCount === exercise.sets;

            return (
              <View
                key={index}
                style={[
                  styles.exerciseCard,
                  exerciseCompleted && styles.exerciseCardCompleted,
                ]}
              >
                {!lastTimeLoading && lastTime && (
                  <View style={styles.lastTimeBadge}>
                    <Text style={styles.lastTimeText}>
                      Last time: {formatLastTime(lastTime)}
                    </Text>
                  </View>
                )}

                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseInfo}>
                    <Text
                      style={[
                        styles.exerciseName,
                        exerciseCompleted && styles.exerciseNameCompleted,
                      ]}
                    >
                      {exercise.name}
                    </Text>
                    <Text style={styles.bodyPartLabel}>{exercise.bodyPart}</Text>
                  </View>
                  <View
                    style={[
                      styles.exerciseProgressBadge,
                      exerciseCompleted && styles.exerciseProgressBadgeCompleted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.exerciseProgressText,
                        exerciseCompleted && styles.exerciseProgressTextCompleted,
                      ]}
                    >
                      {exerciseCompletedSetCount}/{exercise.sets}
                    </Text>
                  </View>
                </View>

                <View style={styles.exerciseDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Sets</Text>
                    <Text style={styles.detailValue}>{exercise.sets}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Target</Text>
                    <Text style={styles.detailValue}>{formatWorkoutTarget(target)}</Text>
                  </View>
                  {weightDisplay && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Weight</Text>
                      <Text style={styles.detailValue}>{weightDisplay}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.setsList}>
                  {Array.from({ length: Math.max(0, exercise.sets) }, (_, setIndex) => {
                    const setNumber = setIndex + 1;
                    const setCompleted = getCompletedSetNumbers(
                      completedSets,
                      index,
                    ).includes(setNumber);

                    return (
                      <TouchableOpacity
                        key={setNumber}
                        style={[
                          styles.setRow,
                          setCompleted && styles.setRowCompleted,
                        ]}
                        onPress={() => toggleSet(index, setNumber)}
                        activeOpacity={0.75}
                      >
                        <View
                          style={[
                            styles.setCheckbox,
                            setCompleted && styles.setCheckboxCompleted,
                          ]}
                        >
                          {setCompleted && <Text style={styles.setCheckmark}>✓</Text>}
                        </View>
                        <Text
                          style={[
                            styles.setLabel,
                            setCompleted && styles.setLabelCompleted,
                          ]}
                        >
                          Set {setNumber}
                        </Text>
                        <Text style={styles.setTarget}>
                          {formatWorkoutTargetLabel(target)}
                          {weightDisplay ? ` · ${weightDisplay}` : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
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

                  {!!COACHING_NAME_TO_KEY[exercise.name] && (
                    <ExerciseCoachButton
                      exerciseName={exercise.name}
                      onPress={() => setCoachingKey(COACHING_NAME_TO_KEY[exercise.name])}
                    />
                  )}

                  {!exerciseCompleted && (
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
              </View>
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
        target={editIndex !== null ? getTarget(exercises[editIndex]) : { kind: 'reps', value: 10 }}
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

      <ExerciseCoachingSheet
        visible={coachingKey !== null}
        exerciseKey={coachingKey}
        onClose={() => setCoachingKey(null)}
      />

      {/* Save confidence indicator — visible only while saving or if an error occurred */}
      <SaveStatusBadge status={saveStatus.status} />

      {sessionStorageError !== '' && (
        <View style={styles.storageNotice} accessibilityRole="alert">
          <Text style={styles.unsupportedFinishMessage}>{sessionStorageError}</Text>
          <TouchableOpacity style={styles.unsupportedFinishButton} onPress={() => { void checkForSavedSession(); }} disabled={isRestoringSession}>
            <Text style={styles.unsupportedFinishButtonText}>Retry checking storage</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={unsupportedFinishVisible || resolutionFailure !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setUnsupportedFinishVisible(false);
          setResolutionFailure(null);
        }}
      >
        <View style={styles.unsupportedFinishOverlay}>
          <View style={[styles.unsupportedFinishDialog, { maxHeight: '85%' }]}>
            <Text style={styles.unsupportedFinishTitle}>
              {resolutionFailure?.title ?? 'Unable to finish workout'}
            </Text>
            <ScrollView style={{ flexShrink: 1 }}>
              <Text style={styles.unsupportedFinishMessage}>
                {resolutionFailure?.message ?? UNSUPPORTED_SAVE_MESSAGE}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.unsupportedFinishButton}
              onPress={() => {
                setUnsupportedFinishVisible(false);
                setResolutionFailure(null);
              }}
              accessibilityRole="button"
            >
              <Text style={styles.unsupportedFinishButtonText}>
                {resolutionFailure ? 'Keep workout' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={completedWorkout !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          // Partial results require explicit acknowledgement of draft clearing.
          if (!completedWorkout?.partial) void handleSavedWorkoutClose();
        }}
      >
        <View style={styles.unsupportedFinishOverlay}>
          <View style={[styles.unsupportedFinishDialog, { maxHeight: '85%' }]}>
            <Text style={styles.unsupportedFinishTitle}>
              {completedWorkout?.partial ? 'Workout partially saved' : 'Workout Saved!'}
            </Text>
            {resultStorageError !== '' && (
              <Text style={styles.storageErrorText} accessibilityRole="alert">{resultStorageError}</Text>
            )}
            <ScrollView style={{ flexShrink: 1 }}>
              <Text style={styles.unsupportedFinishMessage}>{completedWorkout?.message}</Text>
            </ScrollView>
            {resultWriteFailed && (
              <TouchableOpacity onPress={handleRetrySavedResult} disabled={isSaving}>
                <Text style={styles.storageActionText}>Retry storing result</Text>
              </TouchableOpacity>
            )}
            {completedWorkout?.partial && (
              <Text testID="partial-draft-clear-warning" style={styles.storageErrorText}>
                Viewing the saved workout will clear the retained draft, including the exercises not saved. Omitted work cannot be resumed afterward.
              </Text>
            )}
            <TouchableOpacity
              style={styles.unsupportedFinishButton}
              onPress={handleSavedWorkoutClose}
              disabled={isSaving}
              accessibilityRole="button"
            >
              <Text style={styles.unsupportedFinishButtonText}>
                {completedWorkout?.partial ? 'View saved workout' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => navigation.navigate('RestTimer')}
        >
          <Text style={styles.timerButtonText}>Rest Timer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.finishButton, (isSaving || workoutFinishedRef.current || isRestoringSession || sessionStorageError !== '') && styles.finishButtonDisabled]}
          onPress={handleFinishWorkout}
          disabled={isSaving || workoutFinishedRef.current || isRestoringSession || sessionStorageError !== ''}
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
  storageNotice: {
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#b91c1c',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  storageErrorText: {
    color: '#b91c1c',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
    flexShrink: 0,
  },
  storageActionText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 10,
  },
  unsupportedFinishOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  unsupportedFinishDialog: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  unsupportedFinishTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  unsupportedFinishMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
    marginBottom: 24,
  },
  unsupportedFinishButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  unsupportedFinishButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
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
  exerciseProgressBadge: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseProgressBadgeCompleted: {
    backgroundColor: '#10b981',
  },
  exerciseProgressText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseProgressTextCompleted: {
    color: '#fff',
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
  setsList: {
    gap: 8,
    marginTop: 12,
  },
  setRow: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  setRowCompleted: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  setCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  setCheckboxCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  setCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  setLabel: {
    minWidth: 52,
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  setLabelCompleted: {
    color: '#047857',
  },
  setTarget: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
    textAlign: 'right',
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
