import AsyncStorage from '@react-native-async-storage/async-storage';

const WEEKLY_GOAL_KEY = 'beluga_weekly_goal';

export const DEFAULT_WEEKLY_GOAL = 3;
export const WEEKLY_GOAL_OPTIONS = [2, 3, 4, 5];

export async function getWeeklyGoal(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(WEEKLY_GOAL_KEY);
    if (!raw) return DEFAULT_WEEKLY_GOAL;
    const val = parseInt(raw, 10);
    return isNaN(val) ? DEFAULT_WEEKLY_GOAL : val;
  } catch {
    return DEFAULT_WEEKLY_GOAL;
  }
}

export async function saveWeeklyGoal(goal: number): Promise<void> {
  try {
    await AsyncStorage.setItem(WEEKLY_GOAL_KEY, String(goal));
  } catch {}
}

// ── Local week helpers ────────────────────────────────────────
// "Week" = Monday…Sunday in local timezone.
// Consistent with the toLocalDateKey approach used in CalendarScreen.

/** Converts a UTC ISO timestamp to a local YYYY-MM-DD string. */
export function toLocalDateKey(isoString: string): string {
  const d = new Date(isoString);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

/** Returns midnight (local) on the Monday of the week containing `date`. */
export function getLocalWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun, 1 = Mon … 6 = Sat
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns 23:59:59.999 (local) on the Sunday of the week containing `date`. */
export function getLocalWeekEnd(date: Date = new Date()): Date {
  const start = getLocalWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Given an array of objects with a UTC ISO `date` field, returns the count
 * whose local date falls within the current local Mon–Sun week.
 */
export function countWorkoutsThisWeek(sessions: { date: string }[]): number {
  const start = getLocalWeekStart();
  const end = getLocalWeekEnd();
  return sessions.filter((s) => {
    const d = new Date(s.date);
    return d >= start && d <= end;
  }).length;
}
