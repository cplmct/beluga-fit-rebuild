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
  bodyPart: string;
  weight: number;
  date: string;
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

      // Step 1 — get the current user's session IDs and date map.
      const { data: sessionRows, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('id, started_at')
        .eq('user_id', user.id);

      if (sessionsError) throw sessionsError;

      const idDateMap: Record<string, string> = {};
      for (const s of sessionRows ?? []) idDateMap[s.id] = s.started_at;
      const sessionIds = Object.keys(idDateMap);

      if (sessionIds.length === 0) {
        setRecords([]);
        return;
      }

      // Step 2 — fetch exercises + sets for those sessions.
      // Guard to 500 IDs to stay within PostgREST URL limits (same as StatsScreen).
      const { data: exerciseRows, error: prError } = await supabase
        .from('session_exercises')
        .select(
          'session_id, exercises(name, exercise_muscle_groups(muscle_groups(name))), session_sets(weight_kg, is_pr)'
        )
        .in('session_id', sessionIds.slice(0, 500));

      if (prError) throw prError;

      // Flatten to one row per PR'd set, since is_pr/weight now live on session_sets.
      const prRows: Array<{
        exercise_name: string;
        body_part: string;
        weight: number;
        session_id: string;
      }> = [];
      for (const ex of exerciseRows ?? []) {
        const name = (ex as any).exercises?.name;
        if (!name) continue;
        const bodyPart =
          (ex as any).exercises?.exercise_muscle_groups?.[0]?.muscle_groups?.name ?? '';
        for (const s of (ex as any).session_sets ?? []) {
          if (s.is_pr === true && s.weight_kg !== null && s.weight_kg > 0) {
            prRows.push({
              exercise_name: name,
              body_part: bodyPart,
              weight: s.weight_kg,
              session_id: (ex as any).session_id,
            });
          }
        }
      }

      // Step 3 — client-side grouping: keep the highest weight per
      // (exercise_name, body_part) pair, tracking the date of that best row.
      const bestMap: Record<string, { weight: number; bodyPart: string; date: string }> = {};
      for (const row of prRows ?? []) {
        const key = `${row.exercise_name}||${row.body_part}`;
        const rowDate = idDateMap[row.session_id] ?? '';
        if (!bestMap[key] || row.weight > bestMap[key].weight) {
          bestMap[key] = { weight: row.weight, bodyPart: row.body_part, date: rowDate };
        }
      }

      const sorted: PRRecord[] = Object.entries(bestMap)
        .map(([key, val]) => ({
          exerciseName: key.split('||')[0],
          bodyPart: val.bodyPart,
          weight: val.weight,
          date: val.date,
        }))
        .sort(
          (a, b) =>
            a.bodyPart.localeCompare(b.bodyPart) ||
            a.exerciseName.localeCompare(b.exerciseName)
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
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.bodyPartChip}>
          <Text style={styles.bodyPartText}>{item.bodyPart}</Text>
        </View>
        <View style={styles.weightChip}>
          <Text style={styles.weightText}>🏆 {item.weight} {weightUnit}</Text>
        </View>
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
        keyExtractor={(item) => `${item.exerciseName}||${item.bodyPart}`}
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
