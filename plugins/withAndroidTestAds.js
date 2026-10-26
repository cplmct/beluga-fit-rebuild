const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');
const { TEST_APP_ID } = require('../config/advertising');

// Android-only equivalent of the pinned library plugin's two manifest settings.
// Do not register any iOS mods or enable any additional ad SDKs.
module.exports = function withAndroidTestAds(config) {
  return withAndroidManifest(config, mod => {
    const manifest = mod.modResults;
    AndroidConfig.Manifest.ensureToolsAvailable(manifest);
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app['meta-data'] = app['meta-data'] || [];
    for (const [name, value] of [
      ['com.google.android.gms.ads.APPLICATION_ID', TEST_APP_ID],
      ['com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT', 'true'],
    ]) {
      app['meta-data'] = app['meta-data'].filter(item => item.$['android:name'] !== name);
      app['meta-data'].push({
        $: { 'android:name': name, 'android:value': value, 'tools:replace': 'android:value' },
      });
    }
    return mod;
  });
};
