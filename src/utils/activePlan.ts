import { supabase } from '../lib/supabase';

export interface ActivePlanState {
  planId: string;
  startDate: string;
}

export async function getActivePlan(userId: string): Promise<ActivePlanState | null> {
  const run = () =>
    supabase
      .from('profiles')
      .select('active_plan_id, active_plan_start_date')
      .eq('id', userId)
      .maybeSingle();

  let { data, error } = await run();

  // PGRST002 = PostgREST schema-cache reload in progress (transient).
  // Wait 1.5 s and retry once before giving up.
  if (error?.code === 'PGRST002') {
    if (__DEV__) {
      console.warn(
        '[ActivePlan] PGRST002 on first attempt — retrying in 1.5 s.\n',
        JSON.stringify(error),
      );
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    ({ data, error } = await run());
  }

  if (error) {
    if (__DEV__) {
      console.error(
        '[ActivePlan] getActivePlan failed.',
        '| message:', error.message,
        '| code:', error.code,
        '| details:', error.details,
        '| hint:', error.hint,
        '\nFull error:', JSON.stringify(error),
      );
    }
    return null;
  }

  if (!data?.active_plan_id) return null;
  return {
    planId: data.active_plan_id,
    startDate: data.active_plan_start_date,
  };
}

export async function setActivePlan(
  userId: string,
  planId: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({
      active_plan_id: planId,
      active_plan_start_date: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    if (__DEV__) {
      console.error(
        '[ActivePlan] setActivePlan failed.',
        '| message:', error.message,
        '| code:', error.code,
        '\nFull error:', JSON.stringify(error),
      );
    }
    return { error: new Error(error.message) };
  }
  return { error: null };
}

export async function clearActivePlan(userId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({
      active_plan_id: null,
      active_plan_start_date: null,
    })
    .eq('id', userId);

  if (error) {
    if (__DEV__) {
      console.error(
        '[ActivePlan] clearActivePlan failed.',
        '| message:', error.message,
        '| code:', error.code,
        '\nFull error:', JSON.stringify(error),
      );
    }
    return { error: new Error(error.message) };
  }
  return { error: null };
}

export function getWeekNumber(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(Math.floor(diffDays / 7) + 1, 99);
}
