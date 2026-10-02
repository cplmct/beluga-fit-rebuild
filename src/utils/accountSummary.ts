export interface AccountStats {
  totalWorkouts: number;
  daysActive: number;
  lastMeasurementDate: string | null;
}

type SummaryResult<T> = { data: T | null; error: unknown };

/** A failed request is unavailable data, never a verified empty summary. */
export function buildAccountSummary(
  sessionsResult: SummaryResult<{ started_at: string }[]>,
  measurementResult: SummaryResult<{ created_at: string }>,
): AccountStats {
  if (sessionsResult.error || measurementResult.error) {
    throw new Error('Could not load account data summary.');
  }
  const sessions = sessionsResult.data ?? [];
  return {
    totalWorkouts: sessions.length,
    daysActive: new Set(sessions.map((session) => session.started_at.split('T')[0])).size,
    lastMeasurementDate: measurementResult.data?.created_at ?? null,
  };
}