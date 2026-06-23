import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { EXERCISES, BodyPart, Exercise } from '../data/exercises';

interface SwapExerciseModalProps {
  visible: boolean;
  bodyPart: BodyPart;
  excludeNames: string[];
  onSelect: (exercise: Exercise) => void;
  onCancel: () => void;
}

export function SwapExerciseModal({
  visible,
  bodyPart,
  excludeNames,
  onSelect,
  onCancel,
}: SwapExerciseModalProps) {
  const excludeSet = new Set(excludeNames);
  const candidates = (EXERCISES[bodyPart] ?? []).filter(
    (ex) => !excludeSet.has(ex.name)
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Swap Exercise</Text>
            <Text style={styles.subtitle}>{bodyPart} alternatives</Text>
          </View>

          {candidates.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No other {bodyPart} exercises available.
              </Text>
            </View>
          ) : (
            <FlatList
              data={candidates}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exerciseRow}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.72}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <Text style={styles.exerciseMeta}>{item.equipment}</Text>
                  </View>
                  <Text style={styles.selectHint}>Select</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    maxHeight: '72%',
    paddingBottom: 24,
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
  list: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  exerciseMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  selectHint: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 8,
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
});
