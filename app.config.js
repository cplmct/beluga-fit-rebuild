const { buildAdvertisingConfig } = require('./config/advertising');

module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins || []), './plugins/withAndroidTestAds'],
  extra: {
    ...config.extra,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    belugaAdvertising: buildAdvertisingConfig(
      process.env.EAS_BUILD_PROFILE,
      process.env.BELUGA_ADS_MODE,
    ),
  },
});
