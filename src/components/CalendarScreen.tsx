import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WorkoutSummary {
  id: string;
  date: string;
  body_parts: string[];
  exercise_count: number;
}

function toLocalDateKey(isoString: string): string {
  const d = new Date(isoString);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

type CalendarStackParamList = {
  CalendarMain: undefined;
  WorkoutDetails: { workoutId: string };
};

type CalendarScreenNavigationProp = NativeStackNavigationProp<CalendarStackParamList, 'CalendarMain'>;

interface CalendarScreenProps {
  navigation: CalendarScreenNavigationProp;
}

export function CalendarScreen({ navigation }: CalendarScreenProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<Record<string, { marked?: boolean; dotColor?: string; selected?: boolean }>>({});
  const [workoutsForDate, setWorkoutsForDate] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayLoading, setDayLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [])
  );

  const fetchWorkouts = async () => {
    try {
      if (!user) return;

      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('id, date, body_parts, workout_exercises(count)')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (__DEV__)
        console.log(
          '[CalendarScreen] fetchWorkouts raw count:',
          (workoutsData || []).length,
        );

      const marked: Record<string, { marked: boolean; dotColor: string }> = {};
      (workoutsData || []).forEach((workout) => {
        const dateKey = toLocalDateKey(workout.date);
        marked[dateKey] = { marked: true, dotColor: '#2563eb' };
      });

      setMarkedDates(marked);
    } catch (err) {
      if (__DEV__) console.error('CalendarScreen:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = async (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setDayLoading(true);

    try {
      if (!user) return;

      if (__DEV__)
        console.log('[CalendarScreen] handleDayPress selectedDate:', day.dateString);

      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('id, date, body_parts, workout_exercises(count)')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (__DEV__)
        console.log(
          '[CalendarScreen] handleDayPress raw workouts:',
          (workoutsData || []).map((w) => ({
            id: w.id,
            stored: w.date,
            localKey: toLocalDateKey(w.date),
          })),
        );

      const workoutsWithCounts: WorkoutSummary[] = (workoutsData || [])
        .filter((w) => toLocalDateKey(w.date) === day.dateString)
        .map((w) => ({
          id: w.id,
          date: w.date,
          body_parts: w.body_parts || [],
          exercise_count: w.workout_exercises?.[0]?.count || 0,
        }));

      if (__DEV__)
        console.log(
          '[CalendarScreen] handleDayPress filtered count:',
          workoutsWithCounts.length,
        );

      setWorkoutsForDate(workoutsWithCounts);
    } catch (err) {
      if (__DEV__) console.error('CalendarScreen day press:', err);
      setWorkoutsForDate([]);
    } finally {
      setDayLoading(false);
    }
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatSelectedDate = (dateString: string) => {
    const [y, m, d] = dateString.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderWorkoutItem = ({ item }: { item: WorkoutSummary }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}
      activeOpacity={0.82}
    >
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutTime}>{formatTime(item.date)}</Text>
        <Text style={styles.exerciseCount}>
          {item.exercise_count}{' '}
          {item.exercise_count === 1 ? 'exercise' : 'exercises'}
        </Text>
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

  const updatedMarkedDates = {
    ...markedDates,
    ...(selectedDate && {
      [selectedDate]: {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: '#2563eb',
      },
    }),
  };

  const renderDatePanel = () => {
    if (!selectedDate) {
      if (!loading && Object.keys(markedDates).length === 0) {
        return (
          <View style={styles.dayEmptyWrap}>
            <Text style={styles.dayEmptyTitle}>No workouts logged yet</Text>
            <Text style={styles.dayEmptySub}>
              Your training history will appear here once you start logging sessions.
            </Text>
            <TouchableOpacity
              style={styles.logButton}
              onPress={() => (navigation as any).navigate('Workout', { screen: 'StartWorkout' })}
              activeOpacity={0.85}
            >
              <Text style={styles.logButtonText}>Log a Workout</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <View style={styles.promptWrap}>
          <View style={styles.promptLine} />
          <Text style={styles.promptText}>Select a day to view your workouts</Text>
          <View style={styles.promptLine} />
        </View>
      );
    }

    if (dayLoading) {
      return (
        <View style={styles.dayLoadingWrap}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      );
    }

    return (
      <>
        <View style={styles.dateLabelRow}>
          <Text style={styles.dateLabel}>{formatSelectedDate(selectedDate)}</Text>
          {markedDates[selectedDate] && <View style={styles.workoutDot} />}
        </View>

        {workoutsForDate.length > 0 ? (
          <FlatList
            data={workoutsForDate}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.dayListContent}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.dayEmptyWrap}>
            <Text style={styles.dayEmptyTitle}>No workouts on this day</Text>
            <Text style={styles.dayEmptySub}>
              Rest days are part of the plan too. Log a workout any time.
            </Text>
            <TouchableOpacity
              style={styles.logButton}
              onPress={() => (navigation as any).navigate('Workout', { screen: 'StartWorkout' })}
              activeOpacity={0.85}
            >
              <Text style={styles.logButtonText}>Log a Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarWrap}>
        {loading ? (
          <View style={styles.calendarLoading}>
            <ActivityIndicator size="small" color="#2563eb" />
          </View>
        ) : (
          <Calendar
            markedDates={updatedMarkedDates}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              todayTextColor: '#2563eb',
              selectedDayBackgroundColor: '#2563eb',
              selectedDayTextColor: '#ffffff',
              arrowColor: '#2563eb',
              monthTextColor: '#0f172a',
              textMonthFontWeight: '700',
              textDayFontWeight: '500',
              textDayHeaderFontWeight: '600',
              dayTextColor: '#0f172a',
              textDisabledColor: '#cbd5e1',
              dotColor: '#2563eb',
            }}
          />
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.dayPanel}>{renderDatePanel()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  calendarWrap: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  calendarLoading: {
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dayPanel: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  workoutDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  dayListContent: {
    paddingBottom: 20,
  },
  dayLoadingWrap: {
    paddingTop: 32,
    alignItems: 'center',
  },
  promptWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  promptLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  promptText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  dayEmptyWrap: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  dayEmptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  dayEmptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  logButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  logButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 10,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  exerciseCount: {
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
});
