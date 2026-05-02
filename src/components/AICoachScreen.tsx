import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { VoiceButton } from './VoiceButton';
import { VoiceCommand } from '../utils/voiceCommandParser';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string;
}

interface DaySchedule {
  day: number;
  dayName: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  title: string;
  description: string;
  weeklySchedule: DaySchedule[];
  tips: string[];
}

const GOALS = ['Fat Loss', 'Muscle Gain', 'Strength', 'Endurance'];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const EQUIPMENT_OPTIONS = [
  'Dumbbells',
  'Barbell',
  'Resistance Bands',
  'Pull-up Bar',
  'Bench',
  'Kettlebells',
  'Machines',
  'None (Bodyweight)',
];

export function AICoachScreen() {
  const { user } = useAuth();
  const [goal, setGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [injuries, setInjuries] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment]
    );
  };

  const handleGeneratePlan = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to generate a plan');
      return;
    }

    if (!goal || !experienceLevel || !daysPerWeek) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const days = parseInt(daysPerWeek);
    if (isNaN(days) || days < 1 || days > 7) {
      Alert.alert('Error', 'Days per week must be between 1 and 7');
      return;
    }

    setLoading(true);
    setGeneratedPlan(null);

    try {
      const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
      const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
      const { data: { session } } = await supabase.auth.getSession();

	  console.log("Supabase URL:", supabaseUrl);
	  console.log("Function URL:", `${supabaseUrl}/functions/v1/generate-workout-plan`);
	  console.log("Selected equipment:", selectedEquipment);
	  console.log("Payload:", {
		goal,
		experience: experienceLevel,
		frequency: days,
		equipment: selectedEquipment,
		injuries,
		});


	  
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-workout-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
		  'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal,
          experience: experienceLevel,
          frequency: days,
          equipment: selectedEquipment,
          injuries,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate plan');
      }

      const data = await response.json();
	  console.log("AI response:", data);

      setGeneratedPlan(data);
    } catch (error: any) {
      if (__DEV__) {
        console.error('Error generating plan:', error);
      }
      Alert.alert('Error', error.message || 'Failed to generate workout plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!user || !generatedPlan) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('ai_workout_plans')
        .insert({
          user_id: user.id,
          title: generatedPlan.title,
          goal: goal,
          experience_level: experienceLevel,
          days_per_week: parseInt(daysPerWeek),
          available_equipment: selectedEquipment,
          injuries_limitations: injuries || null,
          plan_data: generatedPlan,
        });

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Your workout plan has been saved!');
    } catch (error: any) {
      if (__DEV__) {
        console.error('Error saving plan:', error);
      }
      Alert.alert('Error', 'Failed to save workout plan');
    } finally {
      setSaving(false);
    }
  };

  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    if (command.type === 'GENERATE_WORKOUT_PLAN') {
      handleGeneratePlan();
    }
  }, [goal, experienceLevel, daysPerWeek, selectedEquipment, injuries]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Workout Coach</Text>
      <Text style={styles.subtitle}>Get a personalized workout plan powered by AI</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Fitness Goal *</Text>
        <View style={styles.optionsGrid}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.optionButton, goal === g && styles.optionButtonSelected]}
              onPress={() => setGoal(g)}
            >
              <Text style={[styles.optionText, goal === g && styles.optionTextSelected]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Experience Level *</Text>
        <View style={styles.optionsGrid}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.optionButton, experienceLevel === level && styles.optionButtonSelected]}
              onPress={() => setExperienceLevel(level)}
            >
              <Text style={[styles.optionText, experienceLevel === level && styles.optionTextSelected]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Days Per Week *</Text>
        <TextInput
          style={styles.input}
          value={daysPerWeek}
          onChangeText={setDaysPerWeek}
          keyboardType="number-pad"
          placeholder="e.g., 3"
          maxLength={1}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Available Equipment</Text>
        <View style={styles.equipmentGrid}>
          {EQUIPMENT_OPTIONS.map((equipment) => (
            <TouchableOpacity
              key={equipment}
              style={[
                styles.equipmentButton,
                selectedEquipment.includes(equipment) && styles.equipmentButtonSelected,
              ]}
              onPress={() => toggleEquipment(equipment)}
            >
              <Text
                style={[
                  styles.equipmentText,
                  selectedEquipment.includes(equipment) && styles.equipmentTextSelected,
                ]}
              >
                {equipment}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Injuries or Limitations (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={injuries}
          onChangeText={setInjuries}
          placeholder="e.g., Lower back issues, knee pain"
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={[styles.generateButton, loading && styles.generateButtonDisabled]}
        onPress={handleGeneratePlan}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>Generate Plan</Text>
        )}
      </TouchableOpacity>

{generatedPlan && (
  <View style={styles.planContainer}>
    <Text style={styles.planTitle}>{generatedPlan.title}</Text>
    <Text style={styles.planDescription}>{generatedPlan.description}</Text>

    <Text style={styles.sectionTitle}>Weekly Schedule</Text>

    {Array.isArray(generatedPlan.weeklySchedule) ? (
      generatedPlan.weeklySchedule.map((day) => (
        <View key={day.day} style={styles.dayCard}>
          <Text style={styles.dayTitle}>
            Day {day.day}: {day.dayName}
          </Text>

          {Array.isArray(day.exercises) &&
            day.exercises.map((exercise, idx) => (
              <View key={idx} style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>

                <View style={styles.exerciseStats}>
                  <Text style={styles.statText}>
                    {exercise.sets} sets x {exercise.reps} reps
                  </Text>
                  <Text style={styles.statText}>Rest: {exercise.rest}</Text>
                </View>

                {exercise.notes && (
                  <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                )}
              </View>
            ))}
        </View>
      ))
    ) : (
      <Text style={styles.errorText}>
        No weekly schedule found in the generated plan.
      </Text>
    )}

    {generatedPlan.tips && generatedPlan.tips.length > 0 && (
      <>
        <Text style={styles.sectionTitle}>Tips for Success</Text>
        <View style={styles.tipsContainer}>
          {generatedPlan.tips.map((tip, idx) => (
            <Text key={idx} style={styles.tipText}>
              • {tip}
            </Text>
          ))}
        </View>
      </>
    )}

    <TouchableOpacity
      style={[styles.saveButton, saving && styles.saveButtonDisabled]}
      onPress={handleSavePlan}
      disabled={saving}
    >
      {saving ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.saveButtonText}>Save Plan</Text>
      )}
    </TouchableOpacity>
  </View>
)}


      <VoiceButton
        onCommand={handleVoiceCommand}
        position="floating"
        size="large"
      />
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  optionTextSelected: {
    color: '#3b82f6',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  equipmentButtonSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  equipmentText: {
    fontSize: 13,
    color: '#6b7280',
  },
  equipmentTextSelected: {
    color: '#10b981',
    fontWeight: '500',
  },
  generateButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  generateButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  planContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  dayCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  exerciseItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  exerciseStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  exerciseNotes: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 8,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#86efac',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
