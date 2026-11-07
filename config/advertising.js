// Exact binary configurations only; ordinary production stays disabled.
const TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const INTERNAL_TEST_PROFILE = 'internal-ad-rendering';
const PUBLIC_FLOW_TEST_PROFILE = 'public-ad-flow-test';
const CONSENT_EEA_PROFILE = 'consent-eea-test';
const CONSENT_EEA_APP_ID = 'ca-app-pub-5534915161634783~8443553999';
const PRODUCTION_ADS_PROFILE = 'production-advertising';
const PRODUCTION_ADS_MODE = 'production-tcf';
const PRODUCTION_APP_ID = 'ca-app-pub-5534915161634783~7684377807';
const PRODUCTION_BANNER_ID = 'ca-app-pub-5534915161634783/2005509866';

function isProductionAdvertising(config) {
  return config?.buildProfile === PRODUCTION_ADS_PROFILE && config.mode === PRODUCTION_ADS_MODE
    && config.appId === PRODUCTION_APP_ID && config.bannerId === PRODUCTION_BANNER_ID
    && config.audienceApproved === true;
}

function isConsentEeaTest(config) {
  return config?.buildProfile === CONSENT_EEA_PROFILE && config.mode === 'public-flow-test'
    && config.appId === CONSENT_EEA_APP_ID && config.bannerId === TEST_BANNER_ID
    && config.audienceApproved === false;
}

function buildAdvertisingConfig(profile, requestedMode) {
  if (profile === PRODUCTION_ADS_PROFILE || requestedMode === PRODUCTION_ADS_MODE) {
    if (profile !== PRODUCTION_ADS_PROFILE || requestedMode !== PRODUCTION_ADS_MODE) {
      throw new Error('Production advertising requires its exact profile and mode.');
    }
    return {
      buildProfile: PRODUCTION_ADS_PROFILE, mode: PRODUCTION_ADS_MODE,
      appId: PRODUCTION_APP_ID, bannerId: PRODUCTION_BANNER_ID,
      // Explicit release-configuration review only; NEVER individual eligibility.
      audienceApproved: true,
    };
  }
  const internalTest = profile === INTERNAL_TEST_PROFILE && requestedMode === 'internal-test';
  const publicFlowTest = [PUBLIC_FLOW_TEST_PROFILE, CONSENT_EEA_PROFILE].includes(profile)
    && requestedMode === 'public-flow-test';
  if ([PUBLIC_FLOW_TEST_PROFILE, CONSENT_EEA_PROFILE].includes(profile) && !publicFlowTest) {
    throw new Error('Public advertising flow tests require explicit public-flow-test mode.');
  }
  if (profile === INTERNAL_TEST_PROFILE && !internalTest) {
    throw new Error('Internal ad rendering requires explicit internal-test mode.');
  }
  const testProfile = profile === 'development' || profile === 'preview';
  if (testProfile && requestedMode !== 'test') {
    throw new Error('Development/preview must explicitly select test advertising mode.');
  }
  if (requestedMode && !['test', 'disabled', 'internal-test', 'public-flow-test'].includes(requestedMode)) {
    throw new Error('Unsupported advertising mode. Live advertising is not implemented.');
  }
  if ((requestedMode === 'public-flow-test' && !publicFlowTest)
    || (requestedMode === 'internal-test' && !internalTest)) {
    throw new Error('Test advertising mode requires its exact build profile.');
  }
  return {
    mode: publicFlowTest ? 'public-flow-test' : internalTest ? 'internal-test' : testProfile ? 'test' : 'disabled',
    buildProfile: profile || 'unknown',
    appId: profile === CONSENT_EEA_PROFILE ? CONSENT_EEA_APP_ID : TEST_APP_ID,
    bannerId: TEST_BANNER_ID,
    // Requires a separately reviewed native rebuild. Never derive from a profile.
    audienceApproved: false,
  };
}

function validateSampleIdentifiers(config) {
  if (config?.appId !== TEST_APP_ID || config?.bannerId !== TEST_BANNER_ID) {
    throw new Error('Only Google sample advertising identifiers are allowed.');
  }
}

function validateAdvertisingIdentifiers(config) {
  if (config?.buildProfile === PRODUCTION_ADS_PROFILE || config?.mode === PRODUCTION_ADS_MODE
    || config?.appId === PRODUCTION_APP_ID || config?.bannerId === PRODUCTION_BANNER_ID) {
    if (!isProductionAdvertising(config)) throw new Error('Invalid production advertising configuration.');
    return;
  }
  if (config?.buildProfile === CONSENT_EEA_PROFILE || config?.appId === CONSENT_EEA_APP_ID) {
    if (!isConsentEeaTest(config)) throw new Error('Consent EEA test requires the exact profile/mode/identifiers.');
    return;
  }
  validateSampleIdentifiers(config);
  const expected = buildAdvertisingConfig(config?.buildProfile, config?.mode);
  if (expected.mode !== config?.mode || config?.audienceApproved !== false) {
    throw new Error('Invalid test advertising profile configuration.');
  }
}

module.exports = {
  TEST_APP_ID, TEST_BANNER_ID, INTERNAL_TEST_PROFILE, buildAdvertisingConfig, validateSampleIdentifiers,
  PUBLIC_FLOW_TEST_PROFILE,
  CONSENT_EEA_PROFILE, CONSENT_EEA_APP_ID, isConsentEeaTest, validateAdvertisingIdentifiers,
  PRODUCTION_ADS_PROFILE, PRODUCTION_ADS_MODE, PRODUCTION_APP_ID, PRODUCTION_BANNER_ID,
  isProductionAdvertising,
};
