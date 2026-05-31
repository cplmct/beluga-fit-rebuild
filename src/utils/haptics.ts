import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics are unsupported on web and may be unavailable on some devices.
// All calls are no-ops on web and wrapped in try/catch to fail silently.
const supported = Platform.OS !== 'web';

function run(fn: () => void) {
  if (!supported) return;
  try { fn(); } catch (_) { /* haptics unavailable — ignore */ }
}

export const haptic = {
  // Light tap — use for low-stakes confirmations (e.g. checking off a set).
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  // Success — use when a meaningful action completes (save workout, save measurements).
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  // Error — use for validation failures or save errors to reinforce the problem.
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
