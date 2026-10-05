import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseSelection } from '../data/exercises';
import { restoreWorkoutTarget } from './workoutTarget';
import { readPendingAccountCleanup } from './accountCleanup';

const KEY = '@beluga_active_workout_v1';

// Ordinary unfinished drafts expire; pending results do not.
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
let activeOwnerUserId: string | null = null;
let accountVersion = 0;

export function setWorkoutSessionOwner(ownerUserId: string | null): void {
  if (activeOwnerUserId !== ownerUserId) accountVersion++;
  activeOwnerUserId = ownerUserId;
}

function assertOwner(ownerUserId: string, version: number): void {
  if (!ownerUserId || ownerUserId !== activeOwnerUserId || version !== accountVersion) {
    throw new Error('The active workout account changed. Retry checking storage.');
  }
}

async function assertStorageOwner(ownerUserId: string, version: number): Promise<void> {
  assertOwner(ownerUserId, version);
  const cleanup = await readPendingAccountCleanup();
  assertOwner(ownerUserId, version);
  if (cleanup?.ownerUserId === ownerUserId) {
    throw new Error('Local account cleanup must finish before restoring or saving this workout.');
  }
}

// Keep cleanup and writes to this single key ordered, including failed calls.
let storageOperations: Promise<unknown> = Promise.resolve();
function withWorkoutStorage<T>(operation: () => Promise<T>): Promise<T> {
  const result = storageOperations.then(operation);
  storageOperations = result.catch(() => undefined);
  return result;
}

export interface WorkoutSaveOutcome {
  id: string;
  message: string;
  partial: boolean;
}

export interface WorkoutSessionPayload {
  /** Authenticated account that owns this local draft/result. */
  ownerUserId: string;
  /** Exercise names in order — used to match against route.params on restore. */
  exerciseNames: string[];
  /** Set numbers completed for each exercise index. */
  completedSets: Record<string, number[]>;
  /** Original Date.now() when the workout started — preserves duration accuracy. */
  startTime: number;
  /** Date.now() at the time of last save — used for staleness detection. */
  savedAt: number;
  /** Full exercise objects — needed to navigate directly to WorkoutChecklistScreen. */
  exercises: ExerciseSelection[];
  /** Body parts for the workout — passed as route.params to WorkoutChecklistScreen. */
  bodyParts: string[];
  /** Acknowledgement pending; do not save this workout again on resume. */
  saveOutcome?: WorkoutSaveOutcome;
}

type StoredWorkoutSession = Omit<WorkoutSessionPayload, 'completedSets' | 'ownerUserId'> & {
  /** Ownerless drafts from older builds are never assigned to a new account. */
  ownerUserId?: string;
  completedSets?: unknown;
  /** Legacy payload field saved before completion became set-level. */
  completedExercises?: unknown;
};

function normalizeCompletedSets(
  completedSets: unknown,
  completedExercises: unknown,
  exercises: ExerciseSelection[],
): Record<string, number[]> {
  const normalized: Record<string, number[]> = {};

  if (completedSets && typeof completedSets === 'object' && !Array.isArray(completedSets)) {
    for (const [exerciseIndex, rawSetNumbers] of Object.entries(completedSets)) {
      const index = Number(exerciseIndex);
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= exercises.length ||
        !Array.isArray(rawSetNumbers)
      ) {
        continue;
      }

      const setNumbers = rawSetNumbers
        .filter((setNumber): setNumber is number =>
          typeof setNumber === 'number' &&
          Number.isInteger(setNumber) &&
          setNumber >= 1 &&
          setNumber <= exercises[index].sets
        )
        .sort((a, b) => a - b);

      if (setNumbers.length > 0) {
        normalized[String(index)] = [...new Set(setNumbers)];
      }
    }
    return normalized;
  }

  // Older sessions stored exercise indices. Treat each legacy completed
  // exercise as having all of its planned sets completed.
  if (Array.isArray(completedExercises)) {
    for (const rawIndex of completedExercises) {
      if (
        typeof rawIndex !== 'number' ||
        !Number.isInteger(rawIndex) ||
        rawIndex < 0 ||
        rawIndex >= exercises.length
      ) {
        continue;
      }

      const setCount = Math.max(0, exercises[rawIndex].sets);
      if (setCount > 0) {
        normalized[String(rawIndex)] = Array.from(
          { length: setCount },
          (_, setIndex) => setIndex + 1,
        );
      }
    }
  }

  return normalized;
}

/** Persist the current workout state. Storage failures reject to the caller. */
export async function saveWorkoutSession(
  payload: Omit<WorkoutSessionPayload, 'savedAt'>
): Promise<void> {
  const version = accountVersion;
  return withWorkoutStorage(async () => {
    await assertStorageOwner(payload.ownerUserId, version);
    const raw = await AsyncStorage.getItem(KEY);
    const previous: StoredWorkoutSession | null = raw ? JSON.parse(raw) : null;
    assertOwner(payload.ownerUserId, version);
    if (previous && previous.ownerUserId !== payload.ownerUserId) {
      await AsyncStorage.removeItem(KEY);
      assertOwner(payload.ownerUserId, version);
    } else if (previous?.saveOutcome && (!payload.saveOutcome || previous.saveOutcome.id !== payload.saveOutcome.id)) {
      throw new Error('A pending workout result must be acknowledged or discarded before replacing its draft.');
    }
    const data: WorkoutSessionPayload = { ...payload, savedAt: Date.now() };
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
    assertOwner(payload.ownerUserId, version);
  });
}

/**
 * Load the saved session.
 * Returns null if nothing is saved, or an ordinary draft has expired.
 * Pending results never expire. Read/parse/cleanup failures reject.
 */
export async function loadWorkoutSession(ownerUserId: string | null): Promise<WorkoutSessionPayload | null> {
  if (!ownerUserId) return null;
  const version = accountVersion;
  return withWorkoutStorage(async () => {
    await assertStorageOwner(ownerUserId, version);
    const raw = await AsyncStorage.getItem(KEY);
    assertOwner(ownerUserId, version);
    if (!raw) return null;
    const data: StoredWorkoutSession = JSON.parse(raw);
    // Check ownership before examining or returning any exercise/result data.
    // Failed removal rejects; callers keep the foreign/legacy draft hidden.
    if (!data || data.ownerUserId !== ownerUserId) {
      await AsyncStorage.removeItem(KEY);
      assertOwner(ownerUserId, version);
      return null;
    }
    if (data.saveOutcome && (
      typeof data.saveOutcome.id !== 'string' || !data.saveOutcome.id ||
      typeof data.saveOutcome.message !== 'string' ||
      typeof data.saveOutcome.partial !== 'boolean'
    )) {
      throw new Error('The pending workout result could not be read.');
    }
    if (!data.saveOutcome && Date.now() - data.savedAt > MAX_AGE_MS) {
      await AsyncStorage.removeItem(KEY);
      return null;
    }
    // Sessions saved by builds before the exercises field was added lack the
    // data needed to navigate from the Home banner. Discard them automatically
    // so they don't linger invisibly after an app upgrade.
    if (!data.exercises || data.exercises.length === 0) {
      if (data.saveOutcome) {
        throw new Error('The pending workout result could not be restored.');
      }
      await AsyncStorage.removeItem(KEY);
      return null;
    }

    return {
      ...data,
      ownerUserId,
      exercises: data.exercises.map((exercise) => ({
        ...exercise,
        target: restoreWorkoutTarget(exercise.target, exercise.reps),
      })),
      completedSets: normalizeCompletedSets(
        data.completedSets,
        data.completedExercises,
        data.exercises,
      ),
    };
  });
}

/** Delete the saved session on acknowledgement/discard. Failures reject. */
export async function clearWorkoutSession(ownerUserId: string): Promise<void> {
  const version = accountVersion;
  return withWorkoutStorage(async () => {
    await assertStorageOwner(ownerUserId, version);
    await AsyncStorage.removeItem(KEY);
    assertOwner(ownerUserId, version);
  });
}

/** Boundary cleanup may run after sign-out, but must not remove a new owner's draft. */
export async function clearWorkoutSessionForAccount(ownerUserId: string): Promise<void> {
  return withWorkoutStorage(async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return;
    let storedOwner: unknown;
    try { storedOwner = JSON.parse(raw)?.ownerUserId; } catch { /* Invalid legacy draft: remove, never restore. */ }
    if (storedOwner && storedOwner !== ownerUserId) return;
    await AsyncStorage.removeItem(KEY);
  });
}
