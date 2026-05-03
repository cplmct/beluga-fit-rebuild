import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProfileData {
  name: string;
  height: string;
  weight: string;
  gender: string;
  age: string;
}

function getInitials(name: string, email: string): string {
  if (name?.trim()) return name.trim()[0].toUpperCase();
  if (email?.trim()) return email.trim()[0].toUpperCase();
  return '?';
}

function formatMemberSince(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function formatLastActive(dateStr: string | null): string {
  if (!dateStr) return 'No workouts yet';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
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
      }}
    />
  );
}

function InfoRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, muted && styles.infoValueMuted]}>{value}</Text>
    </View>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
  editable = true,
  last = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  editable?: boolean;
  last?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.fieldGroup, last && { marginBottom: 0 }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          focused && styles.fieldInputFocused,
          !editable && styles.fieldInputDisabled,
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? '—'}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

export function ProfileScreen() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    height: '',
    weight: '',
    gender: '',
    age: '',
  });
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authEmail = user?.email ?? '';
  const memberSince = formatMemberSince(user?.created_at);
  const initials = getInitials(profile.name, authEmail);
  const displayName = profile.name.trim() || authEmail.split('@')[0] || 'Your Name';

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    if (!user) return;
    try {
      const [profileRes, workoutRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase
          .from('workouts')
          .select('date')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (profileRes.data) {
        setProfile({
          name: profileRes.data.name || '',
          height: profileRes.data.height?.toString() || '',
          weight: profileRes.data.weight?.toString() || '',
          gender: profileRes.data.gender || '',
          age: profileRes.data.age?.toString() || '',
        });
      }

      setLastWorkoutDate(workoutRes.data?.date ?? null);
    } catch (err: any) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: profile.name.trim() || null,
          height: profile.height ? parseFloat(profile.height) : null,
          weight: profile.weight ? parseFloat(profile.weight) : null,
          gender: profile.gender.trim() || null,
          age: profile.age ? parseInt(profile.age, 10) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      setSuccess('Profile saved.');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
        {/* ── Hero / Avatar ── */}
        <View style={styles.hero}>
          {loading ? (
            <>
              <SkeletonBlock width={84} height={84} radius={42} />
              <View style={{ height: 14 }} />
              <SkeletonBlock width={140} height={18} radius={8} />
              <View style={{ height: 8 }} />
              <SkeletonBlock width={180} height={13} radius={6} />
            </>
          ) : (
            <>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{initials}</Text>
              </View>
              <Text style={styles.heroName}>{displayName}</Text>
              <Text style={styles.heroEmail}>{authEmail}</Text>
            </>
          )}
        </View>

        {/* ── Feedback banners ── */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}
        {success ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{success}</Text>
          </View>
        ) : null}

        {/* ── Edit Profile ── */}
        <SectionLabel title="Edit Profile" />
        <View style={styles.card}>
          {loading ? (
            <View style={{ gap: 16, paddingVertical: 8 }}>
              {[180, 140, 100].map((w, i) => (
                <View key={i} style={{ gap: 6 }}>
                  <SkeletonBlock width={70} height={11} />
                  <SkeletonBlock width={w} height={42} radius={10} />
                </View>
              ))}
            </View>
          ) : (
            <>
              <FieldInput
                label="Display Name"
                value={profile.name}
                onChange={(t) => setProfile((p) => ({ ...p, name: t }))}
                placeholder="Add your name"
                editable={!saving}
              />
              <FieldInput
                label="Email"
                value={authEmail}
                onChange={() => {}}
                editable={false}
              />
              <View style={styles.emailNote}>
                <Text style={styles.emailNoteText}>
                  Email cannot be changed here. Contact support if needed.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── Physical Stats ── */}
        <SectionLabel title="Physical Stats" />
        <View style={styles.card}>
          {loading ? (
            <View style={{ gap: 16, paddingVertical: 8 }}>
              {[80, 100, 120, 90].map((w, i) => (
                <View key={i} style={{ gap: 6 }}>
                  <SkeletonBlock width={80} height={11} />
                  <SkeletonBlock width={w} height={42} radius={10} />
                </View>
              ))}
            </View>
          ) : (
            <>
              <FieldInput
                label="Height (inches)"
                value={profile.height}
                onChange={(t) => setProfile((p) => ({ ...p, height: t }))}
                keyboardType="numeric"
                editable={!saving}
              />
              <FieldInput
                label="Weight (lbs)"
                value={profile.weight}
                onChange={(t) => setProfile((p) => ({ ...p, weight: t }))}
                keyboardType="numeric"
                editable={!saving}
              />
              <FieldInput
                label="Age"
                value={profile.age}
                onChange={(t) => setProfile((p) => ({ ...p, age: t }))}
                keyboardType="numeric"
                editable={!saving}
              />
              <FieldInput
                label="Gender"
                value={profile.gender}
                onChange={(t) => setProfile((p) => ({ ...p, gender: t }))}
                editable={!saving}
                last
              />
            </>
          )}
        </View>

        {/* ── Save button ── */}
        {!loading && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

        {/* ── Account Details ── */}
        <SectionLabel title="Account Details" />
        <View style={[styles.card, styles.cardRows]}>
          {loading ? (
            <View style={{ gap: 14, paddingVertical: 8 }}>
              {[150, 130, 110].map((w, i) => (
                <SkeletonBlock key={i} width={w} height={14} />
              ))}
            </View>
          ) : (
            <>
              <InfoRow label="Email" value={authEmail} />
              <View style={styles.rowDivider} />
              {memberSince ? (
                <>
                  <InfoRow label="Member since" value={memberSince} />
                  <View style={styles.rowDivider} />
                </>
              ) : null}
              <InfoRow
                label="Last active"
                value={formatLastActive(lastWorkoutDate)}
                muted={!lastWorkoutDate}
              />
            </>
          )}
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarLargeText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // ── Banners ──
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#dc2626',
    lineHeight: 19,
  },
  successBanner: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  successBannerText: {
    fontSize: 13,
    color: '#15803d',
    lineHeight: 19,
  },

  // ── Section label ──
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  // ── Card ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    marginBottom: 24,
  },
  cardRows: {
    paddingTop: 4,
    paddingBottom: 4,
  },

  // ── Form fields ──
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  fieldInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0f172a',
  },
  fieldInputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
  },
  fieldInputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    borderColor: '#e2e8f0',
  },

  // ── Email note ──
  emailNote: {
    marginTop: -4,
    marginBottom: 12,
  },
  emailNoteText: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 15,
  },

  // ── Save button ──
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 28,
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

  // ── Info rows ──
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    maxWidth: '60%',
    textAlign: 'right',
  },
  infoValueMuted: {
    color: '#94a3b8',
    fontWeight: '500',
  },
});
