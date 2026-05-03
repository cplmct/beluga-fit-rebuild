import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AccountStats {
  totalWorkouts: number;
  daysActive: number;
  lastMeasurementDate: string | null;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RowDivider() {
  return <View style={styles.rowDivider} />;
}

const DATA_DELETED = [
  'Profile and personal information',
  'All workout history and session logs',
  'Body measurement records',
  'Active workout plan and progress',
  'All other account data',
];

export function DeleteAccountScreen() {
  const navigation = useNavigation();
  const { user, deleteAccount } = useAuth();

  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<AccountStats>({
    totalWorkouts: 0,
    daysActive: 0,
    lastMeasurementDate: null,
  });

  const [phase, setPhase] = useState<'review' | 'confirm'>('review');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const authEmail = user?.email ?? '';
  const emailMatches = confirmEmail.trim().toLowerCase() === authEmail.toLowerCase();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const [workoutsRes, measurementsRes] = await Promise.all([
        supabase
          .from('workouts')
          .select('date')
          .eq('user_id', user.id),
        supabase
          .from('body_measurements')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const workouts = workoutsRes.data || [];
      const daysActive = new Set(
        workouts.map((w) => (w.date as string).split('T')[0])
      ).size;

      setStats({
        totalWorkouts: workouts.length,
        daysActive,
        lastMeasurementDate: measurementsRes.data?.created_at ?? null,
      });
    } catch (err) {
      if (__DEV__) console.error('[DeleteAccount] fetchStats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleContinueToConfirm = () => {
    setConfirmEmail('');
    setError('');
    setPhase('confirm');
  };

  const handleCancelConfirm = () => {
    setError('');
    setConfirmEmail('');
    setPhase('review');
  };

  const handleDelete = async () => {
    if (!emailMatches) return;

    if (__DEV__) console.log('[DeleteAccount] deletion initiated (email withheld)');

    setDeleting(true);
    setError('');

    const { error: deleteError } = await deleteAccount();

    if (deleteError) {
      setError(deleteError.message || 'Something went wrong. Please try again.');
      setDeleting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Warning card ── */}
        <View style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <Text style={styles.warningIconText}>!</Text>
          </View>
          <Text style={styles.warningTitle}>This action is permanent</Text>
          <Text style={styles.warningBody}>
            Deleting your account immediately removes all your data. This cannot be undone and there is no recovery option.
          </Text>
        </View>

        {/* ── Stats summary ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Your account data</Text>

          {statsLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator color="#2563eb" size="small" />
              <Text style={styles.statsLoadingText}>Loading your data summary...</Text>
            </View>
          ) : (
            <View style={styles.statsRow}>
              <StatItem
                label="Workouts logged"
                value={stats.totalWorkouts.toString()}
              />
              <View style={styles.statDivider} />
              <StatItem
                label="Days active"
                value={stats.daysActive.toString()}
              />
              <View style={styles.statDivider} />
              <StatItem
                label="Last measurement"
                value={
                  stats.lastMeasurementDate
                    ? formatDate(stats.lastMeasurementDate)
                    : 'None'
                }
              />
            </View>
          )}
        </View>

        {/* ── Account email display ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Account to be deleted</Text>
          <Text style={styles.emailDisplay}>{authEmail}</Text>
        </View>

        {/* ── What gets deleted ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>The following will be permanently deleted</Text>
          {DATA_DELETED.map((item, i) => (
            <View key={i}>
              <View style={styles.dataRow}>
                <View style={styles.dataBullet} />
                <Text style={styles.dataItem}>{item}</Text>
              </View>
              {i < DATA_DELETED.length - 1 ? <RowDivider /> : null}
            </View>
          ))}
        </View>

        {/* ── Error banner ── */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Phase 1: Review actions ── */}
        {phase === 'review' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.destructiveButton}
              onPress={handleContinueToConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.destructiveButtonText}>Continue to Delete Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel — Keep My Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Phase 2: Email confirmation ── */}
        {phase === 'confirm' && (
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Type your email to confirm</Text>
            <Text style={styles.confirmBody}>
              Enter{' '}
              <Text style={styles.confirmEmailHint}>{authEmail}</Text>
              {' '}to permanently delete your account.
            </Text>

            <TextInput
              style={[
                styles.confirmInput,
                emailMatches && styles.confirmInputValid,
              ]}
              placeholder="Your email address"
              placeholderTextColor="#94a3b8"
              value={confirmEmail}
              onChangeText={setConfirmEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!deleting}
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.destructiveButton,
                (!emailMatches || deleting) && styles.destructiveButtonDisabled,
              ]}
              onPress={handleDelete}
              disabled={!emailMatches || deleting}
              activeOpacity={0.85}
            >
              {deleting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.destructiveButtonText}>Deleting account...</Text>
                </View>
              ) : (
                <Text style={styles.destructiveButtonText}>Permanently Delete Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelConfirm}
              disabled={deleting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel — Keep My Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },

  // ── Warning card ──
  warningCard: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  warningIconText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningBody: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
  },

  // ── Generic card ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 14,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
    marginVertical: 2,
  },

  // ── Stats ──
  statsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  statsLoadingText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 15,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },

  // ── Email display ──
  emailDisplay: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: -0.2,
  },

  // ── Data list ──
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  dataBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dc2626',
    marginRight: 12,
    flexShrink: 0,
  },
  dataItem: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
    flex: 1,
  },

  // ── Error ──
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    lineHeight: 19,
  },

  // ── Actions ──
  actions: {
    gap: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  destructiveButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  destructiveButtonDisabled: {
    backgroundColor: '#f87171',
  },
  destructiveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
  },

  // ── Confirm card (phase 2) ──
  confirmCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 20,
    gap: 14,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  confirmBody: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 21,
  },
  confirmEmailHint: {
    fontWeight: '700',
    color: '#0f172a',
  },
  confirmInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  confirmInputValid: {
    borderColor: '#dc2626',
    backgroundColor: '#fff5f5',
  },
});
