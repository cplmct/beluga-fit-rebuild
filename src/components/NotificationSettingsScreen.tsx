import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  NotifPrefs,
  ReminderType,
  getPrefs,
  savePrefs,
  hasLocalPrefs,
  scheduleDaily,
  cancelAll,
  cancelInactivityReminder,
  scheduleInactivityReminder,
  requestPermission,
  getPermissionStatus,
  formatTime,
  reminderTypeLabel,
  DEFAULT_PREFS,
} from '../utils/notifications';

const REMINDER_TYPES: { key: ReminderType; label: string; description: string }[] = [
  {
    key: 'checkin',
    label: 'Daily check-in',
    description: 'A calm nudge asking if you trained today',
  },
  {
    key: 'move',
    label: 'Time to move',
    description: 'A light prompt to get some movement in',
  },
  {
    key: 'motivation',
    label: 'Gym motivation',
    description: 'A short motivational quote for your session',
  },
  {
    key: 'random',
    label: 'Random rotation',
    description: 'Rotates through all message types each day',
  },
];

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function RowDivider() {
  return <View style={styles.rowDivider} />;
}

function TimeStep({
  label,
  value,
  onDecrement,
  onIncrement,
  display,
  disabled,
}: {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  display: string;
  disabled: boolean;
}) {
  return (
    <View style={styles.timeStepper}>
      <Text style={styles.timeStepLabel}>{label}</Text>
      <View style={styles.timeStepRow}>
        <TouchableOpacity
          style={[styles.timeStepBtn, disabled && styles.timeStepBtnDisabled]}
          onPress={onDecrement}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.timeStepBtnText, disabled && styles.timeStepBtnTextDisabled]}>−</Text>
        </TouchableOpacity>
        <Text style={[styles.timeStepValue, disabled && styles.timeStepValueDisabled]}>
          {display}
        </Text>
        <TouchableOpacity
          style={[styles.timeStepBtn, disabled && styles.timeStepBtnDisabled]}
          onPress={onIncrement}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.timeStepBtnText, disabled && styles.timeStepBtnTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function NotificationSettingsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotifPrefs>({ ...DEFAULT_PREFS });
  const [permStatus, setPermStatus] = useState<'granted' | 'denied' | 'unavailable' | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadPrefs();
    }, [])
  );

  // Push prefs to Supabase in the background (non-blocking).
  // Allows the same time/style settings to be restored on a new device install.
  const syncPrefsToCloud = (updated: NotifPrefs) => {
    if (!user) return;
    supabase
      .from('profiles')
      .upsert(
        {
          id:            user.id,
          notif_enabled: updated.enabled,
          notif_hour:    updated.hour,
          notif_minute:  updated.minute,
          notif_type:    updated.type,
        },
        { onConflict: 'id' }
      )
      .then(({ error }) => {
        if (error && __DEV__) console.warn('[Notif] Cloud sync failed:', error.message);
      });
  };

  const loadPrefs = async () => {
    setLoading(true);
    const [stored, perm, hadLocal] = await Promise.all([
      getPrefs(),
      getPermissionStatus(),
      hasLocalPrefs(),
    ]);
    setPermStatus(perm);
    if (__DEV__) {
      console.log('[NotifSettings] permStatus:', perm);
      console.log('[NotifSettings] inactivity toggle: always enabled (pref is local; scheduling guards on Device.isDevice + permission)');
    }

    if (!hadLocal && user) {
      // No local prefs yet — check Supabase to restore from another device
      try {
        const { data } = await supabase
          .from('profiles')
          .select('notif_enabled, notif_hour, notif_minute, notif_type')
          .eq('id', user.id)
          .maybeSingle();

        if (data !== null) {
          const cloudPrefs: NotifPrefs = {
            enabled:           data.notif_enabled ?? DEFAULT_PREFS.enabled,
            hour:              data.notif_hour    ?? DEFAULT_PREFS.hour,
            minute:            data.notif_minute  ?? DEFAULT_PREFS.minute,
            type:              (data.notif_type as ReminderType) ?? DEFAULT_PREFS.type,
            inactivityEnabled: DEFAULT_PREFS.inactivityEnabled,
          };
          // Cache locally so subsequent opens are instant
          await savePrefs(cloudPrefs);
          // Re-schedule if the user had notifications enabled on their old device
          if (cloudPrefs.enabled) {
            await scheduleDaily(cloudPrefs);
          }
          setPrefs(cloudPrefs);
          setLoading(false);
          return;
        }
      } catch {
        // Cloud fallback failed — fall through to local defaults
      }
    }

    setPrefs(stored);
    setLoading(false);
  };

  const applyPrefs = async (updated: NotifPrefs) => {
    setSaving(true);
    await savePrefs(updated);
    syncPrefsToCloud(updated);

    if (updated.enabled) {
      const ok = await scheduleDaily(updated);
      if (!ok) {
        setPermStatus('denied');
        const fixed = { ...updated, enabled: false };
        await savePrefs(fixed);
        syncPrefsToCloud(fixed);
        setPrefs(fixed);
        setSaving(false);
        return;
      }
    } else {
      await cancelAll();
    }
    setPrefs(updated);
    setSaving(false);
  };

  const persistPrefs = (updated: NotifPrefs) => {
    savePrefs(updated);
    syncPrefsToCloud(updated);
  };

  const handleToggle = async (val: boolean) => {
    if (val && permStatus === 'denied') {
      const result = await requestPermission();
      setPermStatus(result);
      if (result !== 'granted') return;
    }
    await applyPrefs({ ...prefs, enabled: val });
  };

  const handleHourChange = (delta: number) => {
    const h = ((prefs.hour + delta) + 24) % 24;
    const updated = { ...prefs, hour: h };
    setPrefs(updated);
    if (prefs.enabled) applyPrefs(updated);
    else persistPrefs(updated);
  };

  const handleMinuteChange = (delta: number) => {
    const m = ((prefs.minute + delta) + 60) % 60;
    const updated = { ...prefs, minute: m };
    setPrefs(updated);
    if (prefs.enabled) applyPrefs(updated);
    else persistPrefs(updated);
  };

  const handleTypeChange = (type: ReminderType) => {
    const updated = { ...prefs, type };
    setPrefs(updated);
    if (prefs.enabled) applyPrefs(updated);
    else persistPrefs(updated);
  };

  const handleInactivityToggle = async (val: boolean) => {
    const updated = { ...prefs, inactivityEnabled: val };
    setPrefs(updated);
    await savePrefs(updated);
    if (val) {
      if (user?.id) await scheduleInactivityReminder(user.id);
    } else {
      await cancelInactivityReminder();
    }
  };

  const openDeviceSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const period = prefs.hour >= 12 ? 'PM' : 'AM';
  const hour12 = prefs.hour % 12 === 0 ? 12 : prefs.hour % 12;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Permission denied banner ── */}
      {permStatus === 'denied' && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionBannerTitle}>Notifications are blocked</Text>
          <Text style={styles.permissionBannerBody}>
            To enable daily reminders, allow notifications for Beluga Fit in your device settings.
          </Text>
          <TouchableOpacity
            style={styles.permissionBannerButton}
            onPress={openDeviceSettings}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionBannerButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {permStatus === 'unavailable' && (
        <View style={styles.unavailableBanner}>
          <Text style={styles.unavailableText}>
            Local notifications are not supported in this environment. They will work correctly on a physical Android or iOS device.
          </Text>
        </View>
      )}

      {/* ── Master toggle ── */}
      <SectionLabel title="Daily Reminders" />
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Text style={styles.toggleLabel}>Enable daily reminders</Text>
            <Text style={styles.toggleSub}>
              {prefs.enabled
                ? `Scheduled every day at ${formatTime(prefs.hour, prefs.minute)}`
                : 'Off — no notifications will be sent'}
            </Text>
          </View>
          {saving ? (
            <ActivityIndicator color="#2563eb" size="small" />
          ) : (
            <Switch
              value={prefs.enabled}
              onValueChange={handleToggle}
              trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
              thumbColor={prefs.enabled ? '#ffffff' : '#f1f5f9'}
              disabled={saving || permStatus === 'unavailable'}
            />
          )}
        </View>
      </View>

      {/* ── Inactivity reminders ── */}
      <SectionLabel title="Inactivity Reminders" />
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Text style={styles.toggleLabel}>Inactivity reminders</Text>
            <Text style={styles.toggleSub}>
              {permStatus === 'unavailable'
                ? 'Preference saved — scheduling requires a physical device'
                : "Remind me if I haven't trained in 2 days"}
            </Text>
          </View>
          <Switch
            value={prefs.inactivityEnabled ?? true}
            onValueChange={handleInactivityToggle}
            trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
            thumbColor={(prefs.inactivityEnabled ?? true) ? '#ffffff' : '#f1f5f9'}
          />
        </View>
      </View>

      {/* ── Time picker ── */}
      <SectionLabel title="Reminder Time" />
      <View style={[styles.card, styles.cardPadded]}>
        <Text style={styles.timePreview}>{formatTime(prefs.hour, prefs.minute)}</Text>
        <Text style={styles.timePreviewSub}>Every day at this time</Text>

        <View style={styles.timePickerRow}>
          <TimeStep
            label="Hour"
            value={prefs.hour}
            display={String(hour12).padStart(2, '0')}
            onDecrement={() => handleHourChange(-1)}
            onIncrement={() => handleHourChange(1)}
            disabled={saving}
          />
          <Text style={styles.timeColon}>:</Text>
          <TimeStep
            label="Min"
            value={prefs.minute}
            display={String(prefs.minute).padStart(2, '0')}
            onDecrement={() => handleMinuteChange(-5)}
            onIncrement={() => handleMinuteChange(5)}
            disabled={saving}
          />
          <View style={styles.periodBlock}>
            <Text style={styles.timeStepLabel}>Period</Text>
            <View style={styles.periodToggle}>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'AM' && styles.periodBtnActive]}
                onPress={() => {
                  if (prefs.hour >= 12) handleHourChange(-12);
                }}
                disabled={saving}
                activeOpacity={0.75}
              >
                <Text style={[styles.periodBtnText, period === 'AM' && styles.periodBtnTextActive]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'PM' && styles.periodBtnActive]}
                onPress={() => {
                  if (prefs.hour < 12) handleHourChange(12);
                }}
                disabled={saving}
                activeOpacity={0.75}
              >
                <Text style={[styles.periodBtnText, period === 'PM' && styles.periodBtnTextActive]}>
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ── Reminder type ── */}
      <SectionLabel title="Message Style" />
      <View style={styles.card}>
        {REMINDER_TYPES.map((rt, i) => (
          <View key={rt.key}>
            <TouchableOpacity
              style={styles.typeRow}
              onPress={() => handleTypeChange(rt.key)}
              activeOpacity={0.7}
              disabled={saving}
            >
              <View
                style={[
                  styles.typeRadio,
                  prefs.type === rt.key && styles.typeRadioSelected,
                ]}
              >
                {prefs.type === rt.key && <View style={styles.typeRadioDot} />}
              </View>
              <View style={styles.typeText}>
                <Text style={styles.typeLabel}>{rt.label}</Text>
                <Text style={styles.typeDescription}>{rt.description}</Text>
              </View>
            </TouchableOpacity>
            {i < REMINDER_TYPES.length - 1 && <RowDivider />}
          </View>
        ))}
      </View>

      <Text style={styles.footerNote}>
        Beluga Fit sends one reminder per day at your chosen time. No spam, no guilt — just a calm nudge to stay consistent.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // ── Banners ──
  permissionBanner: {
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  permissionBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 6,
  },
  permissionBannerBody: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 19,
    marginBottom: 14,
  },
  permissionBannerButton: {
    backgroundColor: '#d97706',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  permissionBannerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  unavailableBanner: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  unavailableText: {
    fontSize: 13,
    color: '#64748b',
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
  cardPadded: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
  },

  // ── Toggle ──
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  toggleLeft: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  toggleSub: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17,
  },

  // ── Time picker ──
  timePreview: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -1.5,
    marginBottom: 2,
  },
  timePreviewSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 24,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  timeStepper: {
    alignItems: 'center',
  },
  timeStepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  timeStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeStepBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeStepBtnDisabled: {
    opacity: 0.4,
  },
  timeStepBtnText: {
    fontSize: 20,
    color: '#0f172a',
    fontWeight: '400',
    lineHeight: 24,
  },
  timeStepBtnTextDisabled: {
    color: '#94a3b8',
  },
  timeStepValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
    minWidth: 44,
    textAlign: 'center',
  },
  timeStepValueDisabled: {
    color: '#94a3b8',
  },
  timeColon: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    paddingBottom: 2,
  },
  periodBlock: {
    alignItems: 'center',
    marginLeft: 8,
  },
  periodToggle: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  periodBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f8fafc',
  },
  periodBtnActive: {
    backgroundColor: '#2563eb',
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  periodBtnTextActive: {
    color: '#ffffff',
  },

  // ── Type selector ──
  typeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 14,
  },
  typeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  typeRadioSelected: {
    borderColor: '#2563eb',
  },
  typeRadioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#2563eb',
  },
  typeText: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  typeDescription: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17,
  },

  // ── Footer ──
  footerNote: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
