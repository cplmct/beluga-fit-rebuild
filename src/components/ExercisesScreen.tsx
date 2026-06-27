import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { EXERCISES, BodyPart, ExerciseSelection, Category, CATEGORIES } from '../data/exercises';
import { useUnits } from '../contexts/UnitsContext';
import { ExerciseFormModal } from './ExerciseFormModal';
import { EXERCISE_GUIDANCE } from '../data/exerciseGuidance';
export function ExercisesScreen({ route, navigation }: any) {
  const { selectedBodyParts } = route.params as { selectedBodyParts: BodyPart[] };
  const { weightUnit } = useUnits();

  const initialExercises = useMemo(() => {
    const exercises: ExerciseSelection[] = [];
    selectedBodyParts.forEach((bodyPart: BodyPart) => {
      EXERCISES[bodyPart].forEach((exercise) => {
        exercises.push({
          name: exercise.name,
          bodyPart,
          category: exercise.category,
          equipment: exercise.equipment,
          sets: 3,
          reps: 10,
          weight: '',
          selected: false,
        });
      });
    });
    return exercises;
  }, [selectedBodyParts]);

  const [exercises, setExercises] = useState<ExerciseSelection[]>(initialExercises);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [formExercise, setFormExercise] = useState<{ name: string; bodyPart: string } | null>(null);

  const toggleExercise = (index: number) => {
    const updated = [...exercises];
    updated[index].selected = !updated[index].selected;
    setExercises(updated);
  };

  const updateSets = (index: number, delta: number) => {
    const updated = [...exercises];
    updated[index].sets = Math.max(1, updated[index].sets + delta);
    setExercises(updated);
  };

  const updateReps = (index: number, delta: number) => {
    const updated = [...exercises];
    updated[index].reps = Math.max(1, updated[index].reps + delta);
    setExercises(updated);
  };

  const updateWeight = (index: number, value: string) => {
    const updated = [...exercises];
    updated[index].weight = value;
    setExercises(updated);
  };

  const handleContinue = () => {
    const selectedExercises = exercises.filter((ex) => ex.selected);
    if (selectedExercises.length === 0) {
      return;
    }
    navigation.navigate('WorkoutChecklist', {
      exercises: selectedExercises,
      bodyParts: selectedBodyParts,
    });
  };

  const selectedCount = exercises.filter((ex) => ex.selected).length;

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;

      const matchesSearch = searchQuery === '' ||
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.equipment.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [exercises, selectedCategory, searchQuery]);

  const exercisesByBodyPart = useMemo(() => {
    const grouped: Record<string, ExerciseSelection[]> = {};
    filteredExercises.forEach((ex) => {
      if (!grouped[ex.bodyPart]) {
        grouped[ex.bodyPart] = [];
      }
      grouped[ex.bodyPart].push(ex);
    });
    return grouped;
  }, [filteredExercises]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Select Exercises</Text>
        <Text style={styles.subtitle}>Choose exercises and set your targets</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or equipment..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.categoryContainer}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredExercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No exercises match your filters</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim()
                ? `No results for "${searchQuery.trim()}"${selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.`
                : `No ${selectedCategory} exercises for the selected muscle groups.`}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          selectedBodyParts.map((bodyPart: BodyPart) => {
            if (!exercisesByBodyPart[bodyPart] || exercisesByBodyPart[bodyPart].length === 0) {
              return null;
            }
            return (
          <View key={bodyPart} style={styles.bodyPartSection}>
            <Text style={styles.bodyPartTitle}>{bodyPart}</Text>
            {exercisesByBodyPart[bodyPart]?.map((exercise, idx) => {
              const globalIndex = exercises.indexOf(exercise);
              return (
                <View key={exercise.name} style={styles.exerciseCard}>
                  <TouchableOpacity
                    style={styles.exerciseHeader}
                    onPress={() => toggleExercise(globalIndex)}
                  >
                    <View style={[
                      styles.checkbox,
                      exercise.selected && styles.checkboxSelected,
                    ]}>
                      {exercise.selected && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text style={[
                        styles.exerciseName,
                        exercise.selected && styles.exerciseNameSelected,
                      ]}>
                        {exercise.name}
                      </Text>
                      <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
                    </View>

                    {!!EXERCISE_GUIDANCE[exercise.name] && (
                      <TouchableOpacity
                        style={styles.formButton}
                        onPress={(e) => { e.stopPropagation(); setFormExercise({ name: exercise.name, bodyPart }); }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.formButtonText}>Form</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>

                  {exercise.selected && (
                    <View style={styles.exerciseControls}>
                      <View style={styles.controlRow}>
                        <View style={styles.counter}>
                          <Text style={styles.counterLabel}>Sets</Text>
                          <View style={styles.counterButtons}>
                            <TouchableOpacity
                              style={styles.counterButton}
                              onPress={() => updateSets(globalIndex, -1)}
                            >
                              <Text style={styles.counterButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.counterValue}>{exercise.sets}</Text>
                            <TouchableOpacity
                              style={styles.counterButton}
                              onPress={() => updateSets(globalIndex, 1)}
                            >
                              <Text style={styles.counterButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.counter}>
                          <Text style={styles.counterLabel}>Reps</Text>
                          <View style={styles.counterButtons}>
                            <TouchableOpacity
                              style={styles.counterButton}
                              onPress={() => updateReps(globalIndex, -1)}
                            >
                              <Text style={styles.counterButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.counterValue}>{exercise.reps}</Text>
                            <TouchableOpacity
                              style={styles.counterButton}
                              onPress={() => updateReps(globalIndex, 1)}
                            >
                              <Text style={styles.counterButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      <View style={styles.weightRow}>
                        <Text style={styles.weightLabel}>Weight ({weightUnit})</Text>
                        <TextInput
                          style={styles.weightInput}
                          value={exercise.weight}
                          onChangeText={(value) => updateWeight(globalIndex, value)}
                          placeholder="0"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
            );
          })
        )}
      </ScrollView>

      <ExerciseFormModal
        visible={formExercise !== null}
        exerciseName={formExercise?.name ?? ''}
        bodyPart={formExercise?.bodyPart ?? ''}
        onClose={() => setFormExercise(null)}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedCount === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedCount === 0}
        >
          <Text style={styles.continueButtonText}>
            Continue to Checklist ({selectedCount} selected)
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
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bodyPartSection: {
    marginBottom: 24,
  },
  bodyPartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 2,
  },
  exerciseNameSelected: {
    fontWeight: '600',
    color: '#3b82f6',
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#9ca3af',
  },
  formButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  formButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  exerciseControls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  counter: {
    flex: 1,
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  counterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 4,
  },
  counterButton: {
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3b82f6',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  weightInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    minWidth: 100,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  continueButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
