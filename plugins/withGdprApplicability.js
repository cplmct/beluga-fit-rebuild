const fs = require('node:fs/promises');
const path = require('node:path');
const { withMainApplication, withDangerousMod } = require('expo/config-plugins');
const { validateSampleIdentifiers } = require('../config/advertising');

const registration = 'packages.add(com.belugafit.advertising.BelugaGdprApplicabilityPackage())';
const sourceNames = [
  'GdprApplicabilityReader.java',
  'BelugaGdprApplicabilityModule.java',
  'BelugaGdprApplicabilityPackage.java',
];

function register(contents, language) {
  if (language !== 'kt') throw Error('Applicability bridge requires the reviewed Kotlin MainApplication.');
  if (contents.includes(registration)) return contents;
  // Expo SDK 53 bare template. Fail closed if generation changes this contract.
  const anchor = /^([ \t]*)val packages = PackageList\(this\)\.packages[ \t]*$/gm;
  const matches = [...contents.matchAll(anchor)];
  if (matches.length !== 1 || !contents.includes('return packages')) {
    throw Error('Unrecognized MainApplication package registration; review required.');
  }
  return contents.replace(anchor, `$&\n${matches[0][1]}${registration}`);
}

function enabled(config) {
  const ads = config.extra?.belugaAdvertising;
  return ads?.buildProfile === 'public-ad-flow-test' && ads.mode === 'public-flow-test'
    && ads.audienceApproved === false;
}

function withGdprApplicability(config) {
  if (!enabled(config)) return config;
  validateSampleIdentifiers(config.extra.belugaAdvertising);
  config = withMainApplication(config, mod => {
    mod.modResults.contents = register(mod.modResults.contents, mod.modResults.language);
    return mod;
  });
  return withDangerousMod(config, ['android', async mod => {
    const root = mod.modRequest.projectRoot;
    const target = path.join(mod.modRequest.platformProjectRoot,
      'app/src/main/java/com/belugafit/advertising');
    await fs.mkdir(target, { recursive: true });
    for (const name of sourceNames) {
      await fs.copyFile(path.join(root, 'native/advertising', name), path.join(target, name));
    }
    return mod;
  }]);
}

module.exports = withGdprApplicability;
// Pure registration transform for tests; no native execution or fixture APIs.
module.exports.register = register;
module.exports.enabled = enabled;
