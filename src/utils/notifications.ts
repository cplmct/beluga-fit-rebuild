import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// ── Storage keys ────────────────────────────────────────────
const PREFS_KEY = 'beluga_notif_prefs';
const SCHEDULED_ID_KEY = 'beluga_notif_id';
const INACTIVITY_ID_KEY = 'beluga_inactivity_notif_id';

// ── Inactivity reminder config ───────────────────────────────
const INACTIVITY_DAYS = 2;
const INACTIVITY_HOUR = 19; // 7:00 PM local

// ── Types ────────────────────────────────────────────────────
export type ReminderType = 'checkin' | 'move' | 'motivation' | 'random';

export interface NotifPrefs {
  enabled: boolean;
  hour: number;
  minute: number;
  type: ReminderType;
}

export const DEFAULT_PREFS: NotifPrefs = {
  enabled: false,
  hour: 8,
  minute: 0,
  type: 'checkin',
};

// ── Message pools ────────────────────────────────────────────
const MESSAGES_CHECKIN: { title: string; body: string }[] = [
  { title: 'Beluga Fit', body: 'Have you trained today? Even a short session counts.' },
  { title: 'Beluga Fit', body: 'A quick check-in — did you get your workout in today?' },
  { title: 'Beluga Fit', body: 'Your streak is waiting. Did you move today?' },
  { title: 'Beluga Fit', body: 'Did today include some training? Log it and keep the momentum.' },
  { title: 'Beluga Fit', body: 'Checking in — any movement today? Log it and stay consistent.' },
  { title: 'Beluga Fit', body: 'One session closer to your goal. Did you train today?' },
];

const MESSAGES_MOVE: { title: string; body: string }[] = [
  { title: 'Time to move', body: 'Your body was built to move. A short session is all it takes.' },
  { title: 'Time to move', body: 'Energy follows motion. Get moving today, even briefly.' },
  { title: 'Time to move', body: 'The hardest part is starting. Everything after that is progress.' },
  { title: 'Time to move', body: 'Small consistent actions add up. Today is a good day to act.' },
  { title: 'Time to move', body: "Movement is medicine. Your future self will thank you." },
  { title: 'Time to move', body: 'Ten minutes of training is infinitely better than none.' },
  { title: 'Time to move', body: 'Light or heavy, short or long — just move today.' },
];

const MESSAGES_MOTIVATION: { title: string; body: string }[] = [
  { title: 'Beluga Fit', body: 'The only bad workout is the one that never happened.' },
  { title: 'Beluga Fit', body: 'Discipline builds the life that motivation imagines.' },
  { title: 'Beluga Fit', body: 'Strength is built one session at a time. Show up today.' },
  { title: 'Beluga Fit', body: 'Progress is invisible until it suddenly is not. Keep going.' },
  { title: 'Beluga Fit', body: 'Consistency over intensity. Every rep compounds.' },
  { title: 'Beluga Fit', body: 'The goal does not care how you feel today. Train anyway.' },
  { title: 'Beluga Fit', body: 'Earned, not given. Show up and put in the work.' },
  { title: 'Beluga Fit', body: 'Champions train on the days they do not feel like it.' },
  { title: 'Beluga Fit', body: 'Every session is a vote for the person you are becoming.' },
  { title: 'Beluga Fit', body: "Your best session might be today. You won't know unless you start." },
];

function pickMessage(type: ReminderType): { title: string; body: string } {
  if (type === 'checkin') {
    return MESSAGES_CHECKIN[Math.floor(Math.random() * MESSAGES_CHECKIN.length)];
  }
  if (type === 'move') {
    return MESSAGES_MOVE[Math.floor(Math.random() * MESSAGES_MOVE.length)];
  }
  if (type === 'motivation') {
    return MESSAGES_MOTIVATION[Math.floor(Math.random() * MESSAGES_MOTIVATION.length)];
  }
  // random — pick from combined pool
  const all = [...MESSAGES_CHECKIN, ...MESSAGES_MOVE, ...MESSAGES_MOTIVATION];
  return all[Math.floor(Math.random() * all.length)];
}

// ── Prefs persistence ────────────────────────────────────────

export async function getPrefs(): Promise<NotifPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export async function savePrefs(prefs: NotifPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// Returns true if the user has ever saved notification preferences on this
// device. Used by NotificationSettingsScreen to decide whether to check
// Supabase for cloud-synced preferences from another device.
export async function hasLocalPrefs(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw !== null;
  } catch {
    return false;
  }
}

async function getScheduledId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SCHEDULED_ID_KEY);
  } catch {
    return null;
  }
}

async function saveScheduledId(id: string | null): Promise<void> {
  if (id) {
    await AsyncStorage.setItem(SCHEDULED_ID_KEY, id);
  } else {
    await AsyncStorage.removeItem(SCHEDULED_ID_KEY);
  }
}

// ── Android channel ──────────────────────────────────────────
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('beluga-reminders', {
    name: 'Daily Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563eb',
    sound: 'default',
  });
}

// ── Notification handler (foreground) ────────────────────────
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ── Permission ───────────────────────────────────────────────
export async function requestPermission(): Promise<'granted' | 'denied' | 'unavailable'> {
  if (!Device.isDevice) {
    // Simulators / Expo web cannot receive notifications
    return 'unavailable';
  }
  await ensureAndroidChannel();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return 'granted';
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'unavailable'> {
  if (!Device.isDevice) return 'unavailable';
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

// ── Schedule / cancel ────────────────────────────────────────
export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await saveScheduledId(null);
}

export async function scheduleDaily(prefs: NotifPrefs): Promise<boolean> {
  // Always cancel existing first
  await cancelAll();

  if (!prefs.enabled) return true;

  const permStatus = await requestPermission();
  if (permStatus !== 'granted') return false;

  await ensureAndroidChannel();

  const msg = pickMessage(prefs.type);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: 'beluga-reminders' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: prefs.hour,
      minute: prefs.minute,
    },
  });

  await saveScheduledId(id);
  if (__DEV__) console.log('[Notifications] scheduled daily at', prefs.hour, ':', prefs.minute, 'id:', id);
  return true;
}

// ── Format helpers ───────────────────────────────────────────
export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = String(minute).padStart(2, '0');
  return `${h}:${m} ${period}`;
}

export function reminderTypeLabel(type: ReminderType): string {
  switch (type) {
    case 'checkin':    return 'Daily check-in';
    case 'move':       return 'Time to move';
    case 'motivation': return 'Gym motivation';
    case 'random':     return 'Random rotation';
  }
}

export const MESSAGE_COUNTS = {
  checkin:    MESSAGES_CHECKIN.length,
  move:       MESSAGES_MOVE.length,
  motivation: MESSAGES_MOTIVATION.length,
  total:      MESSAGES_CHECKIN.length + MESSAGES_MOVE.length + MESSAGES_MOTIVATION.length,
};

// ── Inactivity reminder ───────────────────────────────────────
// Finds the user's most recent completed workout and schedules a local
// notification for INACTIVITY_DAYS days later at INACTIVITY_HOUR local time.
// Any previously scheduled inactivity reminder is cancelled first.
export async function scheduleInactivityReminder(userId: string): Promise<void> {
  if (!Device.isDevice) return;

  try {
    const permStatus = await getPermissionStatus();
    if (__DEV__) console.log('[Notif] scheduleInactivityReminder — permission:', permStatus);
    if (permStatus !== 'granted') return;

    // Cancel any previously scheduled inactivity reminder
    const existingId = await AsyncStorage.getItem(INACTIVITY_ID_KEY).catch(() => null);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => {});
      await AsyncStorage.removeItem(INACTIVITY_ID_KEY).catch(() => {});
      if (__DEV__) console.log('[Notif] inactivity reminder cancelled (id:', existingId, ')');
    }

    // Find the most recent completed workout
    const { data } = await supabase
      .from('workouts')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (__DEV__)
      console.log('[Notif] last completed workout date:', data?.date ?? 'none');

    // Trigger = last workout date (or now if none) + INACTIVITY_DAYS at INACTIVITY_HOUR local
    const base = data?.date ? new Date(data.date) : new Date();
    const triggerDate = new Date(base);
    triggerDate.setDate(triggerDate.getDate() + INACTIVITY_DAYS);
    triggerDate.setHours(INACTIVITY_HOUR, 0, 0, 0);

    if (triggerDate <= new Date()) {
      if (__DEV__)
        console.log('[Notif] inactivity trigger is in the past — skipping');
      return;
    }

    if (__DEV__)
      console.log('[Notif] scheduling inactivity reminder for:', triggerDate.toLocaleString());

    await ensureAndroidChannel();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to get back at it',
        body: "It's been a couple of days — open Beluga Fit and keep your progress going.",
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: 'beluga-reminders' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    await AsyncStorage.setItem(INACTIVITY_ID_KEY, id).catch(() => {});
    if (__DEV__)
      console.log('[Notif] inactivity reminder scheduled (id:', id, ') for', triggerDate.toLocaleString());
  } catch (e) {
    if (__DEV__) console.warn('[Notif] scheduleInactivityReminder failed:', e);
  }
}
