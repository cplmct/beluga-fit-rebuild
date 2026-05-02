import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import { ExerciseSelection } from '../data/exercises';

export function WorkoutTemplatesScreen({ navigation }: any) {
  const handleTemplateSelect = (templateId: string) => {
    const template = WORKOUT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const selectedExercises: ExerciseSelection[] = template.exercises.map((ex) => ({
      ...ex,
      selected: true,
    }));

    const bodyParts = Array.from(new Set(template.exercises.map((ex) => ex.bodyPart)));

    navigation.navigate('WorkoutChecklist', {
      exercises: selectedExercises,
      bodyParts,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Workout Templates</Text>
        <Text style={styles.subtitle}>Choose a pre-built workout to get started quickly</Text>

        {WORKOUT_TEMPLATES.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => handleTemplateSelect(template.id)}
          >
            <View style={styles.templateHeader}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.exerciseCount}>{template.exercises.length} exercises</Text>
            </View>
            <Text style={styles.templateDescription}>{template.description}</Text>
            <View style={styles.exerciseList}>
              {template.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text style={styles.exerciseItemText}>
                    • {exercise.name} ({exercise.sets}x{exercise.reps})
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  exerciseCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  templateDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  exerciseItem: {
    marginBottom: 6,
  },
  exerciseItemText: {
    fontSize: 14,
    color: '#4b5563',
  },
});
