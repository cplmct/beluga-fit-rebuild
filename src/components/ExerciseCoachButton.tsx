import React from 'react';
import { TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExerciseCoachButtonProps {
  exerciseName: string;
  /** Caller must stop event propagation if needed before calling this. */
  onPress: () => void;
}

/**
 * Small icon button that opens the coaching sheet for a given exercise.
 * Only render this component when coaching content actually exists for the exercise.
 */
export function ExerciseCoachButton({ exerciseName, onPress }: ExerciseCoachButtonProps) {
  const handlePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={`Open coaching for ${exerciseName}`}
    >
      <Ionicons name="information-circle-outline" size={18} color="#2563eb" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
});
