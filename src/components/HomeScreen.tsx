import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { useUnits } from '../contexts/UnitsContext';
import { getActivePlan, ActivePlanState, getWeekNumber } from '../utils/activePlan';
import { getPlanById, PLAN_CATEGORIES } from '../data/workoutPlans';
import { getWeeklyGoal, DEFAULT_WEEKLY_GOAL, getLocalWeekStart, countWorkoutsThisWeek } from '../utils/goalPrefs';
import {
  loadWorkoutSession,
  clearWorkoutSession,
  WorkoutSessionPayload,
} from '../utils/workoutSession';

interface TodayWorkout {
  bodyParts: string[];
  exerciseCount: number;
}

interface DashboardData {
  profileName: string;
  todayWorkout: TodayWorkout | null;
  weeklyCount: number;
  weeklyGoal: number;
  streak: number;
  last7Days: boolean[];
  lastWorkoutDate: string | null;
  latestWeight: { value: number | null; date: string } | null;
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

/**
 * Weekly streak: counts consecutive Mon–Sun weeks where the user met weeklyGoal.
 * The current (in-progress) week is counted only if it already meets the goal,
 * so a partially-completed week never breaks an existing streak.
 */
function computeWeeklyStreak(workouts: { date: string }[], weeklyGoal: number): number {
  if (workouts.length === 0) return 0;

  // Tally workouts per week (keyed by local week-start timestamp)
  const weekCounts = new Map<number, number>();
  for (const w of workouts) {
    const ws = getLocalWeekStart(new Date(w.date)).getTime();
    weekCounts.set(ws, (weekCounts.get(ws) ?? 0) + 1);
  }

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeekTs = getLocalWeekStart().getTime();

  // Walk backwards from last week, counting consecutive weeks that met the goal
  let streak = 0;
  let checkTs = thisWeekTs - weekMs;
  while (true) {
    const count = weekCounts.get(checkTs) ?? 0;
    if (count >= weeklyGoal) {
      streak++;
      checkTs -= weekMs;
    } else {
      break;
    }
  }

  // Forgiving: add current week only if it already met the goal
  if ((weekCounts.get(thisWeekTs) ?? 0) >= weeklyGoal) streak++;

  return streak;
}

function computeLast7Days(workoutDates: string[]): boolean[] {
  const dateSet = new Set(workoutDates.map(toLocalDateStr));
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dateSet.has(ds);
  });
}

function getStreakMessage(streak: number, weeklyCount: number, weeklyGoal: number): string {
  const remaining = Math.max(0, weeklyGoal - weeklyCount);
  if (weeklyCount === 0) {
    return streak > 0 ? 'Keep your streak alive this week' : 'Log a workout to start your streak';
  }
  if (weeklyCount >= weeklyGoal) {
    if (streak >= 2) return `${streak}-week streak — keep it up`;
    return 'Goal reached this week — great work';
  }
  if (remaining === 1) return '1 workout left to hit your goal';
  return `${remaining} workouts left this week`;
}

function formatLastWorkout(isoString: string | null): string {
  if (!isoString) return 'No workouts yet';
  const d = new Date(isoString);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const workoutMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((todayMidnight.getTime() - workoutMidnight.getTime()) / 86400000);
  if (diffDays === 0) return 'Last workout: today';
  if (diffDays === 1) return 'Last workout: yesterday';
  return `Last workout: ${diffDays} days ago`;
}

function getLast7DayLabels(): string[] {
  const DAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return DAY[d.getDay()];
  });
}

function StreakCard({
  streak,
  weeklyCount,
  weeklyGoal,
  last7Days,
  lastWorkoutDate,
}: {
  streak: number;
  weeklyCount: number;
  weeklyGoal: number;
  last7Days: boolean[];
  lastWorkoutDate: string | null;
}) {
  const dayLabels = getLast7DayLabels();
  const message = getStreakMessage(streak, weeklyCount, weeklyGoal);
  const hasActivity = weeklyCount > 0 || streak > 0;
  const progress = Math.min(weeklyCount / weeklyGoal, 1);

  return (
    <View style={streakStyles.card}>
      <View style={streakStyles.topRow}>
        <View style={streakStyles.streakBlock}>
          {streak > 0 ? (
            <>
              <Text style={streakStyles.streakNumber}>{streak}</Text>
              <View>
                <Text style={streakStyles.streakUnit}>
                  {streak === 1 ? 'week' : 'weeks'}
                </Text>
                <Text style={streakStyles.streakUnitSub}>streak</Text>
              </View>
            </>
          ) : (
            <View style={{ paddingBottom: 4 }}>
              <Text style={streakStyles.streakUnit}>No streak</Text>
              <Text style={streakStyles.streakUnitSub}>yet</Text>
            </View>
          )}
        </View>
        <View style={streakStyles.weeklyBlock}>
          <Text style={streakStyles.weeklyNumber}>{weeklyCount} / {weeklyGoal}</Text>
          <Text style={streakStyles.weeklyLabel}>this week</Text>
        </View>
      </View>

      <View style={streakStyles.progressTrack}>
        <View style={[streakStyles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <Text style={[streakStyles.message, !hasActivity && streakStyles.messageMuted]}>
        {message}
      </Text>

      <Text style={streakStyles.lastWorkout}>{formatLastWorkout(lastWorkoutDate)}</Text>

      <View style={streakStyles.dotsRow}>
        {last7Days.map((active, i) => (
          <View key={i} style={streakStyles.dotCell}>
            <View
              style={[
                streakStyles.dot,
                active ? streakStyles.dotActive : streakStyles.dotInactive,
                i === 6 && streakStyles.dotToday,
              ]}
            />
            <Text
              style={[
                streakStyles.dotLabel,
                active ? streakStyles.dotLabelActive : null,
                i === 6 && streakStyles.dotLabelToday,
              ]}
            >
              {dayLabels[i]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SkeletonBlock({ width, height = 14, radius = 6 }: { width: number | string; height?: number; radius?: number }) {
  return (
    <View style={{ width: width as any, height, borderRadius: radius, backgroundColor: '#f1f5f9' }} />
  );
}

function HomeSkeleton() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { gap: 10 }]}>
        <SkeletonBlock width={100} height={11} />
        <SkeletonBlock width={80} height={14} />
        <SkeletonBlock width={160} height={28} radius={8} />
      </View>
      {/* Today card */}
      <View style={[styles.section]}>
        <SkeletonBlock width={56} height={11} radius={4} />
        <View style={{ height: 10 }} />
        <SkeletonBlock width="100%" height={80} radius={14} />
      </View>
      {/* Streak card */}
      <View style={styles.section}>
        <SkeletonBlock width={56} height={11} radius={4} />
        <View style={{ height: 10 }} />
        <SkeletonBlock width="100%" height={120} radius={14} />
      </View>
      {/* Plan card */}
      <View style={styles.section}>
        <SkeletonBlock width={76} height={11} radius={4} />
        <View style={{ height: 10 }} />
        <SkeletonBlock width="100%" height={96} radius={14} />
      </View>
      {/* Body card */}
      <View style={styles.section}>
        <SkeletonBlock width={44} height={11} radius={4} />
        <View style={{ height: 10 }} />
        <SkeletonBlock width="100%" height={72} radius={14} />
      </View>
    </ScrollView>
  );
}

export function HomeScreen({ navigation }: any) {
  const { user, isPasswordRecovery } = useAuth();

  useEffect(() => {
    if (isPasswordRecovery) {
      navigation.navigate('ChangePassword');
    }
  }, [isPasswordRecovery]);
  const { weightUnit } = useUnits();
  const [data, setData] = useState<DashboardData>({
    profileName: '',
    todayWorkout: null,
    weeklyCount: 0,
    weeklyGoal: DEFAULT_WEEKLY_GOAL,
    streak: 0,
    last7Days: Array(7).fill(false),
    lastWorkoutDate: null,
    latestWeight: null,
  });
  const [activePlan, setActivePlanState] = useState<ActivePlanState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumeSession, setResumeSession] = useState<WorkoutSessionPayload | null>(null);

  // Incremented each time a load is initiated or the screen loses focus.
  // Async state updates check this before committing — stale in-flight
  // loads (e.g. from a previous focus event) are silently discarded.
  const loadGenRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      if (user) loadDashboard();
      // Refresh the unfinished-workout banner whenever the screen is focused.
      loadWorkoutSession().then(setResumeSession);
      return () => { loadGenRef.current++; };
    }, [user])
  );

  const handleDiscardSession = async () => {
    await clearWorkoutSession();
    setResumeSession(null);
  };

  const loadDashboard = async () => {
    const gen = ++loadGenRef.current;
    setLoading(true);
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const [profileRes, workoutsRes, weightRes, ap, goalResult] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', user!.id).maybeSingle(),
        supabase
          .from('workouts')
          .select('id, date, body_parts')
          .eq('user_id', user!.id)
          .gte('date', ninetyDaysAgo.toISOString())
          .order('date', { ascending: false }),
        supabase
          .from('body_measurements')
          .select('weight, created_at')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        getActivePlan(user!.id),
        getWeeklyGoal(),
      ]);

      // Discard results if the screen blurred or a newer load started
      // while the Promise.all (or PGRST002 retry inside getActivePlan) was in flight.
      if (loadGenRef.current !== gen) return;

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

        // Check again after the second await point.
        if (loadGenRef.current !== gen) return;

        todayWorkout = {
          bodyParts: [...new Set(todayWorkouts.flatMap((w) => w.body_parts || []))],
          exerciseCount: exRows?.length || 0,
        };
      }

      const workoutDates = workouts.map((w) => w.date);
      const weeklyCount = countWorkoutsThisWeek(workouts);
      const weeklyStreak = computeWeeklyStreak(workouts, goalResult);

      setData({
        profileName: profileRes.data?.name || '',
        todayWorkout,
        weeklyCount,
        weeklyGoal: goalResult,
        streak: weeklyStreak,
        last7Days: computeLast7Days(workoutDates),
        lastWorkoutDate: workouts.length > 0 ? workouts[0].date : null,
        latestWeight: weightRes.data
          ? { value: weightRes.data.weight, date: weightRes.data.created_at }
          : null,
      });
    } catch (err) {
      if (loadGenRef.current !== gen) return;
      if (__DEV__) console.error('HomeScreen:', err);
      setError("Couldn't load your dashboard. Check your connection and try again.");
    } finally {
      if (loadGenRef.current === gen) setLoading(false);
    }
  };

  const handleStartTodaysWorkout = () => {
    if (activePlan) {
      // React Navigation v6 ignores nested `screen` params when the target tab
      // already has stack state (documented behaviour). Relay through StartWorkout —
      // the stack's initial screen — so the params update is always applied,
      // then StartWorkoutScreen forwards immediately to PlanDetail.
      if (__DEV__) console.log('[HomeScreen] Start → relay via StartWorkout, pendingPlanId:', activePlan.planId);
      navigation.navigate('Workout', {
        screen: 'StartWorkout',
        params: { pendingPlanId: activePlan.planId },
      });
    } else {
      if (__DEV__) console.log('[HomeScreen] Start → StartWorkout (no active plan)');
      navigation.navigate('Workout', { screen: 'StartWorkout' });
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
    return <HomeSkeleton />;
  }

  if (error) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 }]}>
        <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#fecaca', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#dc2626' }} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0f172a', letterSpacing: -0.3, textAlign: 'center', marginBottom: 8 }}>
          Couldn't load your dashboard
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 28 }}>
          {error}
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14, borderWidth: 1, borderColor: '#e2e8f0' }}
          onPress={() => { setError(''); loadDashboard(); }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '600' }}>Try Again</Text>
        </TouchableOpacity>
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

      {/* ── Unfinished workout banner ── */}
      {resumeSession && resumeSession.exercises?.length > 0 && (
        <View style={styles.resumeBanner}>
          <View style={styles.resumeBannerLeft}>
            <Text style={styles.resumeBannerTitle}>Unfinished workout</Text>
            <Text style={styles.resumeBannerSub}>
              {resumeSession.completedExercises.length}/{resumeSession.exerciseNames.length} exercises done
            </Text>
          </View>
          <View style={styles.resumeBannerActions}>
            <TouchableOpacity
              style={styles.resumeDiscardBtn}
              onPress={handleDiscardSession}
              activeOpacity={0.8}
            >
              <Text style={styles.resumeDiscardText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resumeBtn}
              onPress={() =>
                navigation.navigate('Workout', {
                  screen: 'WorkoutChecklist',
                  params: {
                    exercises: resumeSession.exercises,
                    bodyParts: resumeSession.bodyParts,
                    autoResume: true,
                  },
                })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.resumeBtnText}>Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            onPress={handleStartTodaysWorkout}
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

      {/* ── Streak Card ── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>STREAK</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
            <Text style={styles.sectionLink}>View stats</Text>
          </TouchableOpacity>
        </View>
        <StreakCard
          streak={data.streak}
          weeklyCount={data.weeklyCount}
          weeklyGoal={data.weeklyGoal}
          last7Days={data.last7Days}
          lastWorkoutDate={data.lastWorkoutDate}
        />
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
                {data.latestWeight.value !== null ? (
                  <Text style={styles.bodyWeight}>
                    {data.latestWeight.value}{' '}
                    <Text style={styles.bodyWeightUnit}>{weightUnit}</Text>
                  </Text>
                ) : (
                  <Text style={styles.bodyWeight}>Measurements logged</Text>
                )}
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

const streakStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  streakBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    flex: 1,
  },
  streakNumber: {
    fontSize: 52,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -2,
    lineHeight: 56,
  },
  streakUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },
  streakUnitSub: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
    lineHeight: 18,
  },
  weeklyBlock: {
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  weeklyNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  weeklyLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
    textAlign: 'right',
    lineHeight: 15,
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563eb',
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  messageMuted: {
    color: '#94a3b8',
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  lastWorkout: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dotCell: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  dotActive: {
    backgroundColor: '#2563eb',
  },
  dotInactive: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  dotToday: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  dotLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#cbd5e1',
    letterSpacing: 0.2,
  },
  dotLabelActive: {
    color: '#2563eb',
  },
  dotLabelToday: {
    color: '#2563eb',
  },
});

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

  // ── Unfinished workout resume banner ──
  resumeBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fcd34d',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resumeBannerLeft: { flex: 1, marginRight: 12 },
  resumeBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 2,
  },
  resumeBannerSub: { fontSize: 12, color: '#b45309' },
  resumeBannerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  resumeDiscardBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcd34d',
    backgroundColor: '#fef3c7',
  },
  resumeDiscardText: { fontSize: 13, fontWeight: '600', color: '#92400e' },
  resumeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f59e0b',
  },
  resumeBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
