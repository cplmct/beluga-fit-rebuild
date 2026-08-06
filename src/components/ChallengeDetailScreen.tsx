import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'consistency' | 'volume' | 'pr' | 'streak' | 'duration';
  target_value: number;
  target_exercise_id: string | null;
  duration_days: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  is_active: boolean;
}

interface UserChallenge {
  id: string;
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  started_at: string;
  ends_at: string;
  completed_at: string | null;
  current_progress: number;
  target_value: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysRemaining(endsAt: string): number {
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000));
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const DIFFICULTY_STYLES: Record<
  'beginner' | 'intermediate' | 'advanced',
  { bg: string; text: string }
> = {
  beginner:     { bg: '#f0fdf4', text: '#16a34a' },
  intermediate: { bg: '#fff7ed', text: '#c2410c' },
  advanced:     { bg: '#fef2f2', text: '#dc2626' },
};

const TYPE_LABELS: Record<string, string> = {
  consistency: 'Consistency',
  volume:      'Volume',
  pr:          'Personal Record',
  streak:      'Streak',
  duration:    'Duration',
};

function progressLabel(
  type: Challenge['challenge_type'],
  current: number,
  target: number
): string {
  switch (type) {
    case 'consistency':
    case 'streak':
      return `${current} / ${target} workout${target === 1 ? '' : 's'}`;
    case 'volume':
      return `${current} / ${target} reps`;
    case 'duration':
      return `${current} / ${target} minutes`;
    case 'pr':
      return current >= 1 ? 'Achieved!' : '0 / 1';
    default:
      return `${current} / ${target}`;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DifficultyBadge({
  difficulty,
}: {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}) {
  const s = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.beginner;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Text>
    </View>
  );
}

function TypePill({ type }: { type: string }) {
  return (
    <View style={styles.typePill}>
      <Text style={styles.typePillText}>{TYPE_LABELS[type] ?? type}</Text>
    </View>
  );
}

function StatusPill({ uc }: { uc: UserChallenge }) {
  const isExpiredActive =
    uc.status === 'active' && new Date(uc.ends_at) <= new Date();

  if (uc.status === 'completed') {
    return (
      <View style={[styles.statusPill, { backgroundColor: '#f0fdf4' }]}>
        <Text style={[styles.statusPillText, { color: '#16a34a' }]}>COMPLETED ✓</Text>
      </View>
    );
  }
  if (uc.status === 'failed' || isExpiredActive) {
    return (
      <View style={[styles.statusPill, { backgroundColor: '#fef2f2' }]}>
        <Text style={[styles.statusPillText, { color: '#dc2626' }]}>
          {isExpiredActive ? 'EXPIRED' : 'FAILED'}
        </Text>
      </View>
    );
  }
  if (uc.status === 'abandoned') {
    return (
      <View style={[styles.statusPill, { backgroundColor: '#f8fafc' }]}>
        <Text style={[styles.statusPillText, { color: '#94a3b8' }]}>ABANDONED</Text>
      </View>
    );
  }

  // Active and not expired
  const days = daysRemaining(uc.ends_at);
  if (days === 0) {
    return (
      <View style={[styles.statusPill, { backgroundColor: '#fff7ed' }]}>
        <Text style={[styles.statusPillText, { color: '#c2410c' }]}>Last day!</Text>
      </View>
    );
  }
  return (
    <View style={[styles.statusPill, { backgroundColor: '#eff6ff' }]}>
      <Text style={[styles.statusPillText, { color: '#2563eb' }]}>
        {days} day{days === 1 ? '' : 's'} remaining
      </Text>
    </View>
  );
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
        backgroundColor: '#ebebeb',
      }}
    />
  );
}

function DetailSkeleton() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={{ alignItems: 'center', marginBottom: 20, gap: 12 }}>
        <SkeletonBlock width={60} height={60} radius={30} />
        <SkeletonBlock width={220} height={22} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SkeletonBlock width={80} height={24} radius={6} />
          <SkeletonBlock width={100} height={24} radius={6} />
        </View>
      </View>
      <SkeletonBlock width="100%" height={80} radius={12} />
      <View style={{ height: 16 }} />
      <SkeletonBlock width="100%" height={100} radius={12} />
      <View style={{ height: 16 }} />
      <SkeletonBlock width="100%" height={72} radius={12} />
      <View style={{ height: 24 }} />
      <SkeletonBlock width="100%" height={52} radius={12} />
    </ScrollView>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function ChallengeDetailScreen({ route }: any) {
  const { challengeId, challengeTitle } = route.params as {
    challengeId: string;
    challengeTitle: string;
  };
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userChallenge, setUserChallenge] = useState<UserChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [challengeId, user])
  );

  const fetchData = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [challengeRes, userChallengeRes] = await Promise.all([
        supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .maybeSingle(),
        supabase
          .from('user_challenges')
          .select('id, status, started_at, ends_at, completed_at, current_progress, target_value')
          .eq('user_id', user.id)
          .eq('challenge_id', challengeId)
          .maybeSingle(),
      ]);

      if (challengeRes.error) throw challengeRes.error;
      if (!challengeRes.data) { setNotFound(true); return; }
      if (userChallengeRes.error) throw userChallengeRes.error;

      setChallenge(challengeRes.data as Challenge);
      setUserChallenge(userChallengeRes.data as UserChallenge | null);
    } catch (err) {
      if (__DEV__) console.error('ChallengeDetailScreen:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Mutations ─────────────────────────────────────────────────────────────

  const joinOrReset = async () => {
    if (!user || !challenge || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const endsAt = addDays(challenge.duration_days);

      const { error } = await supabase
        .from('user_challenges')
        .upsert(
          {
            user_id: user.id,
            challenge_id: challenge.id,
            status: 'active',
            started_at: now,
            ends_at: endsAt,
            target_value: challenge.target_value,
            current_progress: 0,
            completed_at: null,
          },
          { onConflict: 'user_id,challenge_id' }
        );

      if (error) throw error;
      await fetchData();
    } catch (err) {
      if (__DEV__) console.error('ChallengeDetailScreen join/reset:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const abandon = async () => {
    if (!user || !userChallenge || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_challenges')
        .update({ status: 'abandoned' })
        .eq('id', userChallenge.id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      if (__DEV__) console.error('ChallengeDetailScreen abandon:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────

  if (loading) return <DetailSkeleton />;

  if (notFound || !challenge) {
    return (
      <View style={styles.centeredWrap}>
        <Text style={styles.notFoundTitle}>Challenge not found</Text>
        <Text style={styles.notFoundSub}>
          This challenge may no longer be available.
        </Text>
      </View>
    );
  }

  const diffStyle =
    DIFFICULTY_STYLES[challenge.difficulty] ?? DIFFICULTY_STYLES.beginner;

  const progress =
    userChallenge && userChallenge.target_value > 0
      ? Math.min(userChallenge.current_progress / userChallenge.target_value, 1)
      : 0;

  // ── Action button ─────────────────────────────────────────────────────────

  const renderActionButton = () => {
    if (isSubmitting) {
      return (
        <View style={[styles.actionButton, styles.actionButtonBlue]}>
          <ActivityIndicator color="#fff" />
        </View>
      );
    }

    if (!userChallenge) {
      // Not joined
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonBlue]}
          onPress={joinOrReset}
          activeOpacity={0.85}
        >
          <Text style={styles.actionButtonTextWhite}>Join Challenge</Text>
        </TouchableOpacity>
      );
    }

    switch (userChallenge.status) {
      case 'active':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonRedOutline]}
            onPress={abandon}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonTextRed}>Abandon Challenge</Text>
          </TouchableOpacity>
        );

      case 'completed':
        return (
          <View style={[styles.actionButton, styles.actionButtonGreenDisabled]}>
            <Text style={styles.actionButtonTextWhite}>Challenge Completed! 🎉</Text>
          </View>
        );

      case 'failed':
        return (
          <View style={{ gap: 12 }}>
            <View style={[styles.actionButton, styles.actionButtonGrey]}>
              <Text style={styles.actionButtonTextWhite}>Challenge Failed</Text>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonBlueOutline]}
              onPress={joinOrReset}
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonTextBlue}>Try Again</Text>
            </TouchableOpacity>
          </View>
        );

      case 'abandoned':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonBlueOutline]}
            onPress={joinOrReset}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonTextBlue}>Rejoin Challenge</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{challenge.icon}</Text>
        <Text style={styles.headerTitle}>{challenge.title}</Text>
        <View style={styles.headerBadgeRow}>
          <DifficultyBadge difficulty={challenge.difficulty} />
          <TypePill type={challenge.challenge_type} />
        </View>
      </View>

      {/* ── Description ── */}
      <View style={styles.card}>
        <Text style={styles.cardSectionLabel}>ABOUT THIS CHALLENGE</Text>
        <Text style={styles.descriptionText}>{challenge.description}</Text>
      </View>

      {/* ── Progress card (joined only) ── */}
      {userChallenge && (
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>YOUR PROGRESS</Text>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` as any }]}
            />
          </View>

          <Text style={styles.progressValueText}>
            {progressLabel(
              challenge.challenge_type,
              userChallenge.current_progress,
              userChallenge.target_value
            )}
          </Text>

          <View style={{ marginTop: 12 }}>
            <StatusPill uc={userChallenge} />
          </View>
        </View>
      )}

      {/* ── Stats row ── */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{challenge.duration_days}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{TYPE_LABELS[challenge.challenge_type] ?? challenge.challenge_type}</Text>
          <Text style={styles.statLabel}>Type</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: diffStyle.text }]}>
            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
          </Text>
          <Text style={styles.statLabel}>Difficulty</Text>
        </View>
      </View>

      {/* ── Action button ── */}
      <View style={styles.actionWrap}>
        {renderActionButton()}
      </View>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
  },
  centeredWrap: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  notFoundTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  notFoundSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Header ──
  header: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  headerIcon: {
    fontSize: 48,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  headerBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  // ── Badge / pill ──
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  typePill: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 0.2,
  },

  // ── Cards ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
  },
  cardSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },

  // ── Progress ──
  progressTrack: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    minWidth: 4,
  },
  progressValueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },

  // ── Status pill ──
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Stats row ──
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },

  // ── Action buttons ──
  actionWrap: {
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonBlue: {
    backgroundColor: '#2563eb',
  },
  actionButtonRedOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#dc2626',
  },
  actionButtonBlueOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2563eb',
  },
  actionButtonGreenDisabled: {
    backgroundColor: '#16a34a',
    opacity: 0.6,
  },
  actionButtonGrey: {
    backgroundColor: '#94a3b8',
  },
  actionButtonTextWhite: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionButtonTextRed: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  actionButtonTextBlue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
});
