import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@beluga_account_cleanup_v1';

export interface PendingAccountCleanup {
  ownerUserId: string;
  kind: 'sign-out' | 'delete-account';
}

// Persist intent before an account-boundary operation. A failed removal must
// not allow the old session/draft to be restored on the next app launch.
export async function readPendingAccountCleanup(): Promise<PendingAccountCleanup | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  const value: PendingAccountCleanup = JSON.parse(raw);
  if (!value || typeof value.ownerUserId !== 'string' || !value.ownerUserId ||
      (value.kind !== 'sign-out' && value.kind !== 'delete-account')) {
    throw new Error('Local account cleanup could not be checked.');
  }
  return value;
}

export async function beginAccountCleanup(value: PendingAccountCleanup): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
}

export async function removeAccountCleanupMarker(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
