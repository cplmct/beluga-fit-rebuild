import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface EditExerciseModalProps {
  visible: boolean;
  sets: number;
  reps: number;
  weight: string;
  weightUnit: string;
  onSave: (sets: number, reps: number, weight: string) => void;
  onCancel: () => void;
}

export function EditExerciseModal({
  visible,
  sets,
  reps,
  weight,
  weightUnit,
  onSave,
  onCancel,
}: EditExerciseModalProps) {
  const [setsStr, setSetsStr] = useState('');
  const [repsStr, setRepsStr] = useState('');
  const [weightStr, setWeightStr] = useState('');
  const [error, setError] = useState('');

  // Sync incoming props into local string state each time the modal opens.
  useEffect(() => {
    if (visible) {
      setSetsStr(String(sets));
      setRepsStr(String(reps));
      setWeightStr(weight ?? '');
      setError('');
    }
  }, [visible]);

  const handleSave = () => {
    const parsedSets = parseInt(setsStr, 10);
    const parsedReps = parseInt(repsStr, 10);

    if (isNaN(parsedSets) || parsedSets < 1) {
      setError('Sets must be a whole number of at least 1.');
      return;
    }
    if (isNaN(parsedReps) || parsedReps < 1) {
      setError('Reps must be a whole number of at least 1.');
      return;
    }
    if (weightStr !== '' && isNaN(parseFloat(weightStr))) {
      setError('Weight must be a number, or leave it blank.');
      return;
    }

    onSave(parsedSets, parsedReps, weightStr);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Edit Exercise</Text>
            <Text style={styles.subtitle}>Adjust sets, reps, and weight</Text>
          </View>

          <View style={styles.fields}>
            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.fieldGroupNarrow]}>
                <Text style={styles.fieldLabel}>Sets</Text>
                <TextInput
                  style={styles.input}
                  value={setsStr}
                  onChangeText={(v) => { setSetsStr(v); setError(''); }}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  maxLength={3}
                />
              </View>

              <View style={[styles.fieldGroup, styles.fieldGroupNarrow]}>
                <Text style={styles.fieldLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  value={repsStr}
                  onChangeText={(v) => { setRepsStr(v); setError(''); }}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  maxLength={3}
                />
              </View>

              <View style={[styles.fieldGroup, styles.fieldGroupWide]}>
                <Text style={styles.fieldLabel}>Weight ({weightUnit})</Text>
                <TextInput
                  style={styles.input}
                  value={weightStr}
                  onChangeText={(v) => { setWeightStr(v); setError(''); }}
                  keyboardType="decimal-pad"
                  placeholder="—"
                  placeholderTextColor="#94a3b8"
                  selectTextOnFocus
                  maxLength={7}
                />
              </View>
            </View>

            {error !== '' && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  fields: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldGroup: {
    flex: 1,
  },
  fieldGroupNarrow: {
    flex: 1,
  },
  fieldGroupWide: {
    flex: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 10,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
