import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { VoiceButton } from './VoiceButton';
import { VoiceCommand } from '../utils/voiceCommandParser';

export function HomeScreen({ navigation }: any) {
  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    switch (command.type) {
      case 'START_WORKOUT':
        navigation.navigate('Workout', { screen: 'BodyParts' });
        Alert.alert('Voice Command', 'Starting workout');
        break;
      case 'LOG_WEIGHT':
      case 'OPEN_BODY_TRACKER':
        navigation.navigate('BodyTracker');
        Alert.alert('Voice Command', 'Opening body tracker');
        break;
      case 'GENERATE_WORKOUT_PLAN':
        navigation.navigate('AICoach');
        Alert.alert('Voice Command', 'Opening AI Coach');
        break;
      case 'SHOW_TODAY_WORKOUT':
        navigation.navigate('Calendar');
        Alert.alert('Voice Command', 'Showing calendar');
        break;
      case 'START_REST_TIMER':
        navigation.navigate('Workout', { screen: 'RestTimer' });
        Alert.alert('Voice Command', 'Starting rest timer');
        break;
      default:
        break;
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your Fitness App</Text>
      <Text style={styles.subtitle}>Track your workouts and progress</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.voicePreviewButton]}
          onPress={() => navigation.navigate('VoicePreview')}
        >
          <Text style={styles.buttonIcon}>🎤</Text>
          <Text style={styles.buttonText}>Voice Input Demo</Text>
          <Text style={styles.buttonSubtext}>See all voice commands & features</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.aiCoachButton]}
          onPress={() => navigation.navigate('AICoach')}
        >
          <Text style={styles.buttonIcon}>🤖</Text>
          <Text style={styles.buttonText}>AI Workout Coach</Text>
          <Text style={styles.buttonSubtext}>Get personalized training plans</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BodyTracker')}
        >
          <Text style={styles.buttonText}>Body Tracker</Text>
        </TouchableOpacity>
      </View>

      <VoiceButton
        onCommand={handleVoiceCommand}
        position="floating"
        size="large"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voicePreviewButton: {
    backgroundColor: '#10b981',
  },
  aiCoachButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: '#e9d5ff',
    fontSize: 14,
    marginTop: 4,
  },
});
