import { requireOptionalNativeModule } from 'expo-modules-core';
import { isDevice } from 'expo-device';
import { AdvertisingController, readEmbeddedConfig } from './controller';
import { InternalTestAdsController } from './internalTestController';
import { advertisingDeclarationStore } from './declarationStorage';
import { PublicFlowController } from './publicFlowController';

// Read the installed APK's asset directly. Constants.expoConfig/OTA extras are
// deliberately not used: an OTA manifest must not enable a disabled binary.
const embedded = requireOptionalNativeModule<{ manifest?: string }>('ExponentConstants');
const config = readEmbeddedConfig(embedded?.manifest);

export function loadAndroidAds(): typeof import('react-native-google-mobile-ads') {
  return require('react-native-google-mobile-ads');
}

function createAdapter() {
  const { AdsConsent, default: mobileAds } = loadAndroidAds();
  return {
    requestInfoUpdate: () => AdsConsent.requestInfoUpdate(),
    getConsentInfo: () => AdsConsent.getConsentInfo(),
    loadAndShowConsentFormIfRequired: () => AdsConsent.loadAndShowConsentFormIfRequired(),
    showPrivacyOptionsForm: () => AdsConsent.showPrivacyOptionsForm(),
    getUserChoices: () => AdsConsent.getUserChoices(),
    getGdprApplies: () => AdsConsent.getGdprApplies(),
    getPurposeConsents: () => AdsConsent.getPurposeConsents(),
    configure: () => mobileAds().setRequestConfiguration({ testDeviceIdentifiers: ['EMULATOR'] }),
    initialize: () => mobileAds().initialize(),
  };
}

export const advertising = new AdvertisingController(config, createAdapter);
export const internalTestAdvertising = new InternalTestAdsController(
  config, () => isDevice === false, createAdapter,
);
export const publicFlow = new PublicFlowController(
  config, advertisingDeclarationStore, createAdapter,
  () => new Promise<void>(resolve => requestAnimationFrame(() => { resolve(); })),
);
export function setAdvertisingOwner(owner: string | null) {
  void publicFlow.setOwner(owner);
}
export const invalidateAdvertisingForAccountDeletion = publicFlow.invalidateDeletedOwner;
export const removeAdvertisingDeclaration = publicFlow.removeDeclaration;
