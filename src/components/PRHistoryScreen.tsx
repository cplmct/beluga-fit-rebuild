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
import { useUnits } from '../contexts/UnitsContext';

interface PRRecord {
  exerciseName: string;
  bodyPart: string;        // primary muscle group name ('' if not seeded yet)
  maxWeight: number | null; // null if no weight PR exists for this exercise
  maxReps: number | null;   // null if no reps PR exists for this exercise
  achievedAt: string;       // most recent of the two achieved_at dates
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
        backgroundColor: '#f1f5f9',
      }}
    />
  );
}

function PRCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <SkeletonBlock width={180} height={15} />
        <SkeletonBlock width={90} height={13} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <SkeletonBlock width={60} height={24} radius={6} />
        <SkeletonBlock width={80} height={24} radius={6} />
      </View>
    </View>
  );
}

export function PRHistoryScreen() {
  const { user } = useAuth();
  const { weightUnit } = useUnits();

  const [records, setRecords] = useState<PRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [])
  );

  const fetchRecords = async () => {
    try {
      if (!user) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setError('');

      const { data: prRows, error: prError } = await supabase
        .from('personal_records')
        .select(`
          id,
          record_type,
          value,
          achieved_at,
          exercises (
            id,
            name,
            exercise_muscle_groups (
              muscle_groups ( name ),
              is_primary
            )
          )
        `)
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false });

      if (prError) throw prError;

      // Group by exercise_id — one PRRecord card per exercise
      const grouped: Record<
        string,
        {
          exerciseName: string;
          bodyPart: string;
          maxWeight: number | null;
          maxReps: number | null;
          achievedAt: string;
        }
      > = {};

      for (const row of prRows ?? []) {
        const ex = (row as any).exercises;
        if (!ex) continue;
        const exId: string = ex.id;
        const exerciseName: string = ex.name;

        // Primary muscle group name ('' if exercise_muscle_groups not yet seeded)
        const primaryMg = (ex.exercise_muscle_groups ?? []).find(
          (mg: any) => mg.is_primary === true
        );
        const bodyPart: string = primaryMg?.muscle_groups?.name ?? '';

        if (!grouped[exId]) {
          grouped[exId] = {
            exerciseName,
            bodyPart,
            maxWeight: null,
            maxReps: null,
            achievedAt: row.achieved_at,
          };
        }

        // Keep most recent achieved_at across both record types for this exercise
        if (row.achieved_at > grouped[exId].achievedAt) {
          grouped[exId].achievedAt = row.achieved_at;
        }

        if (row.record_type === 'max_weight') grouped[exId].maxWeight = row.value;
        if (row.record_type === 'max_reps')   grouped[exId].maxReps   = row.value;
      }

      // Sort by achievedAt descending (most recent PR first)
      const sorted: PRRecord[] = Object.values(grouped).sort(
        (a, b) => b.achievedAt.localeCompare(a.achievedAt)
      );

      setRecords(sorted);
    } catch (err: any) {
      setError(
        'Something went wrong loading your records. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const renderItem = ({ item }: { item: PRRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.exerciseName}>{item.exerciseName}</Text>
        <Text style={styles.dateText}>{formatDate(item.achievedAt)}</Text>
      </View>
      <View style={styles.cardBottom}>
        {item.bodyPart ? (
          <View style={styles.bodyPartChip}>
            <Text style={styles.bodyPartText}>{item.bodyPart}</Text>
          </View>
        ) : null}
        {item.maxWeight !== null && (
          <View style={styles.weightChip}>
            <Text style={styles.weightText}>🏆 {item.maxWeight} {weightUnit}</Text>
          </View>
        )}
        {item.maxReps !== null && (
          <View style={styles.repsChip}>
            <Text style={styles.repsText}>🔁 {item.maxReps} reps</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.listContent}>
          {[0, 1, 2, 3, 4].map((i) => (
            <PRCardSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <View style={[styles.iconRing, { borderColor: '#fecaca' }]}>
            <View style={[styles.iconDot, { backgroundColor: '#dc2626' }]} />
          </View>
          <Text style={styles.emptyTitle}>Couldn't load your records</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => { setLoading(true); fetchRecords(); }}
            activeOpacity={0.85}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <View style={[styles.iconRing, { borderColor: '#e2e8f0' }]}>
            <View style={[styles.iconDot, { backgroundColor: '#cbd5e1' }]} />
          </View>
          <Text style={styles.emptyTitle}>No personal records yet</Text>
          <Text style={styles.emptySub}>
            Complete workouts with a logged weight to set your first records.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.exerciseName}
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
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    flexShrink: 0,
  },
  cardBottom: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
  weightChip: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  weightText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '700',
  },
  repsChip: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  repsText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '700',
  },

  // ── Empty / Error ──
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  iconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconDot: {
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
