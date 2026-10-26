import { requireOptionalNativeModule } from 'expo-modules-core';
import { AdvertisingController, readEmbeddedConfig } from './controller';

// Read the installed APK's asset directly. Constants.expoConfig/OTA extras are
// deliberately not used: an OTA manifest must not enable a disabled binary.
const embedded = requireOptionalNativeModule<{ manifest?: string }>('ExponentConstants');
const config = readEmbeddedConfig(embedded?.manifest);

export function loadAndroidAds(): typeof import('react-native-google-mobile-ads') {
  return require('react-native-google-mobile-ads');
}

export const advertising = new AdvertisingController(config, () => {
  const { AdsConsent, default: mobileAds } = loadAndroidAds();
  return {
    requestInfoUpdate: () => AdsConsent.requestInfoUpdate(),
    getConsentInfo: () => AdsConsent.getConsentInfo(),
    loadAndShowConsentFormIfRequired: () => AdsConsent.loadAndShowConsentFormIfRequired(),
    showPrivacyOptionsForm: () => AdsConsent.showPrivacyOptionsForm(),
    getGdprApplies: () => AdsConsent.getGdprApplies(),
    configure: () => mobileAds().setRequestConfiguration({ testDeviceIdentifiers: ['EMULATOR'] }),
    initialize: () => mobileAds().initialize(),
  };
});
