import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUnits } from '../contexts/UnitsContext';

interface StatsData {
  thisMonth: {
    workoutCount: number;
    totalMinutes: number;
    prCount: number;
  };
  allTime: {
    totalWorkouts: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    totalPrs: number;
  };
  topBodyParts: Array<{ name: string; count: number }>;
  bodyWeight: {
    latest: number | null;
    previous: number | null;
    latestDate: string | null;
  };
}

function toLocalDateStr(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const dateStrs = [...new Set(dates.map(toLocalDateStr))].sort().reverse();
  const today = toLocalDateStr(new Date().toISOString());
  const yesterday = toLocalDateStr(
    new Date(Date.now() - 86400000).toISOString()
  );
  if (dateStrs[0] !== today && dateStrs[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dateStrs.length; i++) {
    const prev = new Date(dateStrs[i - 1]);
    const curr = new Date(dateStrs[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function computeLongestStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const dateStrs = [...new Set(dates.map(toLocalDateStr))].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dateStrs.length; i++) {
    const prev = new Date(dateStrs[i - 1]);
    const curr = new Date(dateStrs[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
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
        backgroundColor: '#f1f5f9',
      }}
    />
  );
}

function StatsSkeleton() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.card, { marginBottom: 16 }]}>
          <SkeletonBlock width={100} height={12} radius={4} />
          <View style={{ height: 12 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SkeletonBlock width="45%" height={56} radius={10} />
            <SkeletonBlock width="45%" height={56} radius={10} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.statBox, accent && styles.statBoxAccent]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export function StatsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { weightUnit } = useUnits();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!user) return;
    try {
      setError('');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [workoutsRes, bodyRes] = await Promise.all([
        supabase
          .from('workouts')
          .select('id, date, body_parts, duration_seconds')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('body_measurements')
          .select('weight, created_at')
          .eq('user_id', user.id)
          .not('weight', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const allWorkouts = workoutsRes.data || [];
      const allWorkoutIds = allWorkouts.map((w) => w.id);

      const thisMonthWorkouts = allWorkouts.filter((w) => w.date >= startOfMonth);
      const thisMonthIds = new Set(thisMonthWorkouts.map((w) => w.id));

      let prExercises: Array<{ workout_id: string; is_pr: boolean }> = [];
      if (allWorkoutIds.length > 0) {
        const { data } = await supabase
          .from('workout_exercises')
          .select('workout_id, is_pr')
          .in('workout_id', allWorkoutIds.slice(0, 500))
          .eq('is_pr', true);
        prExercises = data || [];
      }

      const allDates = allWorkouts.map((w) => w.date);
      const thisMonthPrCount = prExercises.filter((ex) => thisMonthIds.has(ex.workout_id)).length;
      const totalPrs = prExercises.length;

      const totalSecondsAll = allWorkouts.reduce(
        (acc, w) => acc + (w.duration_seconds || 0),
        0
      );
      const totalSecondsThisMonth = thisMonthWorkouts.reduce(
        (acc, w) => acc + (w.duration_seconds || 0),
        0
      );

      const bodyPartCounts: Record<string, number> = {};
      for (const w of allWorkouts) {
        for (const part of w.body_parts || []) {
          bodyPartCounts[part] = (bodyPartCounts[part] || 0) + 1;
        }
      }
      const topBodyParts = Object.entries(bodyPartCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      const bodyData = bodyRes.data || [];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const latestWeight = bodyData[0] ?? null;
      const previousWeight =
        bodyData.find((b) => b.created_at <= thirtyDaysAgo) ?? null;

      setStats({
        thisMonth: {
          workoutCount: thisMonthWorkouts.length,
          totalMinutes: Math.round(totalSecondsThisMonth / 60),
          prCount: thisMonthPrCount,
        },
        allTime: {
          totalWorkouts: allWorkouts.length,
          totalMinutes: Math.round(totalSecondsAll / 60),
          currentStreak: computeStreak(allDates),
          longestStreak: computeLongestStreak(allDates),
          totalPrs,
        },
        topBodyParts,
        bodyWeight: {
          latest: latestWeight?.weight ?? null,
          previous: previousWeight?.weight ?? null,
          latestDate: latestWeight?.created_at ?? null,
        },
      });
    } catch (err) {
      if (__DEV__) console.error('StatsScreen:', err);
      setError('Could not load stats. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatsSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <Text style={styles.emptyTitle}>Couldn't load stats</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              fetchStats();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!stats || stats.allTime.totalWorkouts === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <Text style={styles.emptyTitle}>No stats yet</Text>
          <Text style={styles.emptySub}>
            Complete your first workout to start seeing progress stats here.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Workout', { screen: 'StartWorkout' })}
          >
            <Text style={styles.primaryButtonText}>Start a Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const weightChange =
    stats.bodyWeight.latest !== null && stats.bodyWeight.previous !== null
      ? stats.bodyWeight.latest - stats.bodyWeight.previous
      : null;

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  const formatMinutes = (mins: number): string => {
    if (mins === 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── This Month ── */}
        <SectionHeader title={monthName.toUpperCase()} />
        <View style={styles.card}>
          <View style={styles.statGrid}>
            <StatBox
              label="Workouts"
              value={String(stats.thisMonth.workoutCount)}
              accent
            />
            <StatBox
              label="Active time"
              value={formatMinutes(stats.thisMonth.totalMinutes)}
            />
            <StatBox
              label="PRs set"
              value={String(stats.thisMonth.prCount)}
            />
          </View>
        </View>

        {/* ── All Time ── */}
        <SectionHeader title="ALL TIME" />
        <View style={styles.card}>
          <View style={styles.statGrid}>
            <StatBox label="Total workouts" value={String(stats.allTime.totalWorkouts)} accent />
            <StatBox label="Active time" value={formatMinutes(stats.allTime.totalMinutes)} />
            <StatBox label="Current streak" value={`${stats.allTime.currentStreak}d`} />
            <StatBox label="Longest streak" value={`${stats.allTime.longestStreak}d`} />
            <StatBox label="Total PRs" value={String(stats.allTime.totalPrs)} />
          </View>
        </View>

        {/* ── Body Weight ── */}
        {stats.bodyWeight.latest !== null && (
          <>
            <SectionHeader title="BODY WEIGHT" />
            <View style={styles.card}>
              <View style={styles.weightRow}>
                <View>
                  <Text style={styles.weightValue}>
                    {stats.bodyWeight.latest}{' '}
                    <Text style={styles.weightUnit}>{weightUnit}</Text>
                  </Text>
                  {stats.bodyWeight.latestDate && (
                    <Text style={styles.weightDate}>
                      Last logged{' '}
                      {new Date(stats.bodyWeight.latestDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  )}
                </View>
                {weightChange !== null && (
                  <View
                    style={[
                      styles.changeBadge,
                      weightChange < 0 ? styles.changeBadgeDown : styles.changeBadgeUp,
                    ]}
                  >
                    <Text
                      style={[
                        styles.changeText,
                        weightChange < 0 ? styles.changeTextDown : styles.changeTextUp,
                      ]}
                    >
                      {weightChange > 0 ? '+' : ''}
                      {weightChange.toFixed(1)} {weightUnit}
                      {'\n'}
                      <Text style={styles.changeSubText}>vs 30 days ago</Text>
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* ── Training Breakdown ── */}
        {stats.topBodyParts.length > 0 && (
          <>
            <SectionHeader title="TRAINING BREAKDOWN" />
            <View style={styles.card}>
              {stats.topBodyParts.map((bp, i) => {
                const maxCount = stats.topBodyParts[0].count;
                const pct = maxCount > 0 ? bp.count / maxCount : 0;
                return (
                  <View key={bp.name} style={[styles.breakdownRow, i > 0 && styles.breakdownRowBorder]}>
                    <Text style={styles.breakdownLabel}>{bp.name}</Text>
                    <View style={styles.breakdownBarTrack}>
                      <View
                        style={[styles.breakdownBarFill, { width: `${pct * 100}%` }]}
                      />
                    </View>
                    <Text style={styles.breakdownCount}>{bp.count}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
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
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Section header ──
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 4,
  },

  // ── Card ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 20,
  },

  // ── Stat grid ──
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    minWidth: '30%',
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statBoxAccent: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statValueAccent: {
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  statLabelAccent: {
    color: '#60a5fa',
  },

  // ── Body weight ──
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -1,
  },
  weightUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  weightDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 4,
  },
  changeBadge: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  changeBadgeDown: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  changeBadgeUp: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  changeTextDown: {
    color: '#059669',
  },
  changeTextUp: {
    color: '#ea580c',
  },
  changeSubText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94a3b8',
  },

  // ── Training breakdown ──
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  breakdownRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    width: 90,
  },
  breakdownBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  breakdownCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    width: 28,
    textAlign: 'right',
  },
});
