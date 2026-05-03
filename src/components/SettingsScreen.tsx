import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';
import { useUnits } from '../contexts/UnitsContext';
import { supabase } from '../lib/supabase';
import { getPrefs, formatTime, NotifPrefs, DEFAULT_PREFS } from '../utils/notifications';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

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

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function RowDivider() {
  return <View style={styles.rowDivider} />;
}

function NavRow({
  label,
  sub,
  onPress,
  destructive = false,
  rightElement,
}: {
  label: string;
  sub?: string;
  onPress: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.navRow} onPress={onPress} activeOpacity={0.65}>
      <View style={styles.navRowLeft}>
        <Text style={destructive ? styles.navRowLabelDestructive : styles.navRowLabel}>
          {label}
        </Text>
        {sub ? <Text style={styles.navRowSub}>{sub}</Text> : null}
      </View>
      <View style={styles.navRowRight}>
        {rightElement ?? null}
        <Text style={styles.navRowChevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
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
      style={{ width: width as any, height, borderRadius: radius, backgroundColor: '#f1f5f9' }}
    />
  );
}

export function SettingsScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { unitSystem, updateUnitSystem } = useUnits();

  const [profileName, setProfileName] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({ ...DEFAULT_PREFS });

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      getPrefs().then(setNotifPrefs);
    }, [])
  );

  const loadProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();
      setProfileName(data?.name || '');
    } catch {
      // ignore — profile card will still show email initial
    } finally {
      setProfileLoading(false);
    }
  };

  const authEmail = user?.email ?? '';
  const memberSince = formatMemberSince(user?.created_at);
  const initials = getInitials(profileName, authEmail);
  const displayName = profileName.trim() || authEmail.split('@')[0] || 'Your Profile';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile card ── */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => navigation.navigate('Profile' as never)}
        activeOpacity={0.78}
      >
        <View style={styles.profileCardInner}>
          {profileLoading ? (
            <>
              <SkeletonBlock width={56} height={56} radius={28} />
              <View style={styles.profileCardText}>
                <SkeletonBlock width={130} height={15} />
                <View style={{ height: 6 }} />
                <SkeletonBlock width={170} height={12} />
                <View style={{ height: 5 }} />
                <SkeletonBlock width={100} height={11} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileCardText}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>{authEmail}</Text>
                {memberSince ? (
                  <Text style={styles.profileMeta}>Member since {memberSince}</Text>
                ) : null}
              </View>
            </>
          )}
          <Text style={styles.profileChevron}>›</Text>
        </View>
      </TouchableOpacity>

      {/* ── Preferences ── */}
      <SectionLabel title="Preferences" />
      <View style={styles.card}>
        <View style={styles.navRow}>
          <View style={styles.navRowLeft}>
            <Text style={styles.navRowLabel}>Unit System</Text>
            <Text style={styles.navRowSub}>
              {unitSystem === 'metric' ? 'Metric — weights in kg, measurements in cm' : 'Imperial — weights in lbs, measurements in in'}
            </Text>
          </View>
          <View style={styles.unitToggleRow}>
            <TouchableOpacity
              style={[styles.unitOption, unitSystem === 'metric' && styles.unitOptionActive]}
              onPress={() => updateUnitSystem('metric')}
              activeOpacity={0.75}
            >
              <Text style={[styles.unitOptionText, unitSystem === 'metric' && styles.unitOptionTextActive]}>
                kg
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitOption, unitSystem === 'imperial' && styles.unitOptionActive]}
              onPress={() => updateUnitSystem('imperial')}
              activeOpacity={0.75}
            >
              <Text style={[styles.unitOptionText, unitSystem === 'imperial' && styles.unitOptionTextActive]}>
                lbs
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Notifications ── */}
      <SectionLabel title="Notifications" />
      <View style={styles.card}>
        <NavRow
          label="Daily Reminders"
          sub={
            notifPrefs.enabled
              ? `Every day at ${formatTime(notifPrefs.hour, notifPrefs.minute)}`
              : 'Off'
          }
          onPress={() => navigation.navigate('NotificationSettings' as never)}
          rightElement={
            notifPrefs.enabled ? <View style={styles.activeIndicator} /> : undefined
          }
        />
      </View>

      {/* ── Privacy & Legal ── */}
      <SectionLabel title="Privacy & Legal" />
      <View style={styles.card}>
        <NavRow
          label="Privacy Policy"
          onPress={() => navigation.navigate('PrivacyPolicy' as never)}
        />
        <RowDivider />
        <NavRow
          label="Terms of Use"
          onPress={() => navigation.navigate('TermsOfUse' as never)}
        />
        <RowDivider />
        <NavRow
          label="Support & Contact"
          onPress={() => navigation.navigate('Support' as never)}
        />
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

      {/* ── Help ── */}
      <SectionLabel title="Help" />
      <View style={styles.card}>
        <NavRow
          label="Getting Started"
          onPress={() => navigation.navigate('GettingStarted' as never)}
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
    padding: 16,
    marginBottom: 24,
  },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  profileCardText: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  profileMeta: {
    fontSize: 11,
    color: '#94a3b8',
  },
  profileChevron: {
    fontSize: 22,
    color: '#cbd5e1',
    lineHeight: 26,
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
  navRowLeft: {
    flex: 1,
  },
  navRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navRowLabel: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  navRowSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
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
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
  },

  // ── Sign out ──
  signOutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },

  // ── Unit toggle ──
  unitToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  unitOption: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  unitOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  unitOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  unitOptionTextActive: {
    color: '#ffffff',
  },

  // ── Version ──
  versionText: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
