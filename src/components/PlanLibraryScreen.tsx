import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  WORKOUT_PLANS,
  PLAN_CATEGORIES,
  PlanCategory,
  WorkoutPlan,
} from '../data/workoutPlans';

const FILTER_TABS: { key: 'all' | PlanCategory; label: string }[] = [
  { key: 'all',             label: 'All' },
  { key: 'beginner',        label: 'Beginner' },
  { key: 'weight-loss',     label: 'Weight Loss' },
  { key: 'muscle-gain',     label: 'Muscle Gain' },
  { key: 'strength',        label: 'Strength' },
  { key: 'general-fitness', label: 'General Fitness' },
  { key: 'home',            label: 'Home' },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     '#059669',
  Intermediate: '#d97706',
  Advanced:     '#dc2626',
};

const EQUIPMENT_SHORT: Record<string, string> = {
  'No Equipment':      'No equipment',
  'Minimal Equipment': 'Minimal equipment',
  'Full Gym':          'Full gym',
};

function PlanCard({
  plan,
  onPress,
}: {
  plan: WorkoutPlan;
  onPress: () => void;
}) {
  const cat = PLAN_CATEGORIES[plan.category];
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={[styles.cardAccent, { backgroundColor: cat.color }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
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

        <Text style={styles.cardTitle}>{plan.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {plan.description}
        </Text>

        <View style={styles.cardMeta}>
          <Text style={styles.metaItem}>{plan.durationWeeks}w</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaItem}>
            {plan.workoutsPerWeek}x / week
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaItem}>
            {EQUIPMENT_SHORT[plan.equipmentLevel]}
          </Text>
        </View>
      </View>

      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

export function PlanLibraryScreen({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState<'all' | PlanCategory>('all');

  const filtered =
    activeFilter === 'all'
      ? WORKOUT_PLANS
      : WORKOUT_PLANS.filter((p) => p.category === activeFilter);

  return (
    <View style={styles.container}>
      {/* Category filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const color =
            tab.key === 'all'
              ? '#2563eb'
              : PLAN_CATEGORIES[tab.key as PlanCategory].color;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Plan list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.countLabel}>
          {filtered.length} {filtered.length === 1 ? 'plan' : 'plans'}
        </Text>

        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconRing}>
              <View style={styles.emptyIconDot} />
            </View>
            <Text style={styles.emptyTitle}>No plans in this category</Text>
            <Text style={styles.emptyText}>
              Try a different filter to find a plan that suits your goals.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setActiveFilter('all')}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyButtonText}>Show All Plans</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onPress={() =>
                navigation.navigate('PlanDetail', { planId: plan.id })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },

  // ── Tabs ──
  tabsScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },

  // ── List ──
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  countLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  // ── Card ──
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  difficultyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItem: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  cardArrow: {
    fontSize: 22,
    color: '#cbd5e1',
    paddingRight: 14,
  },

  // ── Empty filter state ──
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyIconDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#cbd5e1',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
