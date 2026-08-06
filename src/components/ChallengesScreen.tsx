import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface ActiveUserChallenge {
  id: string;
  current_progress: number;
  target_value: number;
  ends_at: string;
  challenges: {
    title: string;
    icon: string;
    challenge_type: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

interface AvailableChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_days: number;
  icon: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysRemaining(endsAt: string): number {
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000));
}

const DIFFICULTY_STYLES: Record<
  'beginner' | 'intermediate' | 'advanced',
  { bg: string; text: string }
> = {
  beginner:     { bg: '#f0fdf4', text: '#16a34a' },
  intermediate: { bg: '#fff7ed', text: '#c2410c' },
  advanced:     { bg: '#fef2f2', text: '#dc2626' },
};

function DifficultyBadge({ difficulty }: { difficulty: 'beginner' | 'intermediate' | 'advanced' }) {
  const s = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.beginner;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Text>
    </View>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

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

function ChallengesSkeleton() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SkeletonBlock width={140} height={11} radius={4} />
      <View style={{ height: 10 }} />
      {[0, 1].map((i) => (
        <View key={i} style={[styles.activeCard, { marginBottom: 12 }]}>
          <View style={styles.activeAccent} />
          <View style={{ flex: 1, padding: 14, gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SkeletonBlock width={180} height={15} />
              <SkeletonBlock width={70} height={20} radius={6} />
            </View>
            <SkeletonBlock width="100%" height={6} radius={3} />
            <SkeletonBlock width={120} height={11} />
          </View>
        </View>
      ))}
      <View style={{ height: 16 }} />
      <SkeletonBlock width={160} height={11} radius={4} />
      <View style={{ height: 10 }} />
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.availableCard, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <SkeletonBlock width={180} height={15} />
            <SkeletonBlock width={70} height={20} radius={6} />
          </View>
          <SkeletonBlock width="90%" height={11} />
          <View style={{ height: 6 }} />
          <SkeletonBlock width={80} height={11} />
        </View>
      ))}
    </ScrollView>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function ChallengesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [activeChallenges, setActiveChallenges] = useState<ActiveUserChallenge[]>([]);
  const [available, setAvailable] = useState<AvailableChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchChallenges();
    }, [user])
  );

  const fetchChallenges = async () => {
    if (!user) { setLoading(false); return; }
    setError('');

    try {
      const [activeRes, catalogueRes, joinedRes] = await Promise.all([
        // Query 1 — user's active challenges (not yet expired)
        supabase
          .from('user_challenges')
          .select('id, current_progress, target_value, ends_at, challenges(title, icon, challenge_type, difficulty)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('ends_at', new Date().toISOString())
          .order('ends_at', { ascending: true }),

        // Query 2 — full challenges catalogue
        supabase
          .from('challenges')
          .select('id, title, description, difficulty, duration_days, icon')
          .eq('is_active', true)
          .order('difficulty'),

        // Query 3 — all challenge IDs user has ever joined (any status)
        supabase
          .from('user_challenges')
          .select('challenge_id')
          .eq('user_id', user.id),
      ]);

      if (activeRes.error) throw activeRes.error;
      if (catalogueRes.error) throw catalogueRes.error;
      if (joinedRes.error) throw joinedRes.error;

      const joinedIds = new Set((joinedRes.data || []).map((r: any) => r.challenge_id));

      const availableFiltered = (catalogueRes.data || []).filter(
        (c: AvailableChallenge) => !joinedIds.has(c.id)
      );

      setActiveChallenges((activeRes.data || []) as unknown as ActiveUserChallenge[]);
      setAvailable(availableFiltered as AvailableChallenge[]);
    } catch (err: any) {
      if (__DEV__) console.error('ChallengesScreen:', err);
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChallenges();
  };

  // ── Render states ─────────────────────────────────────────────────────────

  if (loading) return <ChallengesSkeleton />;

  if (error) {
    return (
      <View style={styles.centeredWrap}>
        <Text style={styles.errorTitle}>Couldn't load challenges</Text>
        <Text style={styles.errorSub}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => { setLoading(true); fetchChallenges(); }}
          activeOpacity={0.85}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3b82f6"
          colors={['#3b82f6']}
        />
      }
    >
      {/* ── My Active Challenges ── */}
      <Text style={styles.sectionLabel}>MY ACTIVE CHALLENGES</Text>

      {activeChallenges.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No active challenges</Text>
          <Text style={styles.emptySub}>
            Browse available challenges below and join one to get started.
          </Text>
        </View>
      ) : (
        activeChallenges.map((uc) => {
          const ch = uc.challenges;
          const progress = uc.target_value > 0
            ? Math.min(uc.current_progress / uc.target_value, 1)
            : 0;
          const days = daysRemaining(uc.ends_at);

          return (
            <TouchableOpacity
              key={uc.id}
              style={styles.activeCard}
              onPress={() =>
                navigation.navigate('ChallengeDetail', {
                  challengeId: uc.id,
                  challengeTitle: ch.title,
                })
              }
              activeOpacity={0.82}
            >
              <View style={styles.activeAccent} />
              <View style={styles.activeBody}>
                <View style={styles.cardTopRow}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardIcon}>{ch.icon}</Text>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {ch.title}
                    </Text>
                  </View>
                  <DifficultyBadge difficulty={ch.difficulty} />
                </View>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                </View>

                <Text style={styles.progressLabel}>
                  {uc.current_progress} / {uc.target_value}
                  {'  ·  '}
                  {days === 0 ? 'Last day!' : `${days} day${days === 1 ? '' : 's'} left`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      <View style={styles.sectionSpacer} />

      {/* ── Available Challenges ── */}
      <Text style={styles.sectionLabel}>AVAILABLE CHALLENGES</Text>

      {available.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No new challenges available</Text>
          <Text style={styles.emptySub}>
            You've joined all active challenges. Check back later for new ones.
          </Text>
        </View>
      ) : (
        available.map((ch) => (
          <TouchableOpacity
            key={ch.id}
            style={styles.availableCard}
            onPress={() =>
              navigation.navigate('ChallengeDetail', {
                challengeId: ch.id,
                challengeTitle: ch.title,
              })
            }
            activeOpacity={0.82}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardIcon}>{ch.icon}</Text>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {ch.title}
                </Text>
              </View>
              <DifficultyBadge difficulty={ch.difficulty} />
            </View>

            <Text style={styles.availableDescription} numberOfLines={2}>
              {ch.description}
            </Text>

            <View style={styles.availableFooter}>
              <Text style={styles.availableDuration}>
                {ch.duration_days} day{ch.duration_days === 1 ? '' : 's'}
              </Text>
              <Text style={styles.availableChevron}>›</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
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
  },
  centeredWrap: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  // ── Section labels ──
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionSpacer: { height: 24 },

  // ── Difficulty badge ──
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Card shared ──
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    lineHeight: 20,
  },

  // ── Active challenge card ──
  activeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
  },
  activeAccent: {
    width: 3,
    backgroundColor: '#3b82f6',
    alignSelf: 'stretch',
  },
  activeBody: {
    flex: 1,
    padding: 14,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 3,
    minWidth: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },

  // ── Available challenge card ──
  availableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  availableDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 10,
  },
  availableFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableDuration: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  availableChevron: {
    fontSize: 20,
    color: '#cbd5e1',
  },

  // ── Empty state ──
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── Error state ──
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
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
});
