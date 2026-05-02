module.exports = {
  name: "Beluga Fit",
  slug: "beluga-fit",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  description: "Track your fitness journey with Beluga Fit - a comprehensive workout tracker with AI-powered coaching, voice commands, and detailed progress monitoring.",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  privacy: "public",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.tranbtc.belugafitworkout",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    },
    config: {
      usesNonExemptEncryption: false
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.tranbtc.belugafitworkout",
    compileSdkVersion: 34,
    targetSdkVersion: 34,
    permissions: [
      "INTERNET",
      "VIBRATE"
    ]
  },
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          kotlinVersion: "1.9.24"
        }
      }
    ],
    "expo-font",
    "expo-asset"
  ],
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    eas: {
      projectId: "322e2792-29c9-4977-ad75-f5e21def0be4"
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  }
};