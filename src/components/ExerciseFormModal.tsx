import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { EXERCISE_GUIDANCE } from '../data/exerciseGuidance';

interface ExerciseFormModalProps {
  visible: boolean;
  exerciseName: string;
  bodyPart: string;
  onClose: () => void;
}

const FRAME_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Start:  { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
  Mid:    { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
  Finish: { bg: '#f0fdf4', border: '#bbf7d0', text: '#059669' },
};

export function ExerciseFormModal({
  visible,
  exerciseName,
  bodyPart,
  onClose,
}: ExerciseFormModalProps) {
  const guidance = EXERCISE_GUIDANCE[exerciseName];

  if (!guidance) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.exerciseName}>{exerciseName}</Text>
              <View style={styles.bodyPartChip}>
                <Text style={styles.bodyPartChipText}>{bodyPart}</Text>
              </View>
            </View>
            <Text style={styles.sectionLabel}>Form Guide</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.framesSection}>
              {guidance.frames.map((frame) => {
                const colors = FRAME_COLORS[frame.label];
                return (
                  <View
                    key={frame.label}
                    style={[
                      styles.frameCard,
                      { backgroundColor: colors.bg, borderColor: colors.border },
                    ]}
                  >
                    <View style={[styles.frameLabelPill, { backgroundColor: colors.border }]}>
                      <Text style={[styles.frameLabelText, { color: colors.text }]}>
                        {frame.label.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.frameCaption}>{frame.caption}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.tipsSection}>
              <Text style={styles.tipsSectionTitle}>Coaching Tips</Text>
              {guidance.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Close</Text>
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
    maxHeight: '80%',
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    flex: 1,
    marginRight: 10,
  },
  bodyPartChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bodyPartChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  sectionLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  scrollView: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  framesSection: {
    gap: 10,
    marginBottom: 20,
  },
  frameCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  frameLabelPill: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  frameLabelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  frameCaption: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    fontWeight: '500',
  },
  tipsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
    gap: 10,
  },
  tipsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '700',
    lineHeight: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  closeButton: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
});
