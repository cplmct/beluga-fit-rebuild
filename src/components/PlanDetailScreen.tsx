import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getPlanById,
  PLAN_CATEGORIES,
  PlanDay,
} from '../data/workoutPlans';
import {
  getActivePlan,
  setActivePlan,
  clearActivePlan,
  getWeekNumber,
  ActivePlanState,
} from '../utils/activePlan';
import { useAuth } from '../contexts/AuthContext';

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     '#059669',
  Intermediate: '#d97706',
  Advanced:     '#dc2626',
};

function DayAccordion({ day, index }: { day: PlanDay; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <View style={styles.dayCard}>
      <TouchableOpacity
        style={styles.dayHeader}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <View style={styles.dayHeaderLeft}>
          <View style={styles.dayIndexBadge}>
            <Text style={styles.dayIndexText}>{index + 1}</Text>
          </View>
          <View>
            <Text style={styles.dayLabel}>{day.label}</Text>
            <Text style={styles.dayTitle}>{day.title}</Text>
          </View>
        </View>
        <View style={styles.dayHeaderRight}>
          <Text style={styles.dayFocus}>{day.focus}</Text>
          <Text style={styles.dayChevron}>{open ? '˅' : '›'}</Text>
        </View>
      </TouchableOpacity>

      {open && (
        <View style={styles.dayBody}>
          {day.exercises.map((ex, i) => (
            <View
              key={i}
              style={[
                styles.exerciseRow,
                i < day.exercises.length - 1 && styles.exerciseRowBorder,
              ]}
            >
              <View style={styles.exerciseLeft}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {ex.equipment}
                  {ex.notes ? `  ·  ${ex.notes}` : ''}
                </Text>
              </View>
              <View style={styles.exerciseRight}>
                <Text style={styles.exerciseSets}>{ex.sets} × {ex.reps}</Text>
                <Text style={styles.exerciseBodyPart}>{ex.bodyPart}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function PlanDetailScreen({ route, navigation }: any) {
  const { planId } = route.params;
  const plan = getPlanById(planId);
  const { user } = useAuth();

  const [activePlan, setActivePlanState] = useState<ActivePlanState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const ap = user ? await getActivePlan(user.id) : null;
        setActivePlanState(ap);
        setLoading(false);
      })();
    }, [user?.id])
  );

  if (!plan) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconRing}>
          <View style={styles.errorIconDot} />
        </View>
        <Text style={styles.errorTitle}>This plan isn't available</Text>
        <Text style={styles.errorSub}>
          The plan you're looking for couldn't be found. Browse available plans to find one that fits.
        </Text>
        {navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.errorButtonText}>Browse Plans</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const cat = PLAN_CATEGORIES[plan.category];
  const isThisPlanActive = activePlan?.planId === plan.id;
  const isOtherPlanActive = activePlan !== null && !isThisPlanActive;
  const weekNumber = isThisPlanActive
    ? getWeekNumber(activePlan.startDate)
    : null;

  const handleStartPlan = async () => {
    if (isOtherPlanActive) {
      Alert.alert(
        'Switch Plans',
        'You already have an active plan. Starting this plan will replace it. Your workout history will not be affected.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch Plan',
            style: 'destructive',
            onPress: () => confirmStartPlan(),
          },
        ]
      );
      return;
    }
    confirmStartPlan();
  };

  const confirmStartPlan = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setActivePlan(user.id, plan.id);
      setActivePlanState({ planId: plan.id, startDate: new Date().toISOString() });
    } finally {
      setSaving(false);
    }
  };

  const handleStopPlan = () => {
    Alert.alert(
      'Stop Plan',
      'Remove this plan as your active plan? Your workout history will not be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Plan',
          style: 'destructive',
          onPress: async () => {
            if (user) await clearActivePlan(user.id);
            setActivePlanState(null);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={[styles.planHeader, { borderTopColor: cat.color }]}>
          <View style={styles.planHeaderTop}>
            <View style={[styles.categoryBadge, { backgroundColor: cat.accent }]}>
              <Text style={[styles.categoryBadgeText, { color: cat.color }]}>
                {cat.label}
              </Text>
            </View>
            <Text
              style={[
                styles.difficultyLabel,
                { color: DIFFICULTY_COLOR[plan.difficulty] },
              ]}
            >
              {plan.difficulty}
            </Text>
          </View>

          <Text style={styles.planTitle}>{plan.title}</Text>

          {isThisPlanActive && weekNumber !== null && (
            <View style={[styles.activeBanner, { backgroundColor: cat.accent }]}>
              <View style={[styles.activeDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.activeBannerText, { color: cat.color }]}>
                Active plan — Week {weekNumber} of {plan.durationWeeks}
              </Text>
            </View>
          )}
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{plan.durationWeeks}</Text>
            <Text style={styles.statLabel}>Weeks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{plan.workoutsPerWeek}</Text>
            <Text style={styles.statLabel}>Days / week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{plan.days.length}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
        </View>

        {/* ── Equipment ── */}
        <View style={styles.equipmentRow}>
          <Text style={styles.equipmentLabel}>Equipment</Text>
          <Text style={styles.equipmentValue}>{plan.equipmentLevel}</Text>
        </View>

        {/* ── Description ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT THIS PLAN</Text>
          <Text style={styles.description}>{plan.description}</Text>
        </View>

        {/* ── Workout Days ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WORKOUT SCHEDULE</Text>
          <Text style={styles.scheduleNote}>
            {plan.workoutsPerWeek} training days per week · rest on remaining days
          </Text>
          <View style={styles.daysContainer}>
            {plan.days.map((day, index) => (
              <DayAccordion key={index} day={day} index={index} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Footer CTA ── */}
      <View style={styles.footer}>
        {isThisPlanActive ? (
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopPlan}
              activeOpacity={0.85}
            >
              <Text style={styles.stopButtonText}>Stop Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.workoutButton}
              onPress={() =>
                navigation.navigate('StartWorkout')
              }
              activeOpacity={0.85}
            >
              <Text style={styles.workoutButtonText}>Start a Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: cat.color }, saving && styles.buttonDisabled]}
            onPress={handleStartPlan}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.startButtonText}>
                {isOtherPlanActive ? 'Switch to This Plan' : 'Start This Plan'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fc',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // ── Plan header ──
  planHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 16,
  },
  planHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  difficultyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  planTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginTop: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeBannerText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Stats ──
  statsRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },

  // ── Equipment ──
  equipmentRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  equipmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  equipmentValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },

  // ── Section ──
  section: {
    paddingHorizontal: 20,
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
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  scheduleNote: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
    fontWeight: '400',
  },

  // ── Day accordion ──
  daysContainer: {
    gap: 10,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dayIndexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayIndexText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  dayHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dayFocus: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'right',
    maxWidth: 100,
  },
  dayChevron: {
    fontSize: 18,
    color: '#cbd5e1',
  },

  // ── Exercise rows ──
  dayBody: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  exerciseRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  exerciseLeft: {
    flex: 1,
    paddingRight: 12,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '400',
  },
  exerciseRight: {
    alignItems: 'flex-end',
  },
  exerciseSets: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 2,
  },
  exerciseBodyPart: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // ── Footer ──
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 20,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    borderRadius: 14,
    padding: 17,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stopButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  workoutButton: {
    flex: 2,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    padding: 17,
    alignItems: 'center',
  },
  workoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Not found error ──
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
    backgroundColor: '#f7f8fc',
  },
  errorIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorIconDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#cbd5e1',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  errorButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  errorButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
});
