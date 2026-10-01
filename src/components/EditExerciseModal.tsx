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
import { WorkoutTarget, formatWorkoutTarget } from '../utils/workoutTarget';

interface EditExerciseModalProps {
  visible: boolean;
  sets: number;
  target: WorkoutTarget;
  weight: string;
  weightUnit: string;
  onSave: (sets: number, target: WorkoutTarget, weight: string) => void;
  onCancel: () => void;
}

export function EditExerciseModal({
  visible,
  sets,
  target,
  weight,
  weightUnit,
  onSave,
  onCancel,
}: EditExerciseModalProps) {
  const [setsStr, setSetsStr] = useState('');
  const [targetStr, setTargetStr] = useState('');
  const [targetKind, setTargetKind] = useState<WorkoutTarget['kind']>('reps');
  const [weightStr, setWeightStr] = useState('');
  const [error, setError] = useState('');

  // Sync incoming props into local string state each time the modal opens.
  useEffect(() => {
    if (visible) {
      setSetsStr(String(sets));
      setTargetKind(target.kind);
      setTargetStr(target.kind === 'unknown' ? target.raw : String(target.value));
      setWeightStr(weight ?? '');
      setError('');
    }
  }, [visible]);

  const handleSave = () => {
    const parsedSets = Number(setsStr);

    if (!/^[0-9]+$/.test(setsStr) || !Number.isSafeInteger(parsedSets) || parsedSets < 1) {
      setError('Sets must be a whole number of at least 1.');
      return;
    }
    let nextTarget: WorkoutTarget;
    if (targetKind === 'unknown') {
      nextTarget = { kind: 'unknown', raw: targetStr, origin: 'edit' };
    } else {
      const value = Number(targetStr);
      if (!/^[0-9]+$/.test(targetStr) || !Number.isSafeInteger(value) || value < 1) {
        setError('Target must be a positive whole number.');
        return;
      }
      nextTarget = { kind: targetKind, value };
    }
    if (weightStr !== '' && isNaN(parseFloat(weightStr))) {
      setError('Weight must be a number, or leave it blank.');
      return;
    }

    onSave(parsedSets, nextTarget, weightStr);
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
            <Text style={styles.subtitle}>Adjust sets, target, and weight</Text>
          </View>

          <View style={styles.fields}>
            <View style={styles.targetKinds}>
              {(['reps', 'seconds', 'steps'] as const).map((kind) => (
                <TouchableOpacity
                  key={kind}
                  testID={`target-kind-${kind}`}
                  style={[styles.kindButton, targetKind === kind && styles.kindButtonActive]}
                  onPress={() => {
                    if (targetKind !== kind) {
                      setTargetKind(kind);
                      setTargetStr(''); // A kind change needs an explicit new value.
                      setError('');
                    }
                  }}
                >
                  <Text style={styles.kindButtonText}>{kind}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {targetKind === 'unknown' && (
              <Text style={styles.subtitle}>Unsupported target: {formatWorkoutTarget(target)}. Choose a kind to replace it.</Text>
            )}
            <View style={styles.row}>
              <View style={styles.fieldGroup}>
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

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Target ({targetKind})</Text>
                <TextInput
                  style={styles.input}
                  testID="exercise-target-value"
                  value={targetStr}
                  onChangeText={(v) => { setTargetStr(v); setError(''); }}
                  keyboardType={targetKind === 'unknown' ? 'default' : 'number-pad'}
                  selectTextOnFocus
                  maxLength={targetKind === 'unknown' ? 60 : 8}
                />
              </View>

              <View style={styles.fieldGroup}>
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
              <Text style={styles.saveText}>Save Changes</Text>
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
  targetKinds: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kindButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  kindButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  kindButtonText: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldGroup: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    height: 36,
    lineHeight: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    width: '100%',
    height: 48,
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
