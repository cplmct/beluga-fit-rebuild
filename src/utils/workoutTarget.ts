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
  return targets.every((target) => target.kind === 'reps');
}

export function isMaxRepsPrCandidate(target: WorkoutTarget, previousBest: number): boolean {
  return target.kind === 'reps' && target.value > previousBest;
}