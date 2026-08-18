import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUnits } from '../contexts/UnitsContext';

interface CurrentPRs {
  maxWeight: number | null;
  maxWeightDate: string | null;
  maxReps: number | null;
  maxRepsDate: string | null;
}

interface SessionHistoryItem {
  sessionId: string;
  date: string;
  sets: Array<{
    setNumber: number;
    weightKg: number | null;
    reps: number | null;
    isCompleted: boolean;
    isPr: boolean;
  }>;
  hasPr: boolean;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function SkeletonBlock({
  width,
  height = 14,
  radius = 6,
}: {
  width: number | string;
  height?: number;
  radius?: number;
}) {
  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius: radius,
        backgroundColor: '#e2e8f0',
      }}
    />
  );
}

export function ExerciseDetailScreen({ route, navigation }: any) {
  const { exerciseId, exerciseName } = route.params as {
    exerciseId: string;
    exerciseName: string;
  };
  const { user } = useAuth();
  const { weightUnit } = useUnits();

  const [currentPRs, setCurrentPRs] = useState<CurrentPRs>({
    maxWeight: null,
    maxWeightDate: null,
    maxReps: null,
    maxRepsDate: null,
  });
  const [bodyPart, setBodyPart] = useState('');
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noHistory, setNoHistory] = useState(false);

  useEffect(() => {
    if (user) fetchAll();
  }, [exerciseId, user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    setNoHistory(false);
    try {
      // Q1 + Q2 in parallel — current PRs and primary muscle group
      const [prRes, mgRes] = await Promise.all([
        supabase
          .from('personal_records')
          .select('record_type, value, achieved_at')
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId),
        supabase
          .from('exercise_muscle_groups')
          .select('muscle_groups ( name ), is_primary')
          .eq('exercise_id', exerciseId)
          .eq('is_primary', true)
          .maybeSingle(),
      ]);

      if (prRes.error) throw prRes.error;
      // Muscle-group lookup is informational — a missing mapping or PostgREST
      // PGRST116 (multiple rows) must not block the PR/history view.
      if (mgRes.error && __DEV__) {
        console.warn('[ExerciseDetailScreen] muscle group lookup failed:', mgRes.error.message);
      }

      const prs: CurrentPRs = {
        maxWeight: null,
        maxWeightDate: null,
        maxReps: null,
        maxRepsDate: null,
      };
      for (const row of prRes.data ?? []) {
        if (row.record_type === 'max_weight') {
          prs.maxWeight = row.value;
          prs.maxWeightDate = row.achieved_at;
        }
        if (row.record_type === 'max_reps') {
          prs.maxReps = row.value;
          prs.maxRepsDate = row.achieved_at;
        }
      }
      const hasPRData = prs.maxWeight !== null || prs.maxReps !== null;
      setCurrentPRs(prs);
      setBodyPart((mgRes.data as any)?.muscle_groups?.name ?? '');

      // Q3 (2-step) — get completed session IDs for this user, then fetch
      // session_exercises for this exercise. Avoids unreliable PostgREST
      // cross-table filter/order on joined columns.
      const { data: sessionRows, error: sessErr } = await supabase
        .from('workout_sessions')
        .select('id, started_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(100);

      if (sessErr) throw sessErr;

      const sessionIds = (sessionRows ?? []).map((s) => s.id);
      const sessionDateMap: Record<string, string> = {};
      for (const s of sessionRows ?? []) sessionDateMap[s.id] = s.started_at;

      if (sessionIds.length > 0) {
        const { data: seRows, error: seErr } = await supabase
          .from('session_exercises')
          .select(
            'session_id, session_sets ( set_number, weight_kg, reps, is_completed, is_pr )'
          )
          .eq('exercise_id', exerciseId)
          .in('session_id', sessionIds);

        if (seErr) throw seErr;

        const items: SessionHistoryItem[] = (seRows ?? [])
          .filter((row) => sessionDateMap[row.session_id])
          .map((row) => {
            const sets = ((row.session_sets as any[]) ?? [])
              .sort((a, b) => a.set_number - b.set_number)
              .map((s) => ({
                setNumber: s.set_number,
                weightKg: s.weight_kg,
                reps: s.reps,
                isCompleted: s.is_completed,
                isPr: s.is_pr,
              }));
            return {
              sessionId: row.session_id,
              date: sessionDateMap[row.session_id],
              sets,
              hasPr: sets.some((s) => s.isPr),
            };
          })
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 20);

        setSessionHistory(items);
        if (!hasPRData && items.length === 0) setNoHistory(true);
      } else {
        // No completed sessions at all for this user
        if (!hasPRData) setNoHistory(true);
      }
    } catch (err: any) {
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.prCard}>
            <SkeletonBlock width={120} height={13} />
            <View style={{ marginTop: 14, gap: 10 }}>
              <SkeletonBlock width="80%" height={20} />
              <SkeletonBlock width="60%" height={20} />
            </View>
          </View>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.historyCard}>
              <SkeletonBlock width={100} height={13} />
              <View style={{ marginTop: 8, gap: 6 }}>
                <SkeletonBlock width="70%" height={14} />
                <SkeletonBlock width="50%" height={14} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerWrap]}>
        <Text style={styles.errorTitle}>Couldn't load exercise data</Text>
        <Text style={styles.errorSub}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchAll()}
          activeOpacity={0.85}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (noHistory) {
    return (
      <View style={[styles.container, styles.centerWrap]}>
        <Text style={styles.emptyStateTitle}>Not enough history yet</Text>
        <Text style={styles.emptyStateSub}>
          Complete this exercise a few more times to see your progress and personal records.
        </Text>
      </View>
    );
  }

  const hasAnyPr = currentPRs.maxWeight !== null || currentPRs.maxReps !== null;

  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: { borderRadius: 12 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#2563eb' },
  };

  // Newest-first → filter to weighted sessions → take 10 most recent → reverse to oldest-first
  const weightChartPoints = sessionHistory
    .filter((item) =>
      item.sets.length > 0 &&
      item.sets.some(s => s.weightKg != null && s.weightKg > 0)
    )
    .slice(0, 10)
    .reverse();

  const weightChartData =
    weightChartPoints.length >= 2
      ? {
          labels: weightChartPoints.map((item) => formatShortDate(item.date)),
          datasets: [
            {
              data: weightChartPoints.map((item) =>
                Math.max(...item.sets
                  .filter(s => s.weightKg != null && s.weightKg > 0)
                  .map(s => s.weightKg as number)
                )
              ),
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        }
      : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Exercise meta — name + muscle group chip */}
        <View style={styles.metaRow}>
          <Text style={styles.exerciseTitle}>{exerciseName}</Text>
          {bodyPart ? (
            <View style={styles.bodyPartChip}>
              <Text style={styles.bodyPartText}>{bodyPart}</Text>
            </View>
          ) : null}
        </View>

        {/* Current PR card */}
        <View style={styles.prCard}>
          <Text style={styles.prCardLabel}>Personal Bests</Text>
          {!hasAnyPr && (
            <Text style={styles.prCardEmpty}>
              No personal records yet. Log this exercise with a weight or rep count to set your first record.
            </Text>
          )}
          {currentPRs.maxWeight !== null && (
            <View style={styles.prRow}>
              <View style={styles.prRowLeft}>
                <Text style={styles.prEmoji}>🏆</Text>
                <View>
                  <Text style={styles.prValue}>
                    {currentPRs.maxWeight} {weightUnit}
                  </Text>
                  <Text style={styles.prType}>Max weight</Text>
                </View>
              </View>
              {currentPRs.maxWeightDate ? (
                <Text style={styles.prDate}>{formatDate(currentPRs.maxWeightDate)}</Text>
              ) : null}
            </View>
          )}
          {currentPRs.maxReps !== null && (
            <View style={[styles.prRow, currentPRs.maxWeight !== null && styles.prRowBorder]}>
              <View style={styles.prRowLeft}>
                <Text style={styles.prEmoji}>🔁</Text>
                <View>
                  <Text style={styles.prValue}>{currentPRs.maxReps} reps</Text>
                  <Text style={styles.prType}>Max reps</Text>
                </View>
              </View>
              {currentPRs.maxRepsDate ? (
                <Text style={styles.prDate}>{formatDate(currentPRs.maxRepsDate)}</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Weight progression — last 10 sessions in ascending order */}
        {sessionHistory.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Weight Progression</Text>
            {weightChartData && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>
                  Weight (last {weightChartPoints.length} sessions)
                </Text>
                <LineChart
                  data={weightChartData}
                  width={screenWidth - 40}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={{ borderRadius: 10 }}
                  withInnerLines={false}
                />
              </View>
            )}
            <View style={styles.progressionCard}>
              {[...sessionHistory]
                .slice(0, 10)
                .reverse()
                .map((item, idx) => {
                  const firstSet = item.sets[0];
                  const weight = firstSet?.weightKg;
                  const reps = firstSet?.reps;
                  return (
                    <View
                      key={item.sessionId}
                      style={[
                        styles.progressionRow,
                        idx > 0 && styles.progressionRowBorder,
                      ]}
                    >
                      <Text style={styles.progressionDate}>
                        {formatShortDate(item.date)}
                      </Text>
                      <Text style={styles.progressionDetail}>
                        {weight !== null && weight !== undefined
                          ? `${weight} ${weightUnit}`
                          : '—'}{' '}
                        × {reps ?? '—'} reps
                      </Text>
                      {item.hasPr && (
                        <View style={styles.prBadge}>
                          <Text style={styles.prBadgeText}>PR</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
          </>
        )}

        {/* Full session history list */}
        <Text style={styles.sectionLabel}>Session History</Text>
        {sessionHistory.length === 0 ? (
          <View style={styles.historyCard}>
            <Text style={styles.emptyText}>
              No completed sessions with this exercise yet.
            </Text>
          </View>
        ) : (
          sessionHistory.map((item) => (
            <View key={item.sessionId} style={styles.historyCard}>
              <View style={styles.historyCardTop}>
                <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                {item.hasPr && (
                  <View style={styles.prBadge}>
                    <Text style={styles.prBadgeText}>PR</Text>
                  </View>
                )}
              </View>
              {item.sets.map((s) => (
                <Text key={s.setNumber} style={styles.setRow}>
                  Set {s.setNumber}: {s.reps ?? '—'} reps
                  {s.weightKg !== null ? ` @ ${s.weightKg} ${weightUnit}` : ''}
                  {s.isPr ? ' 🏆' : ''}
                </Text>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  // ── Exercise meta ──
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  bodyPartChip: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  bodyPartText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },

  // ── Current PR card ──
  prCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 16,
    marginBottom: 24,
  },
  prCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  prCardEmpty: {
    fontSize: 13,
    color: '#b45309',
    lineHeight: 19,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  prRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#fde68a',
  },
  prRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prEmoji: {
    fontSize: 20,
  },
  prValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400e',
    letterSpacing: -0.3,
  },
  prType: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '500',
    marginTop: 1,
  },
  prDate: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '500',
    flexShrink: 0,
    textAlign: 'right',
  },

  // ── Weight chart ──
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },

  // ── Progression ──
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  progressionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 10,
  },
  progressionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  progressionDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    width: 56,
  },
  progressionDetail: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
  },

  // ── History cards ──
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 10,
  },
  historyCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  setRow: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 21,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // ── PR badge ──
  prBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  prBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
  },

  // ── No-history empty state ──
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Error ──
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  retryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
});
