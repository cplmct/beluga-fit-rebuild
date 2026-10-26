import { AdvertisingController } from './controller';

// Web/iOS never resolve or load the Android advertising library.
export const advertising = new AdvertisingController({}, () => {
  throw new Error('Advertising is Android-only.');
});
