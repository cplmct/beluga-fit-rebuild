import { Platform } from 'react-native';

// Shared by every supported app auth mutation. A different name from Supabase's
// own lock avoids nesting its non-reentrant lock around SDK calls.
const LOCK_NAME = 'beluga-fit-account-transition-v1';
let transitions: Promise<unknown> = Promise.resolve();

export function withAccountTransitionLock<T>(operation: () => Promise<T>, requireSharedLock = false): Promise<T> {
  const run = () => {
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
      return navigator.locks.request(LOCK_NAME, { mode: 'exclusive' }, operation);
    }
    if (Platform.OS === 'web' && requireSharedLock) {
      throw new Error('This browser cannot safely coordinate account cleanup. Use a browser with Web Locks support.');
    }
    // Native has a single app process; serialize across provider instances too.
    return operation();
  };
  const result = transitions.then(run);
  transitions = result.catch(() => undefined);
  return result;
}
