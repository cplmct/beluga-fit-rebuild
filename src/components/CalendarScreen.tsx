import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
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

export function CalendarScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<any>({});
  const [workoutsForDate, setWorkoutsForDate] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);

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
        const { count, error } = await supabase
          .from('workout_exercises')
          .select('*', { count: 'exact', head: true })
          .eq('workout_id', workout.id);

        return {
          id: workout.id,
          date: workout.date,
          body_parts: workout.body_parts,
          exercise_count: count || 0,
        };
      })
    );

    const marked: any = {};
    workoutsWithCounts.forEach((workout: WorkoutSummary) => {
      const dateKey = workout.date.split('T')[0];
      marked[dateKey] = {
        marked: true,
        dotColor: '#3b82f6',
      };
    });

    setMarkedDates(marked);
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching workouts:', error);
    }
  } finally {
    setLoading(false);
  }
};
  
const handleDayPress = async (day: any) => {
  setSelectedDate(day.dateString);

  try {
    if (!user) return;

    const startDate = new Date(day.dateString);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(day.dateString);
    endDate.setHours(23, 59, 59, 999);

    const workoutsData = await safeQuery<Array<{id: string; date: string; body_parts: string[]}>>(
      supabase
        .from('workouts')
        .select('id, date, body_parts')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: false })
    );

    const workoutsWithCounts = await Promise.all(
      (workoutsData || []).map(async (workout: {id: string; date: string; body_parts: string[]}) => {
        const { count } = await supabase
          .from('workout_exercises')
          .select('*', { count: 'exact', head: true })
          .eq('workout_id', workout.id);

        return {
          id: workout.id,
          date: workout.date,
          body_parts: workout.body_parts,
          exercise_count: count || 0,
        };
      })
    );

    setWorkoutsForDate(workoutsWithCounts);
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching workouts for date:', error);
    }
    setWorkoutsForDate([]);
  }
};
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderWorkoutItem = ({ item }: { item: WorkoutSummary }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}
    >
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutTime}>{formatTime(item.date)}</Text>
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

  const updatedMarkedDates = {
    ...markedDates,
    ...(selectedDate && {
      [selectedDate]: {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: '#3b82f6',
      },
    }),
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={updatedMarkedDates}
        onDayPress={handleDayPress}
        theme={{
          todayTextColor: '#3b82f6',
          selectedDayBackgroundColor: '#3b82f6',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#3b82f6',
          monthTextColor: '#1f2937',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
        }}
      />

      <View style={styles.workoutsSection}>
        {selectedDate ? (
          <>
            <Text style={styles.sectionTitle}>
              Workouts on {new Date(selectedDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            {workoutsForDate.length > 0 ? (
              <FlatList
                data={workoutsForDate}
                renderItem={renderWorkoutItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No workouts on this day</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Select a date to view workouts</Text>
          </View>
        )}
      </View>
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
  workoutsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
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
  workoutTime: {
    fontSize: 16,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
