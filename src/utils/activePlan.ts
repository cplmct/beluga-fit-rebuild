import * as FileSystem from 'expo-file-system';

const ACTIVE_PLAN_FILE = FileSystem.documentDirectory + 'belugafit_active_plan.json';

export interface ActivePlanState {
  planId: string;
  startDate: string;
}

export async function getActivePlan(): Promise<ActivePlanState | null> {
  try {
    const info = await FileSystem.getInfoAsync(ACTIVE_PLAN_FILE);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(ACTIVE_PLAN_FILE);
    return JSON.parse(content) as ActivePlanState;
  } catch {
    return null;
  }
}

export async function setActivePlan(planId: string): Promise<void> {
  const state: ActivePlanState = {
    planId,
    startDate: new Date().toISOString(),
  };
  await FileSystem.writeAsStringAsync(
    ACTIVE_PLAN_FILE,
    JSON.stringify(state),
    { encoding: FileSystem.EncodingType.UTF8 }
  );
}

export async function clearActivePlan(): Promise<void> {
  try {
    await FileSystem.deleteAsync(ACTIVE_PLAN_FILE, { idempotent: true });
  } catch {
    // ignore
  }
}

export function getWeekNumber(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(Math.floor(diffDays / 7) + 1, 99);
}
