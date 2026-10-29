import { AdvertisingController } from './controller';
import { advertisingDeclarationStore } from './declarationStorage';

// Web/iOS never resolve or load the Android advertising library.
export const advertising = new AdvertisingController({}, () => {
  throw new Error('Advertising is Android-only.');
});
export function setAdvertisingOwner(_owner: string | null) {}
export function invalidateAdvertisingForAccountDeletion(_owner: string) {}
export function removeAdvertisingDeclaration(owner: string): Promise<void> {
  return advertisingDeclarationStore.remove(owner);
}
