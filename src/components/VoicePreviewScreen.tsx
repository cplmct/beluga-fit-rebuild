import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { VoiceButton } from './VoiceButton';
import { VoiceCommand, parseVoiceCommand, getCommandDescription } from '../utils/voiceCommandParser';

interface CommandExample {
  command: string;
  description: string;
  screen: string;
}

const COMMAND_EXAMPLES: CommandExample[] = [
  { command: 'Start workout', description: 'Navigate to workout selection', screen: 'Home & Any' },
  { command: 'Log my weight', description: 'Focus weight input field', screen: 'Body Tracker' },
  { command: 'Show today\'s workout', description: 'Open calendar view', screen: 'Home & Any' },
  { command: 'Add set', description: 'Mark next exercise complete', screen: 'Workout Checklist' },
  { command: 'Finish workout', description: 'Complete and save workout', screen: 'Workout Checklist' },
  { command: 'Open body tracker', description: 'Navigate to body tracker', screen: 'Home & Any' },
  { command: 'Start rest timer', description: 'Open rest timer', screen: 'Home, Workout' },
  { command: 'Generate workout plan', description: 'Open AI Coach', screen: 'Home, AI Coach' },
];

const ALTERNATIVE_PHRASES = [
  { command: 'Begin workout', matches: 'START_WORKOUT' },
  { command: 'Record my weight', matches: 'LOG_WEIGHT' },
  { command: 'Enter my weight', matches: 'LOG_WEIGHT' },
  { command: 'Next set', matches: 'ADD_SET' },
  { command: 'Complete set', matches: 'ADD_SET' },
  { command: 'Complete workout', matches: 'FINISH_WORKOUT' },
  { command: 'End workout', matches: 'FINISH_WORKOUT' },
  { command: 'Go to body tracker', matches: 'OPEN_BODY_TRACKER' },
  { command: 'Rest timer', matches: 'START_REST_TIMER' },
  { command: 'Take a rest', matches: 'START_REST_TIMER' },
  { command: 'Create workout plan', matches: 'GENERATE_WORKOUT_PLAN' },
  { command: 'AI coach', matches: 'GENERATE_WORKOUT_PLAN' },
];

export function VoicePreviewScreen({ navigation }: any) {
  const [lastCommand, setLastCommand] = useState<string>('');
  const [commandResult, setCommandResult] = useState<string>('');

  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    const description = getCommandDescription(command);
    setLastCommand(command.type);
    setCommandResult(description);

    if (command.type !== 'UNKNOWN') {
      Alert.alert('Voice Command Recognized', description);
    }
  }, []);

  const testCommand = (text: string) => {
    const command = parseVoiceCommand(text);
    const description = getCommandDescription(command);
    setLastCommand(command.type);
    setCommandResult(description);
    Alert.alert('Test Result', `"${text}" → ${description}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Input Preview</Text>
        <Text style={styles.subtitle}>
          Test and explore voice commands for hands-free workout tracking
        </Text>
      </View>

      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>Try Voice Input</Text>
        <Text style={styles.sectionDescription}>
          Click the microphone button below and speak any command
        </Text>

        <View style={styles.demoBox}>
          <VoiceButton
            onCommand={handleVoiceCommand}
            size="large"
          />
          {lastCommand && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Last Command:</Text>
              <Text style={styles.resultCommand}>{lastCommand}</Text>
              <Text style={styles.resultDescription}>{commandResult}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Commands</Text>
        <Text style={styles.sectionDescription}>
          These voice commands work throughout the app
        </Text>

        <View style={styles.commandsList}>
          {COMMAND_EXAMPLES.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.commandCard}
              onPress={() => testCommand(example.command)}
            >
              <View style={styles.commandHeader}>
                <Text style={styles.commandIcon}>🎤</Text>
                <Text style={styles.commandText}>"{example.command}"</Text>
              </View>
              <Text style={styles.commandDescription}>{example.description}</Text>
              <Text style={styles.commandScreen}>Available on: {example.screen}</Text>
              <View style={styles.testBadge}>
                <Text style={styles.testBadgeText}>Tap to Test</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alternative Phrases</Text>
        <Text style={styles.sectionDescription}>
          The parser recognizes multiple ways to say the same command
        </Text>

        <View style={styles.alternativesList}>
          {ALTERNATIVE_PHRASES.map((phrase, index) => (
            <TouchableOpacity
              key={index}
              style={styles.alternativeCard}
              onPress={() => testCommand(phrase.command)}
            >
              <Text style={styles.alternativeCommand}>"{phrase.command}"</Text>
              <Text style={styles.alternativeMatches}>→ {phrase.matches}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Integration Points</Text>
        <View style={styles.integrationList}>
          <View style={styles.integrationCard}>
            <Text style={styles.integrationTitle}>🏠 Home Screen</Text>
            <Text style={styles.integrationDescription}>
              Floating voice button with full navigation support
            </Text>
          </View>
          <View style={styles.integrationCard}>
            <Text style={styles.integrationTitle}>✅ Workout Checklist</Text>
            <Text style={styles.integrationDescription}>
              Mark exercises complete and finish workouts by voice
            </Text>
          </View>
          <View style={styles.integrationCard}>
            <Text style={styles.integrationTitle}>📊 Body Tracker</Text>
            <Text style={styles.integrationDescription}>
              Quick voice command to log weight measurements
            </Text>
          </View>
          <View style={styles.integrationCard}>
            <Text style={styles.integrationTitle}>🤖 AI Coach</Text>
            <Text style={styles.integrationDescription}>
              Generate workout plans hands-free
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>1</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Web Speech API</Text>
              <Text style={styles.featureDescription}>
                Uses browser's native speech recognition for accurate voice capture
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>2</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Smart Command Parser</Text>
              <Text style={styles.featureDescription}>
                Recognizes natural language patterns and matches to actions
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>3</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Visual Feedback</Text>
              <Text style={styles.featureDescription}>
                Button pulses red while listening, provides confirmation alerts
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>4</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Context-Aware Actions</Text>
              <Text style={styles.featureDescription}>
                Commands trigger appropriate actions based on current screen
              </Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Home</Text>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  demoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  demoBox: {
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  resultBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  resultLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  resultCommand: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    color: '#4b5563',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  commandsList: {
    gap: 12,
  },
  commandCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  commandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  commandIcon: {
    fontSize: 20,
  },
  commandText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  commandDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  commandScreen: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  testBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  testBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e40af',
  },
  alternativesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alternativeCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  alternativeCommand: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  alternativeMatches: {
    fontSize: 11,
    color: '#6b7280',
  },
  integrationList: {
    gap: 12,
  },
  integrationCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  integrationDescription: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 16,
  },
  featureNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
