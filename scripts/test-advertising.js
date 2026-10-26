/* Local tests: SDK, native manifest, consent/network and lifecycle are simulated.
 * No native builds, production calls or real ad requests. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { TEST_APP_ID, TEST_BANNER_ID, buildAdvertisingConfig } = require('../config/advertising');
const mod = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/advertising/controller.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: mod.exports, module: mod });
const { AdvertisingController, permitsBanner, readEmbeddedConfig, isEnabled } = mod.exports;

const allowedConfig = { mode: 'test', appId: TEST_APP_ID, bannerId: TEST_BANNER_ID, audienceApproved: true };
const noConsent = {
  status: 'NOT_REQUIRED', canRequestAds: true, isConsentFormAvailable: false,
  privacyOptionsRequirementStatus: 'NOT_REQUIRED',
};

function fixture(overrides = {}) {
  let info = { ...noConsent };
  const calls = [];
  const sdk = {
    async requestInfoUpdate() { calls.push('refresh'); return info; },
    async getConsentInfo() { calls.push('info'); return info; },
    async loadAndShowConsentFormIfRequired() { calls.push('form'); return info; },
    async showPrivacyOptionsForm() { calls.push('options'); return info; },
    async getGdprApplies() { return false; },
    async configure() { calls.push('configure'); },
    async initialize() { calls.push('initialize'); },
    ...overrides,
  };
  const controller = new AdvertisingController(allowedConfig, () => { calls.push('load'); return sdk; });
  return { controller, calls, setInfo(value) { info = { ...noConsent, ...value }; } };
}

async function mountedLifecycle() {
  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const dom = require('./helpers/mock-dom');
  const host = dom.install();
  const root = createRoot(host);
  const f = fixture();
  let focused = true;
  let latestBanner;
  let mounted = 0;
  let unmounted = 0;
  let workoutClicks = 0;
  const stateListeners = new Set();
  const appState = {
    currentState: 'active',
    addEventListener(_event, listener) {
      stateListeners.add(listener);
      return { remove() { stateListeners.delete(listener); } };
    },
  };
  function View({ children, style, onLayout }) {
    React.useEffect(() => {
      onLayout?.({ nativeEvent: { layout: { width: 360 } } });
    }, []);
    return React.createElement('div', { 'data-height': style?.height }, children);
  }
  function Banner(props) {
    latestBanner = props;
    React.useEffect(() => { mounted++; return () => { unmounted++; }; }, []);
    return React.createElement('div', null, 'TEST BANNER');
  }
  const loaded = {};
  const source = ts.transpileModule(fs.readFileSync('src/advertising/AdvertisingUi.android.tsx', 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    },
  }).outputText;
  vm.runInNewContext(source, {
    exports: loaded,
    require(name) {
      if (name === 'react' || name === 'react/jsx-runtime') return require(name);
      if (name === 'react-native') return {
        AppState: appState, View,
        Text: ({ children }) => React.createElement('span', null, children),
        TouchableOpacity: ({ children, onPress, disabled }) => React.createElement('button', { onClick: onPress, disabled }, children),
        StyleSheet: { create: styles => styles },
      };
      if (name === '@react-navigation/native') return { useIsFocused: () => focused };
      if (name === './runtime.android') return {
        advertising: f.controller,
        loadAndroidAds: () => ({ BannerAd: Banner, BannerAdSize: { BANNER: 'BANNER' } }),
      };
      if (name === './controller') return mod.exports;
      throw Error(`Unexpected test import: ${name}`);
    },
  });
  const render = async blocked => {
    await React.act(async () => {
      root.render(React.createElement(React.Fragment, null,
        React.createElement(loaded.HomeBanner, { blocked }),
        React.createElement('button', { onClick: () => workoutClicks++ }, 'Start workout')));
    });
  };
  try {
    await render(false);
    assert(host.textContent.includes('TEST BANNER'));
    assert.equal(latestBanner.unitId, TEST_BANNER_ID);
    assert.equal(latestBanner.requestOptions.requestNonPersonalizedAdsOnly, true);
    assert.equal(mounted, 1);
    await React.act(async () => { latestBanner.onAdFailedToLoad({ code: 'no-fill' }); });
    assert(!host.textContent.includes('TEST BANNER'));
    assert(host.textContent.includes('Start workout'));
    assert(host.childNodes.some(node => node.attributes?.['data-height'] === '86'));
    // Invoke the rendered synthetic workout-control handler after ad failure.
    const button = host.childNodes.find(node => node.tagName === 'BUTTON');
    const reactProps = Object.keys(button).find(key => key.startsWith('__reactProps$'));
    button[reactProps].onClick();
    assert.equal(workoutClicks, 1);
    focused = false;
    await render(false);
    focused = true;
    await render(false);
    assert(host.textContent.includes('TEST BANNER'));
    await React.act(async () => {
      appState.currentState = 'background';
      stateListeners.forEach(listener => listener('background'));
    });
    assert(!host.textContent.includes('TEST BANNER'));
    await React.act(async () => {
      appState.currentState = 'active';
      stateListeners.forEach(listener => listener('active'));
    });
    assert(host.textContent.includes('TEST BANNER'));
    await render(true); // cleanup/recovery/retained workout gate
    assert(!host.textContent.includes('TEST BANNER'));
    await React.act(async () => { root.unmount(); }); // account boundary unmount
    assert.equal(mounted, unmounted);
    assert.equal(stateListeners.size, 0);
    assert.equal(f.calls.filter(x => x === 'initialize').length, 1);
    console.log('PASS: mounted React banner lifecycle — focus, foreground/background, blocking, no-fill, fixed slot, unmount cleanup; native SDK/view mocked.');
  } finally {
    dom.restore();
  }
}

async function main() {
  for (const profile of ['development', 'preview']) {
    const config = buildAdvertisingConfig(profile, 'test');
    assert.equal(config.audienceApproved, false);
    assert.equal(config.appId, TEST_APP_ID);
    assert.equal(config.bannerId, TEST_BANNER_ID);
    assert.throws(() => buildAdvertisingConfig(profile, undefined));
    assert.throws(() => buildAdvertisingConfig(profile, 'live'));
  }
  for (const profile of [undefined, 'unknown', 'production']) {
    assert.equal(buildAdvertisingConfig(profile, 'test').mode, 'disabled');
  }
  const eas = require('../eas.json');
  assert.equal(eas.build.development.env.BELUGA_ADS_MODE, 'test');
  assert.equal(eas.build.preview.env.BELUGA_ADS_MODE, 'test');
  assert.equal(eas.build.production.env.BELUGA_ADS_MODE, 'disabled');
  assert.equal(readEmbeddedConfig('bad json').mode, undefined);
  assert.equal(readEmbeddedConfig(undefined).mode, undefined);
  assert.equal(readEmbeddedConfig(JSON.stringify({ extra: { belugaAdvertising: allowedConfig } })).mode, 'test');
  for (const config of [{}, { ...allowedConfig, mode: 'live' },
    { ...allowedConfig, audienceApproved: false }, { ...allowedConfig, bannerId: 'live' },
    { ...allowedConfig, appId: 'live' }]) {
    assert.equal(isEnabled(config), false);
    const c = new AdvertisingController(config, () => { throw Error('MUST NOT LOAD'); });
    await c.refreshAtLaunch();
    assert.equal(await c.prepareHome(() => true), false);
    await c.showPrivacyOptions(() => true);
  }
  assert.equal(permitsBanner(noConsent, false), true);
  for (const status of ['OBTAINED', 'REQUIRED', 'UNKNOWN']) {
    assert.equal(permitsBanner({ ...noConsent, status }, false), false);
  }
  for (const gdpr of [true, undefined]) assert.equal(permitsBanner(noConsent, gdpr), false);
  assert.equal(permitsBanner({ ...noConsent, canRequestAds: false }, false), false);
  assert.equal(permitsBanner({ ...noConsent, privacyOptionsRequirementStatus: 'REQUIRED' }, false), false);

  const f = fixture();
  await Promise.all([f.controller.refreshAtLaunch(), f.controller.refreshAtLaunch()]);
  assert.equal(f.calls.filter(x => x === 'refresh').length, 1);
  assert.equal(f.calls.includes('initialize'), false);
  assert.equal(await f.controller.prepareHome(() => false), false); // background/unfocused/cleanup
  assert.equal(await f.controller.prepareHome(() => true), true);
  assert.equal(await f.controller.prepareHome(() => true), true);
  assert.equal(f.calls.filter(x => x === 'initialize').length, 1);
  assert(f.calls.indexOf('configure') < f.calls.indexOf('initialize'));
  f.setInfo({ status: 'OBTAINED' }); // refusal OR acceptance; neither assumed sufficient
  assert.equal(await f.controller.prepareHome(() => true), false);

  let safe = true;
  const stale = fixture({ async requestInfoUpdate() { safe = false; return noConsent; } });
  assert.equal(await stale.controller.prepareHome(() => safe), false);
  assert(!stale.calls.includes('initialize'));
  for (const method of ['requestInfoUpdate', 'getConsentInfo', 'getGdprApplies', 'configure', 'initialize']) {
    const failing = fixture({ async [method]() { throw Error('offline'); } });
    assert.equal(await failing.controller.prepareHome(() => true), false, method);
    assert(failing.controller.getSnapshot().error);
  }
  const required = fixture();
  required.setInfo({ status: 'REQUIRED', isConsentFormAvailable: true, privacyOptionsRequirementStatus: 'REQUIRED' });
  assert.equal(await required.controller.prepareHome(() => false), false);
  assert(!required.calls.includes('form'));
  assert.equal(await required.controller.prepareHome(() => true), false);
  assert(required.calls.includes('form'));
  assert(!required.calls.includes('initialize'));
  await required.controller.showPrivacyOptions(() => false);
  assert(!required.calls.includes('options'));
  await required.controller.showPrivacyOptions(() => true);
  assert(required.calls.includes('options'));
  const brokenForm = fixture({ async loadAndShowConsentFormIfRequired() { throw Error('offline'); } });
  brokenForm.setInfo({ status: 'REQUIRED', isConsentFormAvailable: true });
  assert.equal(await brokenForm.controller.prepareHome(() => true), false);

  // Android manifest mod exercised on a synthetic manifest, no prebuild/build.
  const plugin = require('../plugins/withAndroidTestAds');
  let config = plugin({ name: 'Test', slug: 'test' });
  const result = await config.mods.android.manifest({
    ...config,
    modResults: { manifest: { $: {}, application: [{ $: { 'android:name': '.MainApplication' } }] } },
    modRequest: { platform: 'android', modName: 'manifest', projectRoot: process.cwd() },
  });
  const metadata = result.modResults.manifest.application[0]['meta-data'];
  assert.equal(metadata.find(m => m.$['android:name'].endsWith('APPLICATION_ID')).$['android:value'], TEST_APP_ID);
  assert.equal(metadata.find(m => m.$['android:name'].endsWith('DELAY_APP_MEASUREMENT_INIT')).$['android:value'], 'true');
  assert(!config.mods.ios);
  assert.equal(require('../react-native.config').dependencies['react-native-google-mobile-ads'].platforms.ios, null);
  const ui = fs.readFileSync('src/advertising/AdvertisingUi.android.tsx', 'utf8');
  assert(ui.includes('requestNonPersonalizedAdsOnly: true'));
  assert(ui.includes('BannerAdSize.BANNER'));
  assert(ui.includes('setFailed(true)'));
  assert(ui.includes('width >= 320'));
  assert(!ui.includes('setInterval'));
  for (const path of ['src/advertising/runtime.ts', 'src/advertising/AdvertisingUi.tsx']) {
    assert(!fs.readFileSync(path, 'utf8').includes('react-native-google-mobile-ads'));
  }
  for (const path of fs.readdirSync('src/advertising')) {
    const text = fs.readFileSync(`src/advertising/${path}`, 'utf8');
    assert(!/from ['"].*(?:AuthContext|supabase)|keywords:|customTargeting:/.test(text), path);
    assert(!text.includes('5534915161634783'), path);
  }
  const native = fs.readFileSync('src/advertising/runtime.android.ts', 'utf8');
  assert(native.includes("requireOptionalNativeModule") && native.includes('embedded?.manifest'));
  assert(!native.split('\n').filter(line => !line.trim().startsWith('//')).join('\n').includes('Constants.expoConfig'));
  await mountedLifecycle();
  console.log('PASS: exact test configuration, disabled audience/production, consent predicates, refresh/init ordering, stale lifecycle, SDK failures, privacy forms, synthetic manifest and isolation checks.');
  console.log('NOT VERIFIED: native build, real UMP/SDK network, native banner no-fill/layout or actual vendor permissions. Audience gate remains false.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
