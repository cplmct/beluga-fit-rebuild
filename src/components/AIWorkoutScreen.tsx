import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { VoiceButton } from './VoiceButton';
import { VoiceCommand } from '../utils/voiceCommandParser';

const GOALS = ['Strength', 'Hypertrophy', 'Fat Loss', 'Endurance'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];
const EQUIPMENT = ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];

interface WorkoutPlan {
  title: string;
  description: string;
  weeklySchedule?: Array<{
    day: number;
    dayName: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      rest: string;
      notes?: string;
    }>;
  }>;
  tips?: string[];
}

export function AIWorkoutScreen({ navigation }: any) {
  const [goal, setGoal] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const toggleEquipment = (item: string) => {
    const updated = new Set(selectedEquipment);
    updated.has(item) ? updated.delete(item) : updated.add(item);
    setSelectedEquipment(updated);
  };

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.has(dayNumber) ? next.delete(dayNumber) : next.add(dayNumber);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!goal || !experience || selectedEquipment.size === 0) {
      Alert.alert('Missing Info', 'Please select goal, experience, and equipment.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
        body: {
          goal,
          experience,
          frequency: 3,
          equipment: Array.from(selectedEquipment),
          injuries: '',
        },
      });

      if (error || !data) {
        throw new Error('Failed to generate workout');
      }

      const plan = data as WorkoutPlan;
      setGeneratedPlan(plan);

      const initialExpanded = new Set<number>();
      plan.weeklySchedule?.forEach((day) => initialExpanded.add(day.day));
      setExpandedDays(initialExpanded);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) {
      Alert.alert('No Plan', 'Generate a plan before saving.');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from('ai_workout_plans').insert({
		title: generatedPlan.title,
		goal: userInputs.goal,                       // from your payload
		experience_level: userInputs.experience,     // from your payload
		days_per_week: userInputs.frequency,         // from your payload
		available_equipment: userInputs.equipment,   // from your payload
		injuries_limitations: userInputs.injuries,   // from your payload
		plan_data: generatedPlan                     // full AI JSON
	  });


      if (error) throw error;

      Alert.alert('Saved', 'Your workout plan has been saved.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save workout plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleVoiceCommand = useCallback(
    (command: VoiceCommand) => {
      if (command.type === 'GENERATE_WORKOUT_PLAN') {
        handleGenerate();
      }
      if (command.type === 'SAVE_WORKOUT_PLAN') {
        handleSavePlan();
      }
    },
    [goal, experience, selectedEquipment, generatedPlan]
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>AI Workout Generator</Text>
        <Text style={styles.subtitle}>
          Tell Beluga Fit what you want to train today
        </Text>

        {/* Goal */}
        <Text style={styles.sectionTitle}>Goal</Text>
        <View style={styles.optionsContainer}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.optionButton, goal === g && styles.optionSelected]}
              onPress={() => setGoal(g)}
            >
              <Text
                style={[
                  styles.optionText,
                  goal === g && styles.optionTextSelected,
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Experience */}
        <Text style={styles.sectionTitle}>Experience Level</Text>
        <View style={styles.optionsContainer}>
          {EXPERIENCE.map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[
                styles.optionButton,
                experience === lvl && styles.optionSelected,
              ]}
              onPress={() => setExperience(lvl)}
            >
              <Text
                style={[
                  styles.optionText,
                  experience === lvl && styles.optionTextSelected,
                ]}
              >
                {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Equipment */}
        <Text style={styles.sectionTitle}>Available Equipment</Text>
        <View style={styles.optionsContainer}>
          {EQUIPMENT.map((eq) => (
            <TouchableOpacity
              key={eq}
              style={[
                styles.optionButton,
                selectedEquipment.has(eq) && styles.optionSelected,
              ]}
              onPress={() => toggleEquipment(eq)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedEquipment.has(eq) && styles.optionTextSelected,
                ]}
              >
                {eq}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate / Regenerate */}
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateDisabled]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateText}>
              {generatedPlan ? 'Regenerate Workout' : 'Generate Workout'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Plan UI */}
        {generatedPlan && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.planTitle}>{generatedPlan.title}</Text>
            <Text style={styles.planDescription}>{generatedPlan.description}</Text>

            <Text style={styles.sectionTitle}>Weekly Schedule</Text>

            {generatedPlan.weeklySchedule?.map((day) => {
              const isExpanded = expandedDays.has(day.day);
              return (
                <View key={day.day} style={styles.dayCard}>
                  <TouchableOpacity onPress={() => toggleDay(day.day)}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayTitle}>
                        Day {day.day}: {day.dayName}
                      </Text>
                      <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.dayContent}>
                      {day.exercises?.map((ex, idx) => (
                        <View key={idx} style={styles.exerciseItem}>
                          <Text style={styles.exerciseName}>{ex.name}</Text>
                          <Text style={styles.exerciseMeta}>
                            {ex.sets} sets × {ex.reps} reps — Rest {ex.rest}
                          </Text>
                          {ex.notes && (
                            <Text style={styles.exerciseNotes}>{ex.notes}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

            {generatedPlan.tips && generatedPlan.tips.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Tips for Success</Text>
                {generatedPlan.tips.map((tip, idx) => (
                  <Text key={idx} style={styles.tipText}>
                    • {tip}
                  </Text>
                ))}
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
      </ScrollView>

      <VoiceButton
        onCommand={handleVoiceCommand}
        position="floating"
        size="large"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 20, paddingBottom: 80 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  optionTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  generateButton: {
    marginTop: 40,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateDisabled: {
    opacity: 0.6,
  },
  generateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4b5563',
  },
  dayContent: {
    marginTop: 10,
  },
  exerciseItem: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  exerciseMeta: {
    fontSize: 14,
    color: '#4b5563',
  },
  exerciseNotes: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
