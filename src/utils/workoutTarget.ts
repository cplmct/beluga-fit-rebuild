export type WorkoutTarget =
  | { kind: 'reps'; value: number }
  | { kind: 'seconds'; value: number }
  | { kind: 'steps'; value: number }
  | { kind: 'unknown'; raw: string; origin: string };

export function parseWorkoutTarget(raw: string, origin: string): WorkoutTarget {
  const trimmed = raw.trim();
  const match = /^([0-9]+)(?:\s+(reps?|secs?|seconds?|steps?))?$/i.exec(trimmed);
  if (!match) return { kind: 'unknown', raw, origin };
  const value = Number(match[1]);
  if (!Number.isSafeInteger(value) || value <= 0) {
    return { kind: 'unknown', raw, origin };
  }
  const unit = match[2]?.toLowerCase();
  if (!unit || unit === 'rep' || unit === 'reps') return { kind: 'reps', value };
  if (unit === 'step' || unit === 'steps') return { kind: 'steps', value };
  return { kind: 'seconds', value };
}

export function repsTarget(value: number): WorkoutTarget {
  return Number.isSafeInteger(value) && value > 0
    ? { kind: 'reps', value }
    : { kind: 'unknown', raw: String(value), origin: 'invalid-reps' };
}

/** A missing or damaged typed target must never be inferred from legacy reps. */
export function restoreWorkoutTarget(target: unknown, legacyReps?: unknown): WorkoutTarget {
  if (target && typeof target === 'object') {
    const item = target as Record<string, unknown>;
    if (item.kind === 'unknown' && typeof item.raw === 'string' && typeof item.origin === 'string') {
      return { kind: 'unknown', raw: item.raw, origin: item.origin };
    }
    if (
      (item.kind === 'reps' || item.kind === 'seconds' || item.kind === 'steps') &&
      typeof item.value === 'number' &&
      Number.isSafeInteger(item.value) &&
      item.value > 0
    ) {
      return { kind: item.kind, value: item.value };
    }
  }
  return { kind: 'unknown', raw: legacyReps == null ? '' : String(legacyReps), origin: 'legacy-resume' };
}

export function formatWorkoutTarget(target: WorkoutTarget): string {
  if (target.kind === 'unknown') return target.raw.trim() || 'Unknown target';
  if (target.kind === 'reps') return `${target.value} reps`;
  const unit = target.kind === 'seconds' ? 'second' : 'step';
  return `${target.value} ${unit}${target.value === 1 ? '' : 's'}`;
}

export function formatWorkoutTargetLabel(target: WorkoutTarget): string {
  return `Target: ${formatWorkoutTarget(target)}`;
}

export function canSaveWorkoutTargets(targets: WorkoutTarget[]): boolean {
  return targets.every((target) =>
    (target.kind === 'reps' || target.kind === 'seconds' || target.kind === 'steps') &&
    Number.isSafeInteger(target.value) &&
    target.value > 0 &&
    target.value <= 2147483647
  );
}

/** Null metadata is legacy history, not evidence of a known planned target. */
export function restoreSavedWorkoutTarget(metadata: {
  target_kind?: string | null;
  target_value?: number | null;
  target_raw?: string | null;
}): WorkoutTarget | null {
  const { target_kind: kind, target_value: value, target_raw: raw } = metadata;
  if (kind == null && value == null && raw == null) return null;
  if (
    (kind === 'reps' || kind === 'seconds' || kind === 'steps') &&
    typeof value === 'number' &&
    raw == null
  ) {
    const target: WorkoutTarget = { kind, value };
    if (canSaveWorkoutTargets([target])) return target;
  }
  return {
    kind: 'unknown',
    raw: raw ?? 'Unknown target',
    origin: 'saved-session-set',
  };
}

export function isMaxRepsPrCandidate(target: WorkoutTarget, previousBest: number): boolean {
  return target.kind === 'reps' && target.value > previousBest;
}