import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

interface Profile {
  id: string;
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
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function RowDivider() {
  return <View style={styles.rowDivider} />;
}

function NavRow({
  label,
  onPress,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.navRow} onPress={onPress} activeOpacity={0.65}>
      <Text style={destructive ? styles.navRowLabelDestructive : styles.navRowLabel}>
        {label}
      </Text>
      <Text style={styles.navRowChevron}>›</Text>
    </TouchableOpacity>
  );
}

function SkeletonBlock({ width, height = 14 }: { width: number | string; height?: number }) {
  return (
    <View
      style={[
        styles.skeletonBlock,
        { width: width as any, height },
      ]}
    />
  );
}

export function SettingsScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<Profile>({
    id: '',
    name: '',
    height: '',
    weight: '',
    gender: '',
    age: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setProfile({
          id: data.id,
          name: data.name || '',
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          gender: data.gender || '',
          age: data.age?.toString() || '',
        });
      }
    } catch (err: any) {
      setError(err.message);
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
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name || null,
          height: profile.height ? parseFloat(profile.height) : null,
          weight: profile.weight ? parseFloat(profile.weight) : null,
          gender: profile.gender || null,
          age: profile.age ? parseInt(profile.age) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (error) throw error;
      setSuccess('Profile saved.');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const authEmail = user?.email ?? '';
  const memberSince = formatMemberSince(user?.created_at);
  const initials = getInitials(profile.name, authEmail);
  const displayName = profile.name.trim() || 'Your Name';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile Summary ── */}
      <View style={styles.profileCard}>
        {loading ? (
          <View style={styles.profileCardInner}>
            <SkeletonBlock width={64} height={64} />
            <View style={styles.profileCardText}>
              <SkeletonBlock width={140} height={16} />
              <View style={{ height: 6 }} />
              <SkeletonBlock width={180} height={13} />
              <View style={{ height: 6 }} />
              <SkeletonBlock width={110} height={12} />
            </View>
          </View>
        ) : (
          <View style={styles.profileCardInner}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileCardText}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{authEmail}</Text>
              {memberSince ? (
                <Text style={styles.profileMeta}>Member since {memberSince}</Text>
              ) : null}
            </View>
          </View>
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

      {/* ── Personal Details ── */}
      <SectionLabel title="Personal Details" />
      <View style={styles.card}>
        {loading ? (
          <View style={styles.skeletonForm}>
            {[160, 200, 80, 120, 100, 100].map((w, i) => (
              <View key={i} style={{ marginBottom: 20 }}>
                <SkeletonBlock width={70} height={11} />
                <View style={{ height: 6 }} />
                <SkeletonBlock width={w} height={42} />
              </View>
            ))}
          </View>
        ) : (
          <>
            <Field
              label="Name"
              placeholder="Add your name"
              value={profile.name}
              onChangeText={(t) => setProfile({ ...profile, name: t })}
              editable={!saving}
            />
            <Field
              label="Age"
              placeholder="—"
              value={profile.age}
              onChangeText={(t) => setProfile({ ...profile, age: t })}
              keyboardType="numeric"
              editable={!saving}
            />
            <Field
              label="Gender"
              placeholder="—"
              value={profile.gender}
              onChangeText={(t) => setProfile({ ...profile, gender: t })}
              editable={!saving}
            />
            <Field
              label="Height (inches)"
              placeholder="—"
              value={profile.height}
              onChangeText={(t) => setProfile({ ...profile, height: t })}
              keyboardType="numeric"
              editable={!saving}
            />
            <Field
              label="Weight (lbs)"
              placeholder="—"
              value={profile.weight}
              onChangeText={(t) => setProfile({ ...profile, weight: t })}
              keyboardType="numeric"
              editable={!saving}
              last
            />
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
          </>
        )}
      </View>

      {/* ── Privacy & Legal ── */}
      <SectionLabel title="Privacy & Legal" />
      <View style={styles.card}>
        <NavRow label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy' as never)} />
        <RowDivider />
        <NavRow label="Terms of Use" onPress={() => navigation.navigate('TermsOfUse' as never)} />
        <RowDivider />
        <NavRow label="Support & Contact" onPress={() => navigation.navigate('Support' as never)} />
      </View>

      {/* ── Account ── */}
      <SectionLabel title="Account" />
      <View style={styles.card}>
        <NavRow
          label="Delete Account"
          onPress={() => navigation.navigate('DeleteAccount' as never)}
          destructive
        />
      </View>

      {/* ── Sign Out ── */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={signOut}
        activeOpacity={0.8}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* ── App Version ── */}
      <Text style={styles.versionText}>Beluga Fit · Version {APP_VERSION}</Text>
    </ScrollView>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  editable?: boolean;
  last?: boolean;
};

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  editable = true,
  last = false,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.fieldGroup, last && { marginBottom: 0 }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, focused && styles.fieldInputFocused]}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // ── Profile card ──
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 20,
  },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  profileCardText: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 3,
  },
  profileMeta: {
    fontSize: 12,
    color: '#94a3b8',
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
    paddingVertical: 4,
    marginBottom: 24,
  },

  // ── Nav rows ──
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  navRowLabel: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  navRowLabelDestructive: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '500',
  },
  navRowChevron: {
    fontSize: 20,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
  },

  // ── Form fields ──
  skeletonForm: {
    paddingVertical: 8,
  },
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
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
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

  // ── Sign out ──
  signOutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },

  // ── Version ──
  versionText: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // ── Skeleton ──
  skeletonBlock: {
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
});
