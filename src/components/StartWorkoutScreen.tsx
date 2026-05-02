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
          <Text style={styles.optionIcon}>📋</Text>
          <Text style={styles.optionTitle}>Use Template</Text>
          <Text style={styles.optionDescription}>
            Start with a pre-built workout plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('BodyParts')}
        >
          <Text style={styles.optionIcon}>💪</Text>
          <Text style={styles.optionTitle}>Custom Workout</Text>
          <Text style={styles.optionDescription}>
            Build your own workout from scratch
          </Text>
        </TouchableOpacity>
		
		<TouchableOpacity
		  style={styles.optionCard}
		  onPress={() => navigation.navigate('AIWorkout')}
		>
		  <Text style={styles.optionIcon}>🤖</Text>
		  <Text style={styles.optionTitle}>AI Workout</Text>
		  <Text style={styles.optionDescription}>
			Generate a personalized workout using Beluga Fit AI
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 60,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
