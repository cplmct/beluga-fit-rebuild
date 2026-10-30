/* Mocked controller, native config and mounted React view checks only.
 * No real ads, UMP network, native build or SDK calls. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const {
  buildAdvertisingConfig, validateSampleIdentifiers, TEST_APP_ID, TEST_BANNER_ID, INTERNAL_TEST_PROFILE,
} = require('../config/advertising');

function loadTs(path, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    },
  }).outputText, {
    exports,
    require(name) {
      if (name in imports) return imports[name];
      throw Error(`Unexpected import: ${name}`);
    },
  });
  return exports;
}
const real = loadTs('src/advertising/controller.ts');
const { InternalTestAdsController, isInternalTestConfig } = loadTs(
  'src/advertising/internalTestController.ts', { './controller': real },
);
const config = buildAdvertisingConfig(INTERNAL_TEST_PROFILE, 'internal-test');
const info = {
  status: 'NOT_REQUIRED', canRequestAds: true, isConsentFormAvailable: false,
  privacyOptionsRequirementStatus: 'NOT_REQUIRED',
};
function fixture(overrides = {}, nativeConfig = config, emulator = true) {
  const calls = [];
  let consent = { ...info };
  const sdk = {};
  for (const name of ['requestInfoUpdate', 'loadAndShowConsentFormIfRequired', 'getConsentInfo',
    'showPrivacyOptionsForm', 'configure', 'initialize']) {
    sdk[name] = async () => {
      calls.push(name);
      return name in overrides ? overrides[name]() : consent;
    };
  }
  const controller = new InternalTestAdsController(nativeConfig, () => emulator, () => {
    calls.push('load'); return sdk;
  });
  return { controller, calls, setInfo(value) { consent = { ...info, ...value }; } };
}
const safe = () => true;

async function mountedUi() {
  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const dom = require('./helpers/mock-dom');
  const host = dom.install();
  const root = createRoot(host);
  const f = fixture();
  f.setInfo({ privacyOptionsRequirementStatus: 'REQUIRED' });
  let focused = true;
  let width = 360;
  let latestBanner;
  let mounts = 0;
  let unmounts = 0;
  const listeners = new Set();
  const appState = {
    currentState: 'active',
    addEventListener(_event, fn) { listeners.add(fn); return { remove() { listeners.delete(fn); } }; },
  };
  function View({ children, style, onLayout }) {
    React.useEffect(() => {
      onLayout?.({ nativeEvent: { layout: { width } } });
    }, [width]);
    return React.createElement('div', { 'data-height': style?.height }, children);
  }
  function Banner(props) {
    latestBanner = props;
    React.useEffect(() => { mounts++; return () => { unmounts++; }; }, []);
    return React.createElement('span', null, 'GOOGLE SAMPLE BANNER');
  }
  const ui = loadTs('src/advertising/AdvertisingUi.android.tsx', {
    react: React, 'react/jsx-runtime': require('react/jsx-runtime'),
    'react-native': {
      AppState: appState, View,
      Text: ({ children }) => React.createElement('span', null, children),
      TouchableOpacity: ({ children, onPress, disabled, testID }) =>
        React.createElement('button', { onClick: onPress, disabled, 'data-testid': testID }, children),
      StyleSheet: { create: styles => styles },
    },
    '@react-navigation/native': { useIsFocused: () => focused },
    './runtime.android': {
      advertising: new real.AdvertisingController({}, () => { throw Error('Real controller MUST NOT load'); }),
      internalTestAdvertising: f.controller,
      publicFlow: { enabled: false },
      loadAndroidAds: () => ({ BannerAd: Banner, BannerAdSize: { BANNER: 'BANNER' } }),
    },
    './controller': real,
    './publicFlowStatus': { publicFlowStatus: () => { throw Error('Public UI must stay disabled'); } },
  });
  const render = async (blocked = false) => React.act(async () => {
    root.render(React.createElement(React.Fragment, null,
      React.createElement(ui.HomeBanner, { blocked }),
      React.createElement(ui.AdvertisingPrivacyOptions, { blocked })));
  });
  function find(node, predicate) {
    if (predicate(node)) return node;
    for (const child of node.childNodes || []) {
      const match = find(child, predicate);
      if (match) return match;
    }
  }
  const press = async id => React.act(async () => {
    const button = find(host, node => node.attributes?.['data-testid'] === id);
    assert(button, id);
    const props = button[Object.keys(button).find(key => key.startsWith('__reactProps$'))];
    assert(!props.disabled, id);
    props.onClick();
  });
  const changeAppState = async state => React.act(async () => {
    appState.currentState = state;
    listeners.forEach(fn => fn(state));
  });
  try {
    await render();
    assert.equal(f.calls.length, 0, 'No launch initialization or consent request');
    assert(host.textContent.includes('Internal test ads — not production consent validation'));
    assert(!host.textContent.includes('GOOGLE SAMPLE BANNER'));
    await press('internal-test-ads-start');
    assert(host.textContent.includes('GOOGLE SAMPLE BANNER'));
    assert(!host.textContent.includes('Advertising privacy options'), 'Settings entry is independent');
    assert.equal(latestBanner.unitId, TEST_BANNER_ID);
    assert.equal(latestBanner.size, 'BANNER');
    assert.equal(latestBanner.requestOptions.requestNonPersonalizedAdsOnly, true);
    await press('internal-test-ads-stop');
    assert(!host.textContent.includes('GOOGLE SAMPLE BANNER'));
    const stoppedCalls = f.calls.length;
    await render();
    assert.equal(f.calls.length, stoppedCalls);
    await press('internal-test-ads-start');
    await React.act(async () => latestBanner.onAdFailedToLoad({ code: 'no-fill' }));
    assert(!host.textContent.includes('GOOGLE SAMPLE BANNER'));
    assert(find(host, node => node.attributes?.['data-height'] === '86'));
    const failedCalls = f.calls.length;
    await render();
    assert.equal(f.calls.length, failedCalls, 'No automatic no-fill retry');
    await press('internal-test-ads-start');
    focused = false;
    await render();
    assert(!host.textContent.includes('GOOGLE SAMPLE BANNER'));
    focused = true;
    await render();
    assert(!host.textContent.includes('GOOGLE SAMPLE BANNER'), 'Navigation return requires Start');
    await press('internal-test-ads-start');
    await changeAppState('background');
    assert(!host.textContent.includes('GOOGLE SAMPLE BANNER'));
    await changeAppState('active');
    assert(!host.textContent.includes('GOOGLE SAMPLE BANNER'), 'Foreground requires Start');
    await press('internal-test-ads-start');
    await render(true);
    assert(!host.textContent.includes('GOOGLE SAMPLE BANNER'), 'Workout/recovery/cleanup gate');
    await render(false);
    await press('internal-test-ads-privacy');
    assert(!f.controller.getSnapshot().active);
    assert(f.calls.includes('showPrivacyOptionsForm'));
    width = 300;
    await render();
    await press('internal-test-ads-start');
    assert(!host.textContent.includes('GOOGLE SAMPLE BANNER'), 'Narrow container');
    width = 360;
    await render();
    assert(host.textContent.includes('GOOGLE SAMPLE BANNER'));
    await React.act(async () => root.unmount());
    assert.equal(f.controller.getSnapshot().active, false);
    assert.equal(mounts, unmounts);
    assert.equal(listeners.size, 0);
  } finally { dom.restore(); }
}

async function main() {
  assert(isInternalTestConfig(config));
  assert.equal(config.audienceApproved, false);
  assert.equal(real.isEnabled(config), false);
  validateSampleIdentifiers(config);
  const invalid = [
    {}, { ...config, mode: 'test' }, { ...config, mode: 'live' },
    { ...config, buildProfile: 'preview' }, { ...config, buildProfile: 'production' },
    { ...config, audienceApproved: true }, { ...config, bannerId: 'live' },
    { ...config, appId: 'live' }, { ...config, bannerId: '' },
  ];
  for (const profile of ['preview', 'production', 'development', 'unknown', undefined]) {
    for (const mode of ['test', 'disabled', 'internal-test', undefined]) {
      try { invalid.push(buildAdvertisingConfig(profile, mode)); }
      catch { /* A configuration-time rejection also fails closed. */ }
    }
  }
  for (const value of invalid) {
    assert.equal(isInternalTestConfig(value), false);
    const f = fixture({}, value);
    await f.controller.start(safe);
    assert.equal(f.calls.length, 0);
  }
  for (const value of [{ ...config, appId: 'live' }, { ...config, bannerId: 'other-test' }, {}]) {
    assert.throws(() => validateSampleIdentifiers(value));
    assert.throws(() => require('../plugins/withAndroidTestAds')({ extra: { belugaAdvertising: value } }));
  }
  assert.throws(() => buildAdvertisingConfig(INTERNAL_TEST_PROFILE, undefined));
  assert.throws(() => buildAdvertisingConfig(INTERNAL_TEST_PROFILE, 'live'));
  const eas = require('../eas.json');
  assert.equal(eas.build[INTERNAL_TEST_PROFILE].extends, 'preview');
  assert.equal(eas.build[INTERNAL_TEST_PROFILE].env.BELUGA_ADS_MODE, 'internal-test');
  assert.equal(eas.build.preview.android.buildType, 'apk');
  assert.equal(eas.build.preview.node, '22.0.0');
  assert.equal(eas.build.preview.env.BELUGA_ADS_MODE, 'test');
  assert.equal(eas.build.production.env.BELUGA_ADS_MODE, 'disabled');
  const device = fixture({}, config, false);
  await device.controller.start(safe);
  assert.equal(device.calls.length, 0, 'Physical device is blocked');
  const f = fixture();
  assert.equal(f.calls.length, 0);
  await f.controller.start(() => false);
  assert.equal(f.calls.length, 0);
  await Promise.all([f.controller.start(safe), f.controller.start(safe)]);
  assert(f.controller.getSnapshot().ready);
  assert.deepEqual(f.calls, ['load', 'requestInfoUpdate', 'loadAndShowConsentFormIfRequired',
    'getConsentInfo', 'configure', 'initialize']);
  f.controller.stop();
  assert(!f.controller.getSnapshot().ready);
  await f.controller.start(safe);
  assert.equal(f.calls.filter(x => x === 'initialize').length, 1);
  for (const value of [
    { status: 'UNKNOWN' }, { status: 'REQUIRED', isConsentFormAvailable: true },
    { canRequestAds: false }, { status: 'OBTAINED', canRequestAds: false },
  ]) {
    const blocked = fixture();
    blocked.setInfo(value);
    await blocked.controller.start(safe);
    assert(!blocked.calls.includes('configure'));
    assert(!blocked.calls.includes('initialize'));
    assert(!blocked.controller.getSnapshot().ready);
  }
  // Stop at every await boundary; no subsequent SDK method may run and a
  // pending form cannot be raced by a second Start, even after Stop.
  for (const method of ['requestInfoUpdate', 'loadAndShowConsentFormIfRequired',
    'getConsentInfo', 'configure', 'initialize']) {
    let resolve;
    const stale = fixture({ [method]: () => new Promise(done => { resolve = done; }) });
    const pending = stale.controller.start(safe);
    for (let i = 0; i < 20 && !resolve; i++) await Promise.resolve();
    assert(resolve, method);
    stale.controller.stop();
    const callsAtStop = stale.calls.length;
    await stale.controller.start(safe);
    assert.equal(stale.calls.length, callsAtStop);
    resolve(info);
    await pending;
    assert.equal(stale.calls.length, callsAtStop, method);
    assert(!stale.controller.getSnapshot().ready);
    assert(!stale.controller.getSnapshot().active);
    assert(!stale.controller.getSnapshot().busy);
    const failing = fixture({ async [method]() { throw Error('offline'); } });
    await failing.controller.start(safe);
    assert(!failing.controller.getSnapshot().ready);
    assert(failing.controller.getSnapshot().error);
  }
  const native = fs.readFileSync('src/advertising/runtime.android.ts', 'utf8');
  assert(native.includes("from 'expo-device'"));
  assert(native.includes('isDevice === false'));
  assert(native.includes('embedded?.manifest'));
  assert(!native.includes('AdsConsent.reset'));
  await mountedUi();
  console.log('PASS: internal-profile/sample-ID/emulator isolation, explicit start/stop, documented UMP blocking, single initialization, all async stop boundaries/failures, mounted no-fill/navigation/background/blocked/narrow/unmount checks.');
  console.log('MOCKED ONLY: no native SDK rendering, real UMP message, APK or network behavior verified.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
