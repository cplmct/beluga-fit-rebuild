/* Synthetic config/native/SDK/storage/UI fixtures only. No live requests or build. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const build = require('../config/advertising');
function load(path, imports) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, { exports, requestAnimationFrame: fn => fn(), require(name) {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  } });
  return exports;
}
const original = load('src/advertising/controller.ts', {});
const age = load('src/advertising/ageDeclaration.ts', {});
const flow = load('src/advertising/publicFlowController.ts', {
  './controller': original, './ageDeclaration': age,
});
const status = load('src/advertising/publicFlowStatus.ts', {});
const config = build.buildAdvertisingConfig('consent-eea-test', 'public-flow-test');
const info = { status: 'OBTAINED', canRequestAds: true,
  isConsentFormAvailable: true, privacyOptionsRequirementStatus: 'REQUIRED' };
const safe = () => true;
const deferred = () => {
  let resolve; const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
};
function fixture({ cfg = config, overrides = {}, barrier = async () => {} } = {}) {
  const calls = [];
  const values = new Map();
  const store = {
    async read(owner) { return values.get(owner) || 'unknown'; },
    async write(owner, value) { values.set(owner, value); },
    async remove(owner) { values.delete(owner); },
  };
  const sdk = {};
  for (const [name, value] of Object.entries({
    requestInfoUpdate: info, loadAndShowConsentFormIfRequired: info, getConsentInfo: info,
    showPrivacyOptionsForm: info, readGdprApplicability: 'applicable',
    getPurposeConsents: '11111111', configure: undefined, initialize: undefined,
  })) sdk[name] = async () => {
    calls.push(name); return overrides[name] ? overrides[name]() : value;
  };
  sdk.reset = () => { calls.push('reset'); if (overrides.reset) return overrides.reset(); };
  const controller = new flow.PublicFlowController(cfg, store,
    () => { calls.push('load'); return sdk; }, barrier);
  return { controller, calls, store, values, sdk };
}
async function adult(f, owner = 'A') {
  await f.controller.setOwner(owner);
  await f.controller.declare(owner, 'adult');
}
function locked(f) {
  const s = f.controller.getSnapshot();
  assert.equal(s.restartRequired, true);
  assert.equal(s.ready, false);
  assert.equal(s.bannerAttempted, false);
  assert.equal(s.applicability, null);
  assert.equal(s.phase, 'blocked');
  assert.equal(s.reason, 'reset-restart-required');
  assert.equal(status.publicFlowStatus(s, true, true, 400).reserve, false);
}
async function main() {
  assert.equal(config.appId, 'ca-app-pub-5534915161634783~8443553999');
  assert.equal(config.bannerId, original.TEST_BANNER_ID);
  assert.equal(config.audienceApproved, false);
  assert.equal(flow.isConsentEeaTest(config), true);
  build.validateAdvertisingIdentifiers(config);
  for (const [key, bad] of Object.entries({
    buildProfile: 'production', mode: 'test', appId: build.TEST_APP_ID,
    bannerId: 'ca-app-pub-5534915161634783/1234567890', audienceApproved: true,
  })) {
    const altered = { ...config, [key]: bad };
    assert.equal(flow.isPublicFlowTest(altered), false);
    assert.equal(build.isConsentEeaTest(altered), false);
    assert.throws(() => build.validateAdvertisingIdentifiers(altered));
  }
  for (const badId of ['', 'ca-app-pub-5534915161634783~0000000000', 'arbitrary']) {
    assert.throws(() => build.validateAdvertisingIdentifiers({ ...config, appId: badId }));
  }
  for (const profile of ['production', 'preview', 'internal-ad-rendering', 'unknown']) {
    assert.throws(() => build.buildAdvertisingConfig(profile, 'public-flow-test'));
    assert.equal(flow.isPublicFlowTest({ ...config, buildProfile: profile }), false);
  }
  assert.throws(() => build.buildAdvertisingConfig('consent-eea-test', 'disabled'));
  for (const [profile, mode] of [['preview', 'test'], ['production', 'disabled'],
    ['internal-ad-rendering', 'internal-test'], ['public-ad-flow-test', 'public-flow-test']]) {
    const old = build.buildAdvertisingConfig(profile, mode);
    build.validateAdvertisingIdentifiers(old);
    assert.equal(old.appId, build.TEST_APP_ID);
    assert.equal(flow.isConsentEeaTest(old), false);
    assert.equal(original.isEnabled(old), false);
  }
  const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8')).build;
  assert.equal(eas['consent-eea-test'].extends, 'preview');
  assert.equal(eas['consent-eea-test'].env.BELUGA_ADS_MODE, 'public-flow-test');
  assert.equal(eas.preview.android.buildType, 'apk');
  assert.equal(eas.preview.node, '22.0.0');

  // Exercise the real manifest mod and profile selector without native generation.
  const manifestPlugin = require('../plugins/withAndroidTestAds');
  const bridge = require('../plugins/withGdprApplicability');
  for (const cfg of [config, build.buildAdvertisingConfig('public-ad-flow-test', 'public-flow-test')]) {
    assert.equal(bridge.enabled({ extra: { belugaAdvertising: cfg } }), true);
    const pluginConfig = manifestPlugin({ name: 'Test', slug: 'test', extra: { belugaAdvertising: cfg } });
    const result = await pluginConfig.mods.android.manifest({ ...pluginConfig,
      modResults: { manifest: { $: {}, application: [{ $: { 'android:name': '.MainApplication' } }] } },
      modRequest: { platform: 'android', modName: 'manifest', projectRoot: process.cwd() },
    });
    const metadata = result.modResults.manifest.application[0]['meta-data'];
    assert.equal(metadata.find(x => x.$['android:name'].endsWith('APPLICATION_ID')).$['android:value'], cfg.appId);
    assert.equal(metadata.find(x => x.$['android:name'].endsWith('DELAY_APP_MEASUREMENT_INIT')).$['android:value'], 'true');
  }
  assert.throws(() => manifestPlugin({ extra: { belugaAdvertising: { ...config, appId: build.TEST_APP_ID } } }));

  // Execute the real runtime factory with a mocked binary manifest and SDK.
  for (const [profile, mode, expectedDebug] of [
    ['consent-eea-test', 'public-flow-test', true],
    ['public-ad-flow-test', 'public-flow-test', false],
    ['internal-ad-rendering', 'internal-test', false],
    ['preview', 'test', false], ['production', 'disabled', false],
  ]) {
    const cfg = build.buildAdvertisingConfig(profile, mode);
    const requests = [];
    let capturedFactory;
    const runtime = load('src/advertising/runtime.android.ts', {
      'expo-modules-core': { requireOptionalNativeModule: () => ({
        manifest: JSON.stringify({ extra: { belugaAdvertising: cfg } }),
      }) },
      'expo-device': { isDevice: false },
      './controller': { ...original, AdvertisingController: class {} },
      './internalTestController': { InternalTestAdsController: class {} },
      './declarationStorage': { advertisingDeclarationStore: {} },
      './publicFlowController': { ...flow, PublicFlowController: class {
        constructor(_c, _s, factory) { capturedFactory = factory; }
      } },
      './gdprApplicability.android': { readGdprApplicability: () => {} },
      'react-native-google-mobile-ads': { AdsConsentDebugGeography: { EEA: 1 },
        AdsConsent: { requestInfoUpdate: (...args) => requests.push(args), reset() {} } },
    });
    assert.ok(runtime.publicFlow);
    const adapter = capturedFactory();
    adapter.requestInfoUpdate();
    assert.equal(typeof adapter.reset === 'function', expectedDebug);
    if (expectedDebug) {
      assert.equal(requests[0][0].debugGeography, 1);
      assert.deepEqual(Object.keys(requests[0][0]), ['debugGeography']);
    } else assert.equal(requests[0].length, 0);
  }

  // Valid sample-only acceptance, refusal, ambiguity and failures on the NEW profile.
  const accepted = fixture();
  await adult(accepted);
  await accepted.controller.prepareHome(safe);
  assert.equal(accepted.controller.getSnapshot().ready, true);
  for (const overrides of [
    { readGdprApplicability: () => 'missing' }, { readGdprApplicability: () => 'invalid' },
    { readGdprApplicability: () => 'not-applicable' },
    { readGdprApplicability: () => { throw Error('private'); } },
    { getPurposeConsents: () => '011111' }, { getPurposeConsents: () => '' },
    { requestInfoUpdate: () => { throw Error('private'); } },
    { getConsentInfo: () => ({ ...info, canRequestAds: false }) },
  ]) {
    const f = fixture({ overrides }); await adult(f); await f.controller.prepareHome(safe);
    assert.equal(f.controller.getSnapshot().ready, false);
    assert.ok(!f.calls.includes('initialize'));
    assert.ok(!f.controller.getSnapshot().error.includes('private'));
  }
  await accepted.controller.showPrivacyOptions(safe);
  assert.equal(accepted.controller.getSnapshot().ready, false);
  await accepted.controller.prepareHome(safe);
  assert.equal(accepted.calls.filter(n => n === 'requestInfoUpdate').length, 2);

  // Lock BEFORE awaiting native-view removal; survive EVERY account/navigation entry path.
  const barrier = deferred();
  const f = fixture({ barrier: () => barrier.promise });
  await adult(f); await f.controller.prepareHome(safe);
  const oldCallbacks = f.controller.createBannerCallbacks();
  const reset = f.controller.requestConsentReset(safe);
  locked(f);
  assert.ok(!f.calls.includes('reset'));
  barrier.resolve(); await reset;
  assert.equal(f.calls.filter(x => x === 'reset').length, 1);
  const count = f.calls.length;
  f.controller.suspend(); locked(f);
  f.controller.retry(); locked(f);
  await f.controller.prepareHome(safe); locked(f);
  await f.controller.showPrivacyOptions(safe); locked(f);
  oldCallbacks.onLoadStart(); oldCallbacks.onAdLoaded(); oldCallbacks.onAdFailedToLoad({});
  locked(f);
  await f.controller.setOwner(null); locked(f);
  await adult(f, 'B'); locked(f);
  await f.controller.setOwner('B', true); locked(f);
  await f.controller.declare('B', 'under-18'); locked(f);
  await f.controller.declare('B', 'adult'); locked(f);
  await f.controller.removeDeclaration('B'); locked(f);
  await adult(f, 'A'); locked(f);
  await f.controller.prepareHome(safe);
  await f.controller.requestConsentReset(safe);
  f.controller.failBanner({ code: 'network-error' }); locked(f);
  assert.equal(f.calls.length, count, 'No SDK work after reset across all in-process paths');
  assert.equal(f.values.get('A'), 'adult', 'Reset must not delete the declaration');

  // Busy/unsafe/old-profile calls do not reset. Account/surface changes during
  // removal cancel the native call, but do NOT release the process lock.
  const pending = deferred();
  const busy = fixture({ overrides: { requestInfoUpdate: () => pending.promise } });
  await adult(busy); const preparing = busy.controller.prepareHome(safe);
  await busy.controller.requestConsentReset(safe);
  assert.equal(busy.controller.getSnapshot().restartRequired, false);
  pending.resolve(info); await preparing;
  await busy.controller.requestConsentReset(() => false);
  assert.equal(busy.controller.getSnapshot().restartRequired, false);
  for (const change of ['owner', 'surface']) {
    const b = deferred(); let isSafe = true;
    const canceled = fixture({ barrier: () => b.promise }); await adult(canceled);
    const r = canceled.controller.requestConsentReset(() => isSafe);
    if (change === 'owner') await canceled.controller.setOwner('B');
    else isSafe = false;
    b.resolve(); await r; locked(canceled);
    assert.ok(!canceled.calls.includes('reset'));
  }
  const broken = fixture({ overrides: { reset() { throw Error('private'); } } });
  await adult(broken); await broken.controller.requestConsentReset(safe); locked(broken);
  assert.equal(broken.controller.getSnapshot().errorCode, 'reset-request-failed');
  assert.ok(!broken.controller.getSnapshot().error.includes('private'));
  const freshProcess = fixture(); await adult(freshProcess);
  await freshProcess.controller.prepareHome(safe);
  assert.equal(freshProcess.controller.getSnapshot().restartRequired, false);
  assert.ok(freshProcess.calls.includes('requestInfoUpdate'));
  const old = fixture({ cfg: build.buildAdvertisingConfig('public-ad-flow-test', 'public-flow-test') });
  await adult(old); await old.controller.requestConsentReset(safe);
  assert.equal(old.controller.getSnapshot().restartRequired, false);
  assert.ok(!old.calls.includes('reset'));

  // Render Settings controls, capture the real onPress, and verify repeat display.
  function renderSettings(controller) {
    const presses = [];
    const ui = load('src/advertising/AdvertisingUi.android.tsx', {
      react: { ...React, useSyncExternalStore: (_subscribe, snapshot) => snapshot() },
      'react/jsx-runtime': require('react/jsx-runtime'),
      'react-native': { View: ({ children }) => React.createElement('div', null, children),
        Text: ({ children }) => React.createElement('span', null, children),
        TouchableOpacity: ({ children, onPress, disabled, testID }) => {
          presses.push({ onPress, disabled, testID });
          return React.createElement('button', { disabled }, children);
        }, AppState: { currentState: 'active' }, StyleSheet: { create: s => s } },
      '@react-navigation/native': { useIsFocused: () => true },
      './runtime.android': { publicFlow: controller, advertising: { enabled: false } },
      './controller': original, './publicFlowStatus': status,
    });
    const html = renderToStaticMarkup(React.createElement(ui.AdvertisingPrivacyOptions,
      { ownerUserId: controller.getSnapshot().owner, blocked: false }));
    return { html, presses };
  }
  const uiTest = fixture(); await adult(uiTest);
  const before = renderSettings(uiTest.controller);
  assert.ok(before.html.includes('Request consent reset'));
  before.presses.find(x => x.testID === 'consent-test-reset').onPress();
  for (let i = 0; i < 10; i++) await Promise.resolve();
  const after = renderSettings(uiTest.controller);
  assert.ok(after.html.includes('Consent reset requested'));
  assert.ok(after.html.includes('not confirmation of native completion or erasure'));
  assert.ok(!after.html.includes('Request consent reset'));
  assert.ok(!renderSettings(old.controller).html.includes('consent reset'));
  assert.ok(fs.readFileSync('src/advertising/AdvertisingUi.android.tsx', 'utf8')
    .includes('requestNonPersonalizedAdsOnly: true'));
  console.log('PASS: exact EEA profile/App-ID isolation, synthetic manifests, unchanged bridge selection, emulator-only documented debug options and legacy adapter isolation.');
  console.log('PASS: acceptance/refusal/refresh/applicability failures, privacy reassessment, explicit reset UI, void-reset failure and process restart lock across navigation/account/declaration/deletion/retry/stale-callback paths.');
  console.log('NOT VERIFIED: native reset completion, actual emulator recognition/geography/message delivery, Gradle resolution, native network behavior. All SDK/native/storage calls mocked.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
