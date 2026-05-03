import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
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

function SkeletonBlock({
  width,
  height = 14,
  radius = 6,
}: {
  width: number | string;
  height?: number;
  radius?: number;
}) {
  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius: radius,
        backgroundColor: '#f1f5f9',
        marginBottom: 4,
      }}
    />
  );
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
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchMeasurements();
    }, [])
  );

  const fetchMeasurements = async () => {
    try {
      setLoadError('');
      if (!user) return;

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (err: any) {
      setLoadError("Couldn't load your measurements. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const hasAny =
      height || weight || chest || waist || hips || leftArm || rightArm ||
      leftThigh || rightThigh || leftCalf || rightCalf || neck;

    if (!hasAny) {
      setSaveError('Enter at least one measurement before saving.');
      return;
    }

    setSaveError('');
    setSaving(true);

    try {
      const { error } = await supabase.from('body_measurements').insert({
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

      if (error) throw error;

      setHeight(''); setWeight(''); setChest(''); setWaist('');
      setHips(''); setLeftArm(''); setRightArm(''); setLeftThigh('');
      setRightThigh(''); setLeftCalf(''); setRightCalf(''); setNeck('');

      Alert.alert('Saved', 'Your measurements have been recorded.');
      fetchMeasurements();
    } catch (err: any) {
      setSaveError("Couldn't save your measurements. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const prepareChartData = (field: 'weight' | 'waist') => {
    const filtered = measurements.filter((m) => m[field] !== null).reverse();
    if (filtered.length < 2) return null;

    const values = filtered.map((m) => m[field] as number);
    const labels = filtered.map((m) => {
      const d = new Date(m.created_at);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const maxPoints = 7;
    const step = Math.max(1, Math.floor(labels.length / maxPoints));
    const displayLabels = labels.filter((_, i) => i % step === 0);

    return {
      labels: displayLabels.length > 0 ? displayLabels : labels.slice(-maxPoints),
      datasets: [
        {
          data: values,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: { borderRadius: 12 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#2563eb' },
  };

  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.skeletonCard}>
          <SkeletonBlock width={160} height={20} radius={8} />
          <View style={{ height: 16 }} />
          <SkeletonBlock width="100%" height={180} radius={10} />
        </View>
        <View style={styles.skeletonCard}>
          <SkeletonBlock width={140} height={20} radius={8} />
          <View style={{ height: 20 }} />
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <SkeletonBlock width="48%" height={56} radius={10} />
              <SkeletonBlock width="48%" height={56} radius={10} />
            </View>
          ))}
          <SkeletonBlock width="100%" height={52} radius={10} />
        </View>
      </ScrollView>
    );
  }

  const weightChartData = prepareChartData('weight');
  const waistChartData = prepareChartData('waist');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Load error ── */}
      {loadError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{loadError}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); fetchMeasurements(); }}>
            <Text style={styles.errorBannerAction}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── Charts ── */}
      {weightChartData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weight Trend</Text>
          <LineChart
            data={weightChartData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines
            withVerticalLabels
            withHorizontalLabels
          />
        </View>
      )}

      {waistChartData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Waist Trend</Text>
          <LineChart
            data={waistChartData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines
            withVerticalLabels
            withHorizontalLabels
          />
        </View>
      )}

      {/* ── Form ── */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>New Measurement</Text>

        {saveError ? (
          <View style={styles.saveBanner}>
            <Text style={styles.saveBannerText}>{saveError}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <MeasurementField label="Height (in)" value={height} onChange={setHeight} />
          <MeasurementField label="Weight (lbs)" value={weight} onChange={setWeight} />
        </View>
        <View style={styles.row}>
          <MeasurementField label="Chest (in)" value={chest} onChange={setChest} />
          <MeasurementField label="Waist (in)" value={waist} onChange={setWaist} />
        </View>
        <View style={styles.row}>
          <MeasurementField label="Hips (in)" value={hips} onChange={setHips} />
          <MeasurementField label="Neck (in)" value={neck} onChange={setNeck} />
        </View>

        <Text style={styles.subLabel}>Arms</Text>
        <View style={styles.row}>
          <MeasurementField label="Left (in)" value={leftArm} onChange={setLeftArm} />
          <MeasurementField label="Right (in)" value={rightArm} onChange={setRightArm} />
        </View>

        <Text style={styles.subLabel}>Thighs</Text>
        <View style={styles.row}>
          <MeasurementField label="Left (in)" value={leftThigh} onChange={setLeftThigh} />
          <MeasurementField label="Right (in)" value={rightThigh} onChange={setRightThigh} />
        </View>

        <Text style={styles.subLabel}>Calves</Text>
        <View style={styles.row}>
          <MeasurementField label="Left (in)" value={leftCalf} onChange={setLeftCalf} />
          <MeasurementField label="Right (in)" value={rightCalf} onChange={setRightCalf} />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Measurements</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── History ── */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Measurement History</Text>

        {measurements.length === 0 ? (
          <View style={styles.historyEmpty}>
            <View style={styles.historyEmptyIconRing}>
              <View style={styles.historyEmptyIconDot} />
            </View>
            <Text style={styles.historyEmptyTitle}>No measurements recorded yet</Text>
            <Text style={styles.historyEmptySub}>
              Use the form above to log your first measurement. Tracking over time helps you see real progress.
            </Text>
          </View>
        ) : (
          measurements.map((m) => (
            <View key={m.id} style={styles.measurementCard}>
              <View style={styles.measurementHeader}>
                <Text style={styles.measurementDate}>{formatDate(m.created_at)}</Text>
                <Text style={styles.measurementTime}>{formatTime(m.created_at)}</Text>
              </View>
              <View style={styles.measurementGrid}>
                {m.weight != null && (
                  <MeasurementItem label="Weight" value={`${m.weight} lbs`} />
                )}
                {m.waist != null && (
                  <MeasurementItem label="Waist" value={`${m.waist} in`} />
                )}
                {m.height != null && (
                  <MeasurementItem label="Height" value={`${m.height} in`} />
                )}
                {m.chest != null && (
                  <MeasurementItem label="Chest" value={`${m.chest} in`} />
                )}
                {m.hips != null && (
                  <MeasurementItem label="Hips" value={`${m.hips} in`} />
                )}
                {m.neck != null && (
                  <MeasurementItem label="Neck" value={`${m.neck} in`} />
                )}
                {m.left_arm != null && (
                  <MeasurementItem label="L. Arm" value={`${m.left_arm} in`} />
                )}
                {m.right_arm != null && (
                  <MeasurementItem label="R. Arm" value={`${m.right_arm} in`} />
                )}
                {m.left_thigh != null && (
                  <MeasurementItem label="L. Thigh" value={`${m.left_thigh} in`} />
                )}
                {m.right_thigh != null && (
                  <MeasurementItem label="R. Thigh" value={`${m.right_thigh} in`} />
                )}
                {m.left_calf != null && (
                  <MeasurementItem label="L. Calf" value={`${m.left_calf} in`} />
                )}
                {m.right_calf != null && (
                  <MeasurementItem label="R. Calf" value={`${m.right_calf} in`} />
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function MeasurementField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        value={value}
        onChangeText={onChange}
        placeholder="—"
        keyboardType="numeric"
        placeholderTextColor="#94a3b8"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

function MeasurementItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.measurementItem}>
      <Text style={styles.measurementLabel}>{label}</Text>
      <Text style={styles.measurementValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },

  // ── Skeleton ──
  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 20,
  },

  // ── Error banner ──
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    fontSize: 13,
    color: '#dc2626',
    flex: 1,
    lineHeight: 18,
  },
  errorBannerAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
    marginLeft: 12,
  },
  saveBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  saveBannerText: {
    fontSize: 13,
    color: '#dc2626',
    lineHeight: 18,
  },

  // ── Charts ──
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 4,
    borderRadius: 10,
  },

  // ── Form ──
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
    marginBottom: 16,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0f172a',
  },
  inputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // ── History ──
  historySection: {
    marginBottom: 20,
  },
  historyEmpty: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 32,
    alignItems: 'center',
  },
  historyEmptyIconRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  historyEmptyIconDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#cbd5e1',
  },
  historyEmptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  historyEmptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 19,
  },

  // ── Measurement cards ──
  measurementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  measurementDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  measurementTime: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  measurementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  measurementItem: {
    width: '30%',
  },
  measurementLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  measurementValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
});
