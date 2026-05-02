import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { safeQuery } from '../lib/safeSupabase';
import { useAuth } from '../contexts/AuthContext';

interface WorkoutSummary {
  id: string;
  date: string;
  body_parts: string[];
  exercise_count: number;
}

export function HistoryScreen({ navigation }: any) {
  const { user } = useAuth();   // ✅ ADD IT HERE
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [])
  );

  const fetchWorkouts = async () => {
    try {
      if (!user) return;

     const workoutsData = await safeQuery<Array<{id: string; date: string; body_parts: string[]}>>(
  supabase
    .from('workouts')
    .select('id, date, body_parts')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
);

      const workoutsWithCounts = await Promise.all(
        (workoutsData || []).map(async (workout: {id: string; date: string; body_parts: string[]}) => {
          const countResult = await safeQuery<{ count: number }>(
  supabase
    .from('workout_exercises')
    .select('*', { count: 'exact', head: true })
    .eq('workout_id', workout.id)
);
          return {
            id: workout.id,
            date: workout.date,
            body_parts: workout.body_parts,
            exercise_count: (countResult as any)?.count || 0,
          };
        })
      );

      setWorkouts(workoutsWithCounts);
    } catch (error) {
      if (__DEV__) {
        console.error('Error fetching workouts:', error);
      }
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderWorkoutItem = ({ item }: { item: WorkoutSummary }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}
    >
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutDate}>{formatDate(item.date)}</Text>
        <Text style={styles.exerciseCount}>{item.exercise_count} exercises</Text>
      </View>
      <View style={styles.bodyPartsContainer}>
        {item.body_parts.map((part) => (
          <View key={part} style={styles.bodyPartTag}>
            <Text style={styles.bodyPartText}>{part}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (workouts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Workouts Yet</Text>
        <Text style={styles.emptyText}>Start working out to see your history here!</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  bodyPartsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bodyPartTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  bodyPartText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});
