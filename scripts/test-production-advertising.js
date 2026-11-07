/* Mock SDK/storage/device/UI and synthetic manifest only. No ads, network or build. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { createRoot } = require('react-dom/client');
const build = require('../config/advertising');
function load(path, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, { exports, requestAnimationFrame: fn => fn(), require(name) {
    assert(name in imports, `Unexpected import ${name}`);
    return imports[name];
  } });
  return exports;
}
const original = load('src/advertising/controller.ts');
const age = load('src/advertising/ageDeclaration.ts');
const flow = load('src/advertising/publicFlowController.ts', {
  './controller': original, './ageDeclaration': age,
});
const status = load('src/advertising/publicFlowStatus.ts');
const config = build.buildAdvertisingConfig('production-advertising', 'production-tcf');
const info = { status: 'OBTAINED', canRequestAds: true,
  isConsentFormAvailable: true, privacyOptionsRequirementStatus: 'REQUIRED' };
const safe = () => true;
const deferred = () => {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
};
function fixture(overrides = {}, cfg = config) {
  const calls = [];
  const values = new Map();
  const store = new age.AgeDeclarationStore({
    async getItem(k) { return values.get(k) ?? null; },
    async setItem(k, v) { values.set(k, v); },
    async removeItem(k) { values.delete(k); },
  });
  const sdk = {};
  for (const [name, value] of Object.entries({
    requestInfoUpdate: info, getConsentInfo: info, loadAndShowConsentFormIfRequired: info,
    showPrivacyOptionsForm: info, readGdprApplicability: 'applicable',
    getPurposeConsents: '11111111', configure: undefined, initialize: undefined,
  })) sdk[name] = async (...args) => {
    assert.equal(args.length, 0, 'No account/declaration/fitness arguments');
    calls.push(name);
    return overrides[name] ? overrides[name]() : value;
  };
  const controller = new flow.PublicFlowController(cfg, store,
    () => { calls.push('load'); return sdk; },
    async () => { assert.equal(controller.getSnapshot().ready, false); });
  return { controller, calls, values, store };
}
async function adult(f, owner = 'A') {
  await f.controller.setOwner(owner);
  await f.controller.declare(owner, 'adult');
}

async function configuration() {
  assert(build.isProductionAdvertising(config));
  assert(flow.isProductionAdvertising(config));
  assert(!flow.isPublicFlowTest(config));
  build.validateAdvertisingIdentifiers(config);
  for (const key of Object.keys(config)) {
    for (const value of [undefined, null, '', false, 'unknown']) {
      const bad = { ...config, [key]: value };
      assert(!build.isProductionAdvertising(bad), `${key}/${value}`);
      assert(!flow.isProductionAdvertising(bad));
      assert.throws(() => build.validateAdvertisingIdentifiers(bad));
      const f = fixture({}, bad);
      await adult(f);
      await f.controller.prepareHome(safe);
      assert.equal(f.calls.length, 0);
    }
  }
  for (const [profile, mode] of [
    ['production', 'production-tcf'], ['preview', 'production-tcf'],
    ['unknown', 'production-tcf'], ['production-advertising', 'disabled'],
    ['production-advertising', 'test'], ['production', 'live'],
  ]) assert.throws(() => build.buildAdvertisingConfig(profile, mode));
  for (const [profile, mode] of [['production', 'disabled'], ['preview', 'test'],
    ['development', 'test'], ['internal-ad-rendering', 'internal-test'],
    ['public-ad-flow-test', 'public-flow-test'], ['consent-eea-test', 'public-flow-test']]) {
    const cfg = build.buildAdvertisingConfig(profile, mode);
    assert.equal(cfg.audienceApproved, false);
    assert.equal(cfg.bannerId, build.TEST_BANNER_ID);
    assert(!flow.isProductionAdvertising(cfg));
    if (profile === 'production' || profile === 'preview') {
      const f = fixture({}, cfg);
      await adult(f); await f.controller.prepareHome(safe);
      assert.equal(f.calls.length, 0);
    }
    for (const mixed of [
      { ...cfg, appId: config.appId }, { ...cfg, bannerId: config.bannerId },
      { ...config, appId: cfg.appId }, { ...config, bannerId: cfg.bannerId },
    ]) assert.throws(() => build.validateAdvertisingIdentifiers(mixed));
  }
  const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8')).build;
  assert.equal(eas.production.env.BELUGA_ADS_MODE, 'disabled');
  assert.equal(eas['production-advertising'].extends, 'production');
  assert.equal(eas['production-advertising'].env.BELUGA_ADS_MODE, 'production-tcf');
  assert.equal(eas.production.node, '22.0.0');
  assert.equal(eas.production.android.buildType, 'app-bundle');
  assert.equal(eas.production.autoIncrement, true);
  const plugin = require('../plugins/withAndroidTestAds');
  const bridge = require('../plugins/withGdprApplicability');
  assert(bridge.enabled({ extra: { belugaAdvertising: config } }));
  const modified = plugin({ name: 'fixture', slug: 'fixture', extra: { belugaAdvertising: config } });
  const result = await modified.mods.android.manifest({ ...modified,
    modResults: { manifest: { $: {}, application: [{ $: { 'android:name': '.MainApplication' } }] } },
    modRequest: { platform: 'android', modName: 'manifest', projectRoot: process.cwd() },
  });
  const metadata = result.modResults.manifest.application[0]['meta-data'];
  assert.equal(metadata.find(x => x.$['android:name'].endsWith('APPLICATION_ID')).$['android:value'], config.appId);
  assert.equal(metadata.find(x => x.$['android:name'].endsWith('DELAY_APP_MEASUREMENT_INIT')).$['android:value'], 'true');
  assert.throws(() => plugin({ extra: { belugaAdvertising: { ...config, audienceApproved: false } } }));

  let factory;
  const calls = [];
  const runtime = load('src/advertising/runtime.android.ts', {
    'expo-modules-core': { requireOptionalNativeModule: () => ({
      manifest: JSON.stringify({ extra: { belugaAdvertising: config } }),
      // Fake OTA/expoConfig disabled data cannot override the installed manifest.
      expoConfig: { extra: { belugaAdvertising: {} } },
    }) },
    'expo-device': { isDevice: false },
    './controller': { ...original, AdvertisingController: class {} },
    './internalTestController': { InternalTestAdsController: class {} },
    './declarationStorage': { advertisingDeclarationStore: {} },
    './publicFlowController': { ...flow, PublicFlowController: class {
      constructor(cfg, _s, f) { assert.equal(cfg.bannerId, config.bannerId); factory = f; }
    } },
    './gdprApplicability.android': { readGdprApplicability: async () => 'applicable' },
    'react-native-google-mobile-ads': {
      AdsConsent: { requestInfoUpdate: (...args) => { calls.push(args); } },
      default: () => ({ setRequestConfiguration: value => { calls.push(value); } }),
    },
  });
  assert(runtime.publicFlow);
  const adapter = factory();
  assert.equal(adapter.reset, undefined);
  adapter.requestInfoUpdate();
  await adapter.configure();
  assert.equal(calls[0].length, 0, 'No forced geography/device options to UMP');
  assert.equal(Object.keys(calls[1]).length, 0, 'No test-device configuration in production adapter');
  const disabled = build.buildAdvertisingConfig('production', 'disabled');
  assert(!flow.isProductionAdvertising(original.readEmbeddedConfig(JSON.stringify({
    extra: { belugaAdvertising: disabled }, expoConfig: { extra: { belugaAdvertising: config } },
  }))));
  assert(!flow.isProductionAdvertising(original.readEmbeddedConfig('invalid')));
}

async function controllerChecks() {
  for (const choice of ['unknown', 'under-18', 'prefer-not']) {
    const f = fixture(); await f.controller.setOwner('A'); await f.controller.declare('A', choice);
    await f.controller.discoverPrivacyOptions(safe); await f.controller.prepareHome(safe);
    assert.equal(f.calls.length, 0);
  }
  const accepted = fixture(); await adult(accepted);
  assert.equal(accepted.controller.resetEnabled, false);
  assert.equal(accepted.controller.diagnosticsEnabled, false);
  assert.equal(accepted.controller.bannerId, config.bannerId);
  await accepted.controller.requestConsentReset(safe);
  assert.equal(accepted.calls.length, 0);
  await accepted.controller.prepareHome(() => false);
  assert.equal(accepted.calls.length, 0);
  await accepted.controller.prepareHome(safe);
  assert(accepted.controller.getSnapshot().ready);
  const stale = accepted.controller.createBannerCallbacks();
  await accepted.controller.setOwner('B');
  stale.onAdLoaded();
  assert.equal(accepted.controller.getSnapshot().declaration, 'unknown');
  assert.equal(accepted.controller.getSnapshot().ready, false);
  await accepted.controller.setOwner(null);
  await accepted.controller.setOwner('A');
  assert.equal(accepted.controller.getSnapshot().declaration, 'adult', 'Logout retains only A declaration');
  assert.equal(accepted.controller.getSnapshot().ready, false);
  assert.equal(accepted.controller.getSnapshot().refresh, 'needed');
  await accepted.controller.removeDeclaration('A');
  await accepted.controller.setOwner('A');
  assert.notEqual(accepted.controller.getSnapshot().declaration, 'adult', 'Deleted owner stays blocked');

  for (const overrides of [
    { requestInfoUpdate: () => { throw Error('network'); } },
    { loadAndShowConsentFormIfRequired: () => { throw Error('form'); } },
    { getConsentInfo: () => ({ ...info, canRequestAds: false }) },
    { getConsentInfo: () => ({ ...info, status: 'NOT_REQUIRED' }) },
    { getConsentInfo: () => ({ ...info, status: 'UNKNOWN' }) },
    ...['missing', 'invalid', 'not-applicable', undefined].map(value => ({ readGdprApplicability: () => value })),
    { readGdprApplicability: () => { throw Error('read failed'); } },
    ...['01111111', '', 'bad'].map(value => ({ getPurposeConsents: () => value })),
  ]) {
    const f = fixture(overrides); await adult(f); await f.controller.prepareHome(safe);
    assert.equal(f.controller.getSnapshot().ready, false);
    assert(!f.calls.includes('initialize'));
    assert(!f.calls.includes('configure'));
  }
  const f = fixture(); await adult(f);
  await f.controller.discoverPrivacyOptions(safe);
  assert.equal(f.calls.join(','), 'load,requestInfoUpdate', 'Cold Settings only refreshes');
  assert.equal(f.controller.getSnapshot().privacyRequired, true);
  assert.equal(f.controller.getSnapshot().ready, false);
  await f.controller.discoverPrivacyOptions(safe);
  assert.equal(f.calls.filter(x => x === 'requestInfoUpdate').length, 1);
  await f.controller.showPrivacyOptions(safe);
  assert(f.calls.includes('showPrivacyOptionsForm'));
  assert(!f.calls.includes('initialize'));
  f.calls.length = 0;
  await f.controller.prepareHome(safe);
  assert(f.calls.includes('requestInfoUpdate'), 'Privacy form requires new refresh before ad eligibility');
  assert(f.controller.getSnapshot().ready);
  f.controller.suspend();
  const current = f.controller.createBannerCallbacks();
  current.onAdLoaded();
  assert.equal(f.controller.getSnapshot().ready, false);

  const pending = deferred();
  const race = fixture({ requestInfoUpdate: () => pending.promise }); await adult(race);
  const discovery = race.controller.discoverPrivacyOptions(safe);
  await race.controller.prepareHome(safe);
  await race.controller.discoverPrivacyOptions(safe);
  assert.equal(race.calls.filter(x => x === 'requestInfoUpdate').length, 1, 'Shared mutex');
  await race.controller.setOwner('B');
  pending.resolve(info); await discovery;
  assert.equal(race.controller.getSnapshot().privacyRequired, false);
  assert.equal(race.controller.getSnapshot().ready, false);
  const failure = fixture({ requestInfoUpdate: () => { throw Error('private detail'); } });
  await adult(failure); await failure.controller.discoverPrivacyOptions(safe);
  assert.equal(failure.controller.getSnapshot().refresh, 'failed');
  assert(!failure.controller.getSnapshot().error.includes('private detail'));
  await failure.controller.discoverPrivacyOptions(safe);
  assert.equal(failure.calls.filter(x => x === 'requestInfoUpdate').length, 1, 'No refresh-error loop');
}

async function mountedChecks(overrides = {}, scenario) {
  const dom = require('./helpers/mock-dom');
  const host = dom.install();
  const root = createRoot(host);
  const f = fixture(overrides); await adult(f);
  let latest;
  let focused = true;
  const ui = load('src/advertising/AdvertisingUi.android.tsx', {
    react: React, 'react/jsx-runtime': require('react/jsx-runtime'),
    'react-native': {
      AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) },
      View: ({ children, onLayout }) => {
        React.useEffect(() => onLayout?.({ nativeEvent: { layout: { width: 360 } } }), []);
        return React.createElement('div', null, children);
      },
      Text: ({ children, testID }) => React.createElement('span', { 'data-testid': testID }, children),
      TouchableOpacity: ({ children, testID, onPress, disabled }) => React.createElement('button',
        { 'data-testid': testID, onClick: onPress, disabled }, children),
      StyleSheet: { create: x => x },
    },
    '@react-navigation/native': { useIsFocused: () => focused },
    './runtime.android': { publicFlow: f.controller, advertising: { enabled: false },
      internalTestAdvertising: { enabled: false },
      loadAndroidAds: () => ({ BannerAd: props => {
        latest = props;
        return React.createElement('span', null, 'MOCK PRODUCTION BANNER');
      }, BannerAdSize: { BANNER: 'BANNER' } }) },
    './controller': original, './publicFlowStatus': status,
  });
  const render = async (home = false, blocked = false, ownerUserId = 'A') => React.act(async () => {
    root.render(React.createElement(React.Fragment, null,
      home && React.createElement(ui.HomeBanner, { blocked, ownerUserId }),
      React.createElement(ui.AdvertisingPrivacyOptions, { blocked, ownerUserId })));
  });
  function find(node, id) {
    if (node.attributes?.['data-testid'] === id) return node;
    for (const child of node.childNodes || []) { const found = find(child, id); if (found) return found; }
  }
  try {
    if (scenario) {
      await scenario({ f, host, render, find, setFocused: value => { focused = value; } });
      return;
    }
    await render(); // Settings only: no Home mount.
    assert(find(host, 'advertising-privacy-options'), 'Required options accessible without visiting Home');
    assert.equal(f.calls.join(','), 'load,requestInfoUpdate');
    const button = find(host, 'advertising-privacy-options');
    const props = button[Object.keys(button).find(k => k.startsWith('__reactProps$'))];
    await React.act(async () => { props.onClick(); });
    assert(f.calls.includes('showPrivacyOptionsForm'));
    assert(!f.calls.includes('initialize'));
    assert(!find(host, 'consent-test-reset'));
    await render(true);
    assert(host.textContent.includes('MOCK PRODUCTION BANNER'));
    assert.equal(latest.unitId, config.bannerId);
    assert.equal(latest.requestOptions.requestNonPersonalizedAdsOnly, true);
    assert(!find(host, 'public-ad-test-status'));
    assert(!host.textContent.includes('TEST ads:'));
    assert(!host.textContent.includes('Consent reset requested'));
    focused = false; await render(true);
    assert(!host.textContent.includes('MOCK PRODUCTION BANNER'));
    focused = true; await render(true, true);
    assert(!host.textContent.includes('MOCK PRODUCTION BANNER'));
    await render(true, false, 'B');
    assert(!host.textContent.includes('MOCK PRODUCTION BANNER'));
    await React.act(async () => { await f.controller.declare('A', 'under-18'); });
    await render(true);
    assert(!host.textContent.includes('Advertisement'));
  } finally {
    await React.act(async () => root.unmount());
    dom.restore();
  }
}

(async () => {
  await configuration();
  await controllerChecks();
  await mountedChecks();
  await mountedChecks({ requestInfoUpdate: () => { throw Error('network'); } }, async ({ f, host, render }) => {
    await render();
    assert.equal(f.controller.getSnapshot().refresh, 'failed');
    assert(host.textContent.includes('Retry advertising privacy check'));
    assert(!f.calls.includes('initialize'));
    const count = f.calls.length;
    await render();
    assert.equal(f.calls.length, count, 'Mounted Settings does not loop after refresh failure');
  });
  const pending = deferred();
  await mountedChecks({ requestInfoUpdate: () => pending.promise }, async ({ f, render, setFocused, find, host }) => {
    await render();
    assert.equal(f.calls.filter(x => x === 'requestInfoUpdate').length, 1);
    setFocused(false);
    await render();
    await React.act(async () => { pending.resolve(info); });
    assert.equal(f.controller.getSnapshot().privacyRequired, false, 'Blurred discovery result ignored');
    setFocused(true);
    await render();
    assert(find(host, 'advertising-privacy-options'));
    assert.equal(f.calls.filter(x => x === 'requestInfoUpdate').length, 2, 'Fresh safe discovery after cancellation');
    assert(!f.calls.includes('loadAndShowConsentFormIfRequired'));
    assert(!f.calls.includes('initialize'));
  });
  console.log('PASS: exact production config/native mods, disabled defaults/OTA isolation, TCF-only gates, no production debug/reset/diagnostics, NPA banner, account/stale callbacks, cold Settings discovery and serialized privacy flow. Mocked/synthetic only.');
})().catch(error => { console.error(error); process.exitCode = 1; });
