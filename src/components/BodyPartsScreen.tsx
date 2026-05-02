import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BODY_PARTS, BodyPart } from '../data/exercises';

export function BodyPartsScreen({ navigation }: any) {
  const [selectedParts, setSelectedParts] = useState<Set<BodyPart>>(new Set());

  const toggleBodyPart = (part: BodyPart) => {
    const newSelected = new Set(selectedParts);
    if (newSelected.has(part)) {
      newSelected.delete(part);
    } else {
      newSelected.add(part);
    }
    setSelectedParts(newSelected);
  };

  const handleContinue = () => {
    if (selectedParts.size === 0) {
      return;
    }
    navigation.navigate('Exercises', { selectedBodyParts: Array.from(selectedParts) });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Select Body Parts to Train</Text>
        <Text style={styles.subtitle}>Choose one or more body parts</Text>

        <View style={styles.partsContainer}>
          {BODY_PARTS.map((part) => (
            <TouchableOpacity
              key={part}
              style={[
                styles.partButton,
                selectedParts.has(part) && styles.partButtonSelected,
              ]}
              onPress={() => toggleBodyPart(part)}
            >
              <View style={[
                styles.checkbox,
                selectedParts.has(part) && styles.checkboxSelected,
              ]}>
                {selectedParts.has(part) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={[
                styles.partText,
                selectedParts.has(part) && styles.partTextSelected,
              ]}>
                {part}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedParts.size === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedParts.size === 0}
        >
          <Text style={styles.continueButtonText}>
            Continue ({selectedParts.size} selected)
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
    marginBottom: 24,
  },
  partsContainer: {
    gap: 12,
  },
  partButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  partButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
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
  partText: {
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '500',
  },
  partTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
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
