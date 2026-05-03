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
import { getActivePlan, ActivePlanState, getWeekNumber } from '../utils/activePlan';
import { getPlanById, PLAN_CATEGORIES } from '../data/workoutPlans';

interface TodayWorkout {
  bodyParts: string[];
  exerciseCount: number;
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates.map(toLocalDateStr))].sort().reverse();
  let streak = 0;
  const cursor = new Date(todayStr());
  for (const d of unique) {
    const curStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
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
  const [activePlan, setActivePlanState] = useState<ActivePlanState | null>(null);
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

      const [profileRes, workoutsRes, weightRes, ap] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', user!.id).maybeSingle(),
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
        getActivePlan(),
      ]);

      setActivePlanState(ap);

      const workouts = workoutsRes.data || [];
      const today = todayStr();
      const todayWorkouts = workouts.filter((w) => toLocalDateStr(w.date) === today);

      let todayWorkout: TodayWorkout | null = null;
      if (todayWorkouts.length > 0) {
        const { data: exRows } = await supabase
          .from('workout_exercises')
          .select('id')
          .eq('workout_id', todayWorkouts[0].id);
        todayWorkout = {
          bodyParts: [...new Set(todayWorkouts.flatMap((w) => w.body_parts || []))],
          exerciseCount: exRows?.length || 0,
        };
      }

      const now = new Date();
      const dow = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
      monday.setHours(0, 0, 0, 0);

      setData({
        profileName: profileRes.data?.name || '',
        todayWorkout,
        weeklyCount: workouts.filter((w) => new Date(w.date) >= monday).length,
        streak: computeStreak(workouts.map((w) => w.date)),
        latestWeight: weightRes.data
          ? { value: weightRes.data.weight, date: weightRes.data.created_at }
          : null,
      });
    } catch (err) {
      if (__DEV__) console.error('HomeScreen:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayName = data.profileName || user?.email?.split('@')[0] || 'Athlete';
  const activePlanData = activePlan ? getPlanById(activePlan.planId) : null;
  const activePlanCat = activePlanData ? PLAN_CATEGORIES[activePlanData.category] : null;
  const weekNumber = activePlan ? getWeekNumber(activePlan.startDate) : null;

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
                {data.todayWorkout.exerciseCount === 1 ? 'exercise' : 'exercises'}
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
            onPress={() => navigation.navigate('Workout', { screen: 'StartWorkout' })}
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
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
      </View>

      {/* ── Active Plan ── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>YOUR PLAN</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Workout', { screen: 'PlanLibrary' })}
          >
            <Text style={styles.sectionLink}>
              {activePlanData ? 'Browse plans' : 'Find a plan'}
            </Text>
          </TouchableOpacity>
        </View>

        {activePlanData && activePlanCat ? (
          <TouchableOpacity
            style={[styles.activePlanCard, { borderTopColor: activePlanCat.color }]}
            onPress={() =>
              navigation.navigate('Workout', {
                screen: 'PlanDetail',
                params: { planId: activePlanData.id },
              })
            }
            activeOpacity={0.85}
          >
            <View style={styles.activePlanTop}>
              <View
                style={[styles.activePlanBadge, { backgroundColor: activePlanCat.accent }]}
              >
                <Text style={[styles.activePlanBadgeText, { color: activePlanCat.color }]}>
                  {activePlanCat.label}
                </Text>
              </View>
              <Text style={styles.activePlanWeek}>
                Week {weekNumber} of {activePlanData.durationWeeks}
              </Text>
            </View>
            <Text style={styles.activePlanTitle}>{activePlanData.title}</Text>
            <View style={styles.activePlanMeta}>
              <Text style={styles.activePlanMetaText}>
                {activePlanData.workoutsPerWeek}x / week
              </Text>
              <Text style={styles.activePlanMetaDot}>·</Text>
              <Text style={styles.activePlanMetaText}>
                {activePlanData.difficulty}
              </Text>
              <Text style={styles.activePlanMetaDot}>·</Text>
              <Text style={styles.activePlanMetaText}>
                {activePlanData.equipmentLevel}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: activePlanCat.color,
                    width: `${Math.min(
                      ((weekNumber! - 1) / activePlanData.durationWeeks) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.noPlanCard}
            onPress={() => navigation.navigate('Workout', { screen: 'PlanLibrary' })}
            activeOpacity={0.85}
          >
            <View style={styles.noPlanLeft}>
              <Text style={styles.noPlanTitle}>No active plan</Text>
              <Text style={styles.noPlanSub}>
                Choose a structured plan to guide your training
              </Text>
            </View>
            <Text style={styles.noPlanArrow}>›</Text>
          </TouchableOpacity>
        )}
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
                  {new Date(data.latestWeight.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <Text style={styles.bodyArrow}>›</Text>
            </View>
          ) : (
            <View style={styles.bodyCardInner}>
              <View>
                <Text style={styles.bodyEmptyTitle}>No measurements logged</Text>
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
  header: { marginBottom: 28 },
  headerDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  headerGreeting: { fontSize: 15, fontWeight: '400', color: '#64748b' },
  headerName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
    textTransform: 'capitalize',
    letterSpacing: -0.5,
  },

  // ── Section chrome ──
  section: { marginBottom: 24 },
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
  sectionLink: { fontSize: 13, fontWeight: '600', color: '#2563eb' },

  // ── Today: start ──
  todayStartCard: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayStartLeft: { flex: 1, paddingRight: 16 },
  todayStartHint: { fontSize: 12, fontWeight: '500', color: '#93c5fd', marginBottom: 4 },
  todayStartCta: { fontSize: 19, fontWeight: '700', color: '#ffffff', letterSpacing: -0.3 },
  todayStartBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  todayStartBadgeText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },

  // ── Today: done ──
  todayDoneCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  todayDoneAccent: { width: 4, alignSelf: 'stretch', backgroundColor: '#10b981' },
  todayDoneBody: { flex: 1, paddingVertical: 18, paddingHorizontal: 16 },
  todayDoneTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  todayDoneSub: { fontSize: 13, color: '#64748b' },
  todayDoneLink: { paddingHorizontal: 18, paddingVertical: 18 },
  todayDoneLinkText: { fontSize: 13, fontWeight: '600', color: '#2563eb' },

  // ── Stats ──
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    marginBottom: 24,
  },
  statBlock: { flex: 1, paddingVertical: 20, alignItems: 'center' },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -1,
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '500', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },

  // ── Active plan ──
  activePlanCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopWidth: 3,
    padding: 18,
  },
  activePlanTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activePlanBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activePlanBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  activePlanWeek: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  activePlanTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  activePlanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  activePlanMetaText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  activePlanMetaDot: { fontSize: 12, color: '#cbd5e1' },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 2, minWidth: 4 },

  // ── No plan ──
  noPlanCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noPlanLeft: { flex: 1 },
  noPlanTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  noPlanSub: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  noPlanArrow: { fontSize: 22, color: '#cbd5e1', marginLeft: 12 },

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
  bodyWeightUnit: { fontSize: 16, fontWeight: '500', color: '#64748b' },
  bodyWeightDate: { fontSize: 12, color: '#94a3b8' },
  bodyArrow: { fontSize: 22, color: '#cbd5e1' },
  bodyEmptyTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  bodyEmptySub: { fontSize: 12, color: '#94a3b8', maxWidth: 220, lineHeight: 17 },
});
