// Only test inventory exists in executable configuration. No live-mode branch.
const TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const INTERNAL_TEST_PROFILE = 'internal-ad-rendering';

function buildAdvertisingConfig(profile, requestedMode) {
  const internalTest = profile === INTERNAL_TEST_PROFILE && requestedMode === 'internal-test';
  if (profile === INTERNAL_TEST_PROFILE && !internalTest) {
    throw new Error('Internal ad rendering requires explicit internal-test mode.');
  }
  const testProfile = profile === 'development' || profile === 'preview';
  if (testProfile && requestedMode !== 'test') {
    throw new Error('Development/preview must explicitly select test advertising mode.');
  }
  if (requestedMode && !['test', 'disabled', 'internal-test'].includes(requestedMode)) {
    throw new Error('Unsupported advertising mode. Live advertising is not implemented.');
  }
  return {
    mode: internalTest ? 'internal-test' : testProfile ? 'test' : 'disabled',
    buildProfile: profile || 'unknown',
    appId: TEST_APP_ID,
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

module.exports = {
  TEST_APP_ID, TEST_BANNER_ID, INTERNAL_TEST_PROFILE, buildAdvertisingConfig, validateSampleIdentifiers,
};
