module.exports = {
  dependencies: {
    // Android-only phase: do not link the advertising SDK into iOS.
    'react-native-google-mobile-ads': { platforms: { ios: null } },
  },
};
