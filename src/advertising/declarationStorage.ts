import AsyncStorage from '@react-native-async-storage/async-storage';
import { readPendingAccountCleanup } from '../utils/accountCleanup';
import { AgeDeclarationStore } from './ageDeclaration';

// Shared by platform runtimes and deletion cleanup, with no native ad SDK import.
// A marker/read failure propagates: stale declarations must not be restored.
export const advertisingDeclarationStore = new AgeDeclarationStore(AsyncStorage, async owner => {
  const cleanup = await readPendingAccountCleanup();
  return cleanup?.kind === 'delete-account' && cleanup.ownerUserId === owner;
});
