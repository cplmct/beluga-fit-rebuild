import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BodyMeasurement {
  id: string;
  height: number | null;
  weight: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  left_arm: number | null;
  right_arm: number | null;
  left_thigh: number | null;
  right_thigh: number | null;
  left_calf: number | null;
  right_calf: number | null;
  neck: number | null;
  created_at: string;
}

export function BodyTrackerScreen() {
  const { user } = useAuth();

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [leftArm, setLeftArm] = useState('');
  const [rightArm, setRightArm] = useState('');
  const [leftThigh, setLeftThigh] = useState('');
  const [rightThigh, setRightThigh] = useState('');
  const [leftCalf, setLeftCalf] = useState('');
  const [rightCalf, setRightCalf] = useState('');
  const [neck, setNeck] = useState('');

  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMeasurements();
    }, [])
  );

  const fetchMeasurements = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch measurements');
      }

      setMeasurements(data || []);
    } catch (error) {
      if (__DEV__) {
        console.error('Error fetching measurements:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save measurements');
      return;
    }

    if (!height && !weight && !chest && !waist && !hips && !leftArm && !rightArm && !leftThigh && !rightThigh && !leftCalf && !rightCalf && !neck) {
      Alert.alert('Error', 'Please enter at least one measurement');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: user.id,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          chest: chest ? parseFloat(chest) : null,
          waist: waist ? parseFloat(waist) : null,
          hips: hips ? parseFloat(hips) : null,
          left_arm: leftArm ? parseFloat(leftArm) : null,
          right_arm: rightArm ? parseFloat(rightArm) : null,
          left_thigh: leftThigh ? parseFloat(leftThigh) : null,
          right_thigh: rightThigh ? parseFloat(rightThigh) : null,
          left_calf: leftCalf ? parseFloat(leftCalf) : null,
          right_calf: rightCalf ? parseFloat(rightCalf) : null,
          neck: neck ? parseFloat(neck) : null,
        });

      if (error) {
        throw new Error('Failed to save measurements');
      }

      setHeight('');
      setWeight('');
      setChest('');
      setWaist('');
      setHips('');
      setLeftArm('');
      setRightArm('');
      setLeftThigh('');
      setRightThigh('');
      setLeftCalf('');
      setRightCalf('');
      setNeck('');

      fetchMeasurements();
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving measurements:', error);
      }
      Alert.alert('Error', 'Failed to save measurements');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const prepareChartData = (field: 'weight' | 'waist') => {
    const filtered = measurements
      .filter((m) => m[field] !== null)
      .reverse();

    if (filtered.length === 0) {
      return null;
    }

    const values = filtered.map((m) => m[field] as number);
    const labels = filtered.map((m) => {
      const date = new Date(m.created_at);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const maxDataPoints = 7;
    const step = Math.max(1, Math.floor(labels.length / maxDataPoints));
    const displayLabels = labels.filter((_, index) => index % step === 0);

    return {
      labels: displayLabels.length > 0 ? displayLabels : labels.slice(-maxDataPoints),
      datasets: [
        {
          data: values,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const weightChartData = prepareChartData('weight');
  const waistChartData = prepareChartData('waist');
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3b82f6',
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {weightChartData && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Weight Trend</Text>
          <LineChart
            data={weightChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
        </View>
      )}

      {waistChartData && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Waist Trend</Text>
          <LineChart
            data={waistChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
        </View>
      )}

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>New Measurement</Text>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (in)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chest (in)</Text>
            <TextInput
              style={styles.input}
              value={chest}
              onChangeText={setChest}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Waist (in)</Text>
            <TextInput
              style={styles.input}
              value={waist}
              onChangeText={setWaist}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hips (in)</Text>
            <TextInput
              style={styles.input}
              value={hips}
              onChangeText={setHips}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Neck (in)</Text>
            <TextInput
              style={styles.input}
              value={neck}
              onChangeText={setNeck}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Arms</Text>
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Left (in)</Text>
            <TextInput
              style={styles.input}
              value={leftArm}
              onChangeText={setLeftArm}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Right (in)</Text>
            <TextInput
              style={styles.input}
              value={rightArm}
              onChangeText={setRightArm}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Thighs</Text>
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Left (in)</Text>
            <TextInput
              style={styles.input}
              value={leftThigh}
              onChangeText={setLeftThigh}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Right (in)</Text>
            <TextInput
              style={styles.input}
              value={rightThigh}
              onChangeText={setRightThigh}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Calves</Text>
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Left (in)</Text>
            <TextInput
              style={styles.input}
              value={leftCalf}
              onChangeText={setLeftCalf}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Right (in)</Text>
            <TextInput
              style={styles.input}
              value={rightCalf}
              onChangeText={setRightCalf}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Measurements'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Measurement History</Text>

        {measurements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No measurements recorded yet</Text>
          </View>
        ) : (
          measurements.map((measurement) => (
            <View key={measurement.id} style={styles.measurementCard}>
              <View style={styles.measurementHeader}>
                <Text style={styles.measurementDate}>{formatDate(measurement.created_at)}</Text>
                <Text style={styles.measurementTime}>{formatTime(measurement.created_at)}</Text>
              </View>

              <View style={styles.measurementGrid}>
                {measurement.weight && (
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Weight</Text>
                    <Text style={styles.measurementValue}>{measurement.weight} lbs</Text>
                  </View>
                )}
                {measurement.waist && (
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Waist</Text>
                    <Text style={styles.measurementValue}>{measurement.waist} in</Text>
                  </View>
                )}
                {measurement.height && (
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Height</Text>
                    <Text style={styles.measurementValue}>{measurement.height} in</Text>
                  </View>
                )}
                {measurement.chest && (
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Chest</Text>
                    <Text style={styles.measurementValue}>{measurement.chest} in</Text>
                  </View>
                )}
                {measurement.hips && (
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Hips</Text>
                    <Text style={styles.measurementValue}>{measurement.hips} in</Text>
                  </View>
                )}
                {measurement.neck && (
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Neck</Text>
                    <Text style={styles.measurementValue}>{measurement.neck} in</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  chartSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    marginBottom: 24,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  measurementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  measurementDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  measurementTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  measurementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  measurementItem: {
    width: '30%',
  },
  measurementLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});
