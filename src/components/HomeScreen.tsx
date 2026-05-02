import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  const displayName = user?.email?.split('@')[0] || 'Athlete';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{displayName}</Text>
      </View>

      <TouchableOpacity
        style={styles.primaryCard}
        onPress={() => navigation.navigate('Workout', { screen: 'StartWorkout' })}
        activeOpacity={0.85}
      >
        <View>
          <Text style={styles.primaryCardLabel}>Ready to train?</Text>
          <Text style={styles.primaryCardTitle}>Start a Workout</Text>
        </View>
        <Text style={styles.primaryCardArrow}>→</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Track Your Progress</Text>

      <View style={styles.secondaryGrid}>
        <TouchableOpacity
          style={styles.secondaryCard}
          onPress={() => navigation.navigate('BodyTracker')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryCardTitle}>Body Tracker</Text>
          <Text style={styles.secondaryCardDesc}>Log weight and measurements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryCard}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryCardTitle}>History</Text>
          <Text style={styles.secondaryCardDesc}>Review past workouts</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.calendarCard}
        onPress={() => navigation.navigate('Calendar')}
        activeOpacity={0.85}
      >
        <View>
          <Text style={styles.calendarCardTitle}>Calendar</Text>
          <Text style={styles.calendarCardDesc}>View your training schedule</Text>
        </View>
        <Text style={styles.calendarCardArrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
    marginTop: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  primaryCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryCardLabel: {
    fontSize: 14,
    color: '#bfdbfe',
    fontWeight: '500',
    marginBottom: 4,
  },
  primaryCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  primaryCardArrow: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  secondaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  secondaryCardDesc: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  calendarCardDesc: {
    fontSize: 12,
    color: '#9ca3af',
  },
  calendarCardArrow: {
    fontSize: 20,
    color: '#d1d5db',
  },
});
