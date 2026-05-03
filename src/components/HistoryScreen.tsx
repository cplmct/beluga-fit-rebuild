import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WorkoutSummary {
  id: string;
  date: string;
  body_parts: string[];
  exercise_count: number;
  duration_seconds: number | null;
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `<1m`;
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

function WorkoutCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonBlock width={170} height={15} />
        <SkeletonBlock width={80} height={13} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <SkeletonBlock width={72} height={26} radius={8} />
        <SkeletonBlock width={56} height={26} radius={8} />
        <SkeletonBlock width={84} height={26} radius={8} />
      </View>
    </View>
  );
}

function EmptyIcon({ color = '#cbd5e1' }: { color?: string }) {
  return (
    <View
      style={[
        styles.emptyIconRing,
        { borderColor: color === '#cbd5e1' ? '#e2e8f0' : '#fecaca' },
      ]}
    >
      <View style={[styles.emptyIconDot, { backgroundColor: color }]} />
    </View>
  );
}

export function HistoryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [])
  );

  const fetchWorkouts = async () => {
    try {
      if (!user) return;
      setError('');

      const { data: workoutsData, error: queryError } = await supabase
        .from('workouts')
        .select('id, date, body_parts, duration_seconds, workout_exercises(count)')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (queryError) throw queryError;

      const mapped: WorkoutSummary[] = (workoutsData || []).map((w: any) => ({
        id: w.id,
        date: w.date,
        body_parts: w.body_parts || [],
        duration_seconds: w.duration_seconds ?? null,
        exercise_count: w.workout_exercises?.[0]?.count || 0,
      }));

      setWorkouts(mapped);
    } catch (err: any) {
      setError(
        'Something went wrong loading your history. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderWorkoutItem = ({ item }: { item: WorkoutSummary }) => {
    const durationLabel = formatDuration(item.duration_seconds);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}
        activeOpacity={0.82}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
          <View style={styles.cardMeta}>
            {durationLabel && (
              <Text style={styles.cardDuration}>{durationLabel}</Text>
            )}
            <Text style={styles.cardCount}>
              {item.exercise_count}{' '}
              {item.exercise_count === 1 ? 'exercise' : 'exercises'}
            </Text>
          </View>
        </View>
        {item.body_parts.length > 0 && (
          <View style={styles.tagsRow}>
            {item.body_parts.map((part) => (
              <View key={part} style={styles.tag}>
                <Text style={styles.tagText}>{part}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.listContent}>
          {[0, 1, 2, 3].map((i) => (
            <WorkoutCardSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <EmptyIcon color="#dc2626" />
          <Text style={styles.emptyTitle}>Couldn't load your history</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setLoading(true);
              fetchWorkouts();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (workouts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <EmptyIcon />
          <Text style={styles.emptyTitle}>No workouts logged yet</Text>
          <Text style={styles.emptySub}>
            Your training history will appear here once you start logging workouts.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Workout', { screen: 'StartWorkout' })}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Start a Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  listContent: {
    padding: 20,
    paddingBottom: 48,
  },

  // ── Cards ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  cardMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  cardDuration: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  cardCount: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  tagText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },

  // ── Empty / Error ──
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
});
