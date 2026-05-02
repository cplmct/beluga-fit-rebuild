import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export function StartWorkoutScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ready to Work Out?</Text>
      <Text style={styles.subtitle}>Choose how you want to start</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Templates')}
        >
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIconText}>📋</Text>
          </View>
          <Text style={styles.optionTitle}>Use a Plan</Text>
          <Text style={styles.optionDescription}>
            Start with a structured pre-built workout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('BodyParts')}
        >
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIconText}>💪</Text>
          </View>
          <Text style={styles.optionTitle}>Custom Workout</Text>
          <Text style={styles.optionDescription}>
            Build your own workout from the exercise library
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 40,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionIconContainer: {
    marginBottom: 12,
  },
  optionIconText: {
    fontSize: 40,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
