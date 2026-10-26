// Only test inventory exists in executable configuration. No live-mode branch.
const TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

function buildAdvertisingConfig(profile, requestedMode) {
  const testProfile = profile === 'development' || profile === 'preview';
  if (testProfile && requestedMode !== 'test') {
    throw new Error('Development/preview must explicitly select test advertising mode.');
  }
  if (requestedMode && !['test', 'disabled'].includes(requestedMode)) {
    throw new Error('Unsupported advertising mode. Live advertising is not implemented.');
  }
  return {
    mode: testProfile ? 'test' : 'disabled',
    appId: TEST_APP_ID,
    bannerId: TEST_BANNER_ID,
    // Requires a separately reviewed native rebuild. Never derive from a profile.
    audienceApproved: false,
  };
}

module.exports = { TEST_APP_ID, TEST_BANNER_ID, buildAdvertisingConfig };
