import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISE_COACHING, ExerciseVariation } from '../data/exerciseCoaching';

interface ExerciseCoachingSheetProps {
  visible: boolean;
  exerciseKey: string | null;
  onClose: () => void;
}

const DIFFICULTY_LABEL: Record<ExerciseVariation['difficulty'], string> = {
  easier: 'Easier',
  similar: 'Similar',
  harder: 'Harder',
};

const DIFFICULTY_STYLE: Record<ExerciseVariation['difficulty'], object> = {
  easier: { backgroundColor: '#dcfce7', borderColor: '#86efac' },
  similar: { backgroundColor: '#dbeafe', borderColor: '#93c5fd' },
  harder: { backgroundColor: '#ffedd5', borderColor: '#fdba74' },
};

const DIFFICULTY_TEXT: Record<ExerciseVariation['difficulty'], object> = {
  easier: { color: '#166534' },
  similar: { color: '#1e40af' },
  harder: { color: '#9a3412' },
};

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function VariationCard({ v }: { v: ExerciseVariation }) {
  return (
    <View style={styles.variationCard}>
      <View style={styles.variationHeader}>
        <Text style={styles.variationName}>{v.name}</Text>
        <View style={[styles.difficultyBadge, DIFFICULTY_STYLE[v.difficulty]]}>
          <Text style={[styles.difficultyText, DIFFICULTY_TEXT[v.difficulty]]}>
            {DIFFICULTY_LABEL[v.difficulty]}
          </Text>
        </View>
      </View>
      <Text style={styles.variationPurpose}>{v.purpose}</Text>
      <Text style={styles.variationFormChange}>{v.formChange}</Text>
    </View>
  );
}

export function ExerciseCoachingSheet({
  visible,
  exerciseKey,
  onClose,
}: ExerciseCoachingSheetProps) {
  const coaching = exerciseKey ? EXERCISE_COACHING[exerciseKey] ?? null : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop — tap anywhere above the sheet to close */}
      <TouchableWithoutFeedback onPress={onClose} accessibilityLabel="Close coaching panel">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {coaching?.displayName ?? 'Exercise Coaching'}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Close coaching panel"
            style={styles.closeButton}
          >
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {coaching === null ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Coaching not available yet</Text>
            <Text style={styles.emptySub}>
              Detailed guidance for this exercise is coming in a future update.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{coaching.summary}</Text>
            </View>

            {/* What it is / Setup */}
            <Section title="Setup" items={coaching.setup} />

            {/* Perform the movement */}
            <Section title="Perform the movement" items={coaching.execution} />

            {/* Breathing */}
            <Section title="Breathing" items={coaching.breathing} />

            {/* Coaching cues */}
            <Section title="Coaching cues" items={coaching.cues} />

            {/* Common mistakes */}
            <Section title="Common mistakes" items={coaching.commonMistakes} />

            {/* Variations */}
            {coaching.variations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Variations</Text>
                {coaching.variations.map((v) => (
                  <VariationCard key={v.name} v={v} />
                ))}
              </View>
            )}

            {/* Safety notes */}
            {coaching.safetyNotes.length > 0 && (
              <View style={[styles.section, styles.safetySection]}>
                <View style={styles.safetyHeader}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#92400e" />
                  <Text style={[styles.sectionTitle, styles.safetyTitle]}>Safety notes</Text>
                </View>
                {coaching.safetyNotes.map((note, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={[styles.bulletDot, styles.safetyBullet]}>•</Text>
                    <Text style={[styles.bulletText, styles.safetyText]}>{note}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Bottom padding for safe area / home indicator */}
            <View style={{ height: 32 }} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  // ── Backdrop ──
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // ── Sheet ──
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
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

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // ── Summary ──
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
  },

  // ── Section ──
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingRight: 4,
  },
  bulletDot: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 8,
    lineHeight: 21,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 21,
  },

  // ── Variation card ──
  variationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 8,
  },
  variationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  variationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  variationPurpose: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 4,
  },
  variationFormChange: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
    fontStyle: 'italic',
  },

  // ── Safety section ──
  safetySection: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 14,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  safetyTitle: {
    color: '#92400e',
    marginBottom: 0,
  },
  safetyBullet: {
    color: '#b45309',
  },
  safetyText: {
    color: '#78350f',
  },

  // ── Empty / fallback ──
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
  },
});
