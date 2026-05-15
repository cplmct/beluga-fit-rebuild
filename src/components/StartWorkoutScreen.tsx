import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export function StartWorkoutScreen({ navigation, route }: any) {
  // Relay from HomeScreen: when an active plan exists, Home navigates here
  // with a pendingPlanId param instead of going directly to PlanDetail.
  // This works around React Navigation v6's behaviour of ignoring nested
  // screen params for tabs that already have stack state.
  useEffect(() => {
    const pendingPlanId = route.params?.pendingPlanId;
    if (pendingPlanId) {
      if (__DEV__) console.log('[StartWorkoutScreen] Relay → PlanDetail, planId:', pendingPlanId);
      navigation.setParams({ pendingPlanId: undefined });
      navigation.navigate('PlanDetail', { planId: pendingPlanId });
    }
  }, [route.params?.pendingPlanId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start a Workout</Text>
      <Text style={styles.subtitle}>Choose how you want to train today</Text>

      <View style={styles.options}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('PlanLibrary')}
          activeOpacity={0.85}
        >
          <View style={[styles.optionIconBox, { backgroundColor: '#eff6ff' }]}>
            <Text style={styles.optionIconText}>📋</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Workout Plans</Text>
            <Text style={styles.optionDesc}>
              Browse structured multi-week programs and commit to a plan
            </Text>
          </View>
          <Text style={styles.optionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Templates')}
          activeOpacity={0.85}
        >
          <View style={[styles.optionIconBox, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.optionIconText}>⚡</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Quick Start</Text>
            <Text style={styles.optionDesc}>
              Jump into a single pre-built session — Push, Pull, Legs, or Full Body
            </Text>
          </View>
          <Text style={styles.optionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('BodyParts')}
          activeOpacity={0.85}
        >
          <View style={[styles.optionIconBox, { backgroundColor: '#fdf4ff' }]}>
            <Text style={styles.optionIconText}>💪</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Custom Workout</Text>
            <Text style={styles.optionDesc}>
              Build your own session from the full exercise library
            </Text>
          </View>
          <Text style={styles.optionArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 32,
    fontWeight: '400',
  },
  options: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  optionDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  optionArrow: {
    fontSize: 22,
    color: '#cbd5e1',
    flexShrink: 0,
  },
});
