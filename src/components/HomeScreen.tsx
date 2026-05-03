import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';

interface TodayWorkout {
  bodyParts: string[];
  exerciseCount: number;
  workoutId: string;
}

interface DashboardData {
  profileName: string;
  todayWorkout: TodayWorkout | null;
  weeklyCount: number;
  streak: number;
  latestWeight: { value: number; date: string } | null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function toLocalDateStr(dateString: string): string {
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates.map(toLocalDateStr))].sort().reverse();
  const today = todayStr();
  let streak = 0;
  let cursor = new Date(today);
  for (const d of unique) {
    const curStr = [
      cursor.getFullYear(),
      String(cursor.getMonth() + 1).padStart(2, '0'),
      String(cursor.getDate()).padStart(2, '0'),
    ].join('-');
    if (d === curStr) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (d < curStr) {
      break;
    }
  }
  return streak;
}

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    profileName: '',
    todayWorkout: null,
    weeklyCount: 0,
    streak: 0,
    latestWeight: null,
  });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (user) loadDashboard();
    }, [user])
  );

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const [profileRes, workoutsRes, weightRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('name')
          .eq('id', user!.id)
          .maybeSingle(),
        supabase
          .from('workouts')
          .select('id, date, body_parts')
          .eq('user_id', user!.id)
          .gte('date', sixtyDaysAgo.toISOString())
          .order('date', { ascending: false }),
        supabase
          .from('body_measurements')
          .select('weight, created_at')
          .eq('user_id', user!.id)
          .not('weight', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const workouts = workoutsRes.data || [];
      const today = todayStr();

      const todayWorkouts = workouts.filter(
        (w) => toLocalDateStr(w.date) === today
      );

      let todayWorkout: TodayWorkout | null = null;
      if (todayWorkouts.length > 0) {
        const { data: exRows } = await supabase
          .from('workout_exercises')
          .select('id')
          .eq('workout_id', todayWorkouts[0].id);
        const allParts = [
          ...new Set(todayWorkouts.flatMap((w) => w.body_parts || [])),
        ];
        todayWorkout = {
          workoutId: todayWorkouts[0].id,
          bodyParts: allParts,
          exerciseCount: exRows?.length || 0,
        };
      }

      const now = new Date();
      const dow = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
      monday.setHours(0, 0, 0, 0);
      const weeklyCount = workouts.filter(
        (w) => new Date(w.date) >= monday
      ).length;

      const streak = computeStreak(workouts.map((w) => w.date));

      const latestWeight = weightRes.data
        ? { value: weightRes.data.weight, date: weightRes.data.created_at }
        : null;

      setData({
        profileName: profileRes.data?.name || '',
        todayWorkout,
        weeklyCount,
        streak,
        latestWeight,
      });
    } catch (err) {
      if (__DEV__) console.error('HomeScreen:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    data.profileName ||
    user?.email?.split('@')[0] ||
    'Athlete';

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerDate}>{formattedDate}</Text>
        <Text style={styles.headerGreeting}>{getGreeting()},</Text>
        <Text style={styles.headerName} numberOfLines={1}>
          {displayName}
        </Text>
      </View>

      {/* ── Today ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>TODAY</Text>

        {data.todayWorkout ? (
          <View style={styles.todayDoneCard}>
            <View style={styles.todayDoneAccent} />
            <View style={styles.todayDoneBody}>
              <Text style={styles.todayDoneTitle}>Workout complete</Text>
              <Text style={styles.todayDoneSub}>
                {data.todayWorkout.bodyParts.join(' · ')}
                {'  ·  '}
                {data.todayWorkout.exerciseCount}{' '}
                {data.todayWorkout.exerciseCount === 1
                  ? 'exercise'
                  : 'exercises'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('History')}
              style={styles.todayDoneLink}
            >
              <Text style={styles.todayDoneLinkText}>View</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.todayStartCard}
            onPress={() =>
              navigation.navigate('Workout', { screen: 'StartWorkout' })
            }
            activeOpacity={0.88}
          >
            <View style={styles.todayStartLeft}>
              <Text style={styles.todayStartHint}>No session logged yet</Text>
              <Text style={styles.todayStartCta}>Start today's workout</Text>
            </View>
            <View style={styles.todayStartBadge}>
              <Text style={styles.todayStartBadgeText}>Start</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Weekly Stats ── */}
      <View style={styles.statsCard}>
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{data.weeklyCount}</Text>
          <Text style={styles.statLabel}>
            {data.weeklyCount === 1 ? 'Workout' : 'Workouts'} this week
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{data.streak}</Text>
          <Text style={styles.statLabel}>
            {data.streak === 1 ? 'Day' : 'Day'} streak
          </Text>
        </View>
      </View>

      {/* ── Plans ── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>PLANS</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Workout', { screen: 'Templates' })
            }
          >
            <Text style={styles.sectionLink}>Browse all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.plansCard}>
          {WORKOUT_TEMPLATES.slice(0, 3).map((t, i) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.planRow,
                i < 2 && styles.planRowBorder,
              ]}
              onPress={() =>
                navigation.navigate('Workout', { screen: 'Templates' })
              }
              activeOpacity={0.75}
            >
              <View style={styles.planRowLeft}>
                <Text style={styles.planRowName}>{t.name}</Text>
                <Text style={styles.planRowDesc}>{t.description}</Text>
              </View>
              <Text style={styles.planRowArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Body Progress ── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>BODY</Text>
          <TouchableOpacity onPress={() => navigation.navigate('BodyTracker')}>
            <Text style={styles.sectionLink}>Log measurement</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.bodyCard}
          onPress={() => navigation.navigate('BodyTracker')}
          activeOpacity={0.85}
        >
          {data.latestWeight ? (
            <View style={styles.bodyCardInner}>
              <View>
                <Text style={styles.bodyWeight}>
                  {data.latestWeight.value}{' '}
                  <Text style={styles.bodyWeightUnit}>lbs</Text>
                </Text>
                <Text style={styles.bodyWeightDate}>
                  Last logged{' '}
                  {new Date(data.latestWeight.date).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric' }
                  )}
                </Text>
              </View>
              <Text style={styles.bodyArrow}>›</Text>
            </View>
          ) : (
            <View style={styles.bodyCardInner}>
              <View>
                <Text style={styles.bodyEmptyTitle}>
                  No measurements logged
                </Text>
                <Text style={styles.bodyEmptySub}>
                  Track weight and body measurements over time
                </Text>
              </View>
              <Text style={styles.bodyArrow}>›</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // ── Header ──
  header: {
    marginBottom: 28,
  },
  headerDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  headerGreeting: {
    fontSize: 15,
    fontWeight: '400',
    color: '#64748b',
  },
  headerName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
    textTransform: 'capitalize',
    letterSpacing: -0.5,
  },

  // ── Section chrome ──
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },

  // ── Today: start card ──
  todayStartCard: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayStartLeft: {
    flex: 1,
    paddingRight: 16,
  },
  todayStartHint: {
    fontSize: 12,
    fontWeight: '500',
    color: '#93c5fd',
    marginBottom: 4,
  },
  todayStartCta: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  todayStartBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  todayStartBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  // ── Today: done card ──
  todayDoneCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  todayDoneAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: '#10b981',
  },
  todayDoneBody: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  todayDoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  todayDoneSub: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '400',
  },
  todayDoneLink: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  todayDoneLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },

  // ── Stats ──
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    marginBottom: 24,
  },
  statBlock: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },

  // ── Plans ──
  plansCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  planRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  planRowLeft: {
    flex: 1,
  },
  planRowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  planRowDesc: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '400',
  },
  planRowArrow: {
    fontSize: 22,
    color: '#cbd5e1',
    fontWeight: '300',
    marginLeft: 12,
  },

  // ── Body ──
  bodyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  bodyCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bodyWeight: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  bodyWeightUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  bodyWeightDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '400',
  },
  bodyArrow: {
    fontSize: 22,
    color: '#cbd5e1',
    fontWeight: '300',
  },
  bodyEmptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  bodyEmptySub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '400',
    maxWidth: 220,
    lineHeight: 17,
  },
});
