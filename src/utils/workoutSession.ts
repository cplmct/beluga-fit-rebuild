import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseSelection } from '../data/exercises';

const KEY = '@beluga_active_workout_v1';

// Maximum age before a saved session is treated as stale and discarded.
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface WorkoutSessionPayload {
  /** Exercise names in order — used to match against route.params on restore. */
  exerciseNames: string[];
  /** Indices (into the exercises array) that the user has checked off. */
  completedExercises: number[];
  /** Original Date.now() when the workout started — preserves duration accuracy. */
  startTime: number;
  /** Date.now() at the time of last save — used for staleness detection. */
  savedAt: number;
  /** Full exercise objects — needed to navigate directly to WorkoutChecklistScreen. */
  exercises: ExerciseSelection[];
  /** Body parts for the workout — passed as route.params to WorkoutChecklistScreen. */
  bodyParts: string[];
}

/** Persist the current workout state. Silently swallows errors. */
export async function saveWorkoutSession(
  payload: Omit<WorkoutSessionPayload, 'savedAt'>
): Promise<void> {
  try {
    const data: WorkoutSessionPayload = { ...payload, savedAt: Date.now() };
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch (_) {}
}

/**
 * Load the saved session.
 * Returns null if nothing is saved, or if the session is older than MAX_AGE_MS.
 * Stale sessions are deleted automatically.
 */
export async function loadWorkoutSession(): Promise<WorkoutSessionPayload | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const data: WorkoutSessionPayload = JSON.parse(raw);
    if (Date.now() - data.savedAt > MAX_AGE_MS) {
      await AsyncStorage.removeItem(KEY);
      return null;
    }
    // Sessions saved by builds before the exercises field was added lack the
    // data needed to navigate from the Home banner. Discard them automatically
    // so they don't linger invisibly after an app upgrade.
    if (!data.exercises || data.exercises.length === 0) {
      await AsyncStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch (_) {
    return null;
  }
}

/** Delete the saved session — call on workout completion or discard. */
export async function clearWorkoutSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (_) {}
}
