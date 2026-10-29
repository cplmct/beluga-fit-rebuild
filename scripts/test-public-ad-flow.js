/* All SDK, consent, native views and storage calls simulated. No live traffic. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { buildAdvertisingConfig, TEST_BANNER_ID } = require('../config/advertising');
function load(path, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, { exports, require(name) {
    if (name in imports) return imports[name];
    throw Error(`Unexpected import ${name}`);
  } });
  return exports;
}
const original = load('src/advertising/controller.ts');
const age = load('src/advertising/ageDeclaration.ts');
const publicModule = load('src/advertising/publicFlowController.ts', {
  './controller': original, './ageDeclaration': age,
});
const { PublicFlowController, purposeOneVeto, isPublicFlowTest } = publicModule;
const config = buildAdvertisingConfig('public-ad-flow-test', 'public-flow-test');
const allowedInfo = {
  status: 'OBTAINED', canRequestAds: true, isConsentFormAvailable: false,
  privacyOptionsRequirementStatus: 'REQUIRED',
};
const safe = () => true;
function fixture(overrides = {}, cfg = config, ioOverrides = {}) {
  const values = new Map();
  const io = {
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) { values.set(key, value); },
    async removeItem(key) { values.delete(key); },
    ...ioOverrides,
  };
  const calls = [];
  const sdk = {};
  const defaults = { requestInfoUpdate: allowedInfo, loadAndShowConsentFormIfRequired: allowedInfo,
    getConsentInfo: allowedInfo, showPrivacyOptionsForm: allowedInfo,
    getGdprApplies: true, getPurposeConsents: '1100111111' };
  for (const name of [...Object.keys(defaults), 'configure', 'initialize']) {
    sdk[name] = async (...args) => {
      assert.equal(args.length, 0, 'No account/age/fitness data is sent to SDK methods');
      calls.push(name);
      return overrides[name] ? overrides[name]() : defaults[name];
    };
  }
  const controller = new PublicFlowController(cfg, new age.AgeDeclarationStore(io),
    () => { calls.push('load'); return sdk; },
    async () => { assert(!controller.getSnapshot().ready, 'Banner must be removed before privacy form'); });
  return { controller, calls, io, values };
}
async function adult(f, owner = 'A') {
  await f.controller.setOwner(owner);
  await f.controller.declare(owner, 'adult');
}
const drain = async () => { for (let i = 0; i < 25; i++) await Promise.resolve(); };

async function mountedUi() {
  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const dom = require('./helpers/mock-dom');
  const host = dom.install();
  const root = createRoot(host);
  const f = fixture();
  await f.controller.setOwner('A');
  let focused = true;
  let width = 360;
  let latest;
  let mounted = 0;
  let unmounted = 0;
  const listeners = new Set();
  const appState = { currentState: 'active', addEventListener(_event, fn) {
    listeners.add(fn); return { remove() { listeners.delete(fn); } };
  } };
  function View({ children, style, onLayout }) {
    React.useEffect(() => onLayout?.({ nativeEvent: { layout: { width } } }), [width]);
    return React.createElement('div', { 'data-height': style?.height }, children);
  }
  function Banner(props) {
    latest = props;
    React.useEffect(() => { mounted++; return () => { unmounted++; }; }, []);
    return React.createElement('span', null, 'SAMPLE PUBLIC BANNER');
  }
  const ui = load('src/advertising/AdvertisingUi.android.tsx', {
    react: React, 'react/jsx-runtime': require('react/jsx-runtime'),
    'react-native': { AppState: appState, View,
      Text: ({ children }) => React.createElement('span', null, children),
      TouchableOpacity: ({ children, onPress, disabled, testID }) => React.createElement(
        'button', { onClick: onPress, disabled, 'data-testid': testID }, children),
      StyleSheet: { create: styles => styles } },
    '@react-navigation/native': { useIsFocused: () => focused },
    './runtime.android': { publicFlow: f.controller, advertising: { enabled: false },
      internalTestAdvertising: { enabled: false },
      loadAndroidAds: () => ({ BannerAd: Banner, BannerAdSize: { BANNER: 'BANNER' } }) },
    './controller': original,
  });
  const render = async (blocked = false, ownerUserId = 'A') => React.act(async () => {
    root.render(React.createElement(React.Fragment, null,
      React.createElement(ui.HomeBanner, { blocked, ownerUserId }),
      React.createElement(ui.AdvertisingAgeDeclaration, { blocked, ownerUserId }),
      React.createElement(ui.AdvertisingPrivacyOptions, { blocked, ownerUserId })));
  });
  function find(node, predicate) {
    if (predicate(node)) return node;
    for (const child of node.childNodes || []) {
      const found = find(child, predicate);
      if (found) return found;
    }
  }
  const press = async id => React.act(async () => {
    const button = find(host, node => node.attributes?.['data-testid'] === id);
    assert(button, id);
    const props = button[Object.keys(button).find(key => key.startsWith('__reactProps$'))];
    assert(!props.disabled, id);
    props.onClick();
  });
  try {
    await render();
    assert(host.textContent.includes('not identity verification'));
    assert(!host.textContent.includes('Start test-banner'));
    assert(!host.textContent.includes('Stop test-banner'));
    assert.equal(f.calls.length, 0);
    await press('advertising-age-under-18');
    assert.equal(f.calls.length, 0);
    await press('advertising-age-prefer-not');
    assert.equal(f.calls.length, 0);
    await press('advertising-age-adult');
    assert(host.textContent.includes('SAMPLE PUBLIC BANNER'));
    assert(host.textContent.includes('Advertising privacy options'), 'Required entry is not an ad veto');
    assert.equal(latest.unitId, TEST_BANNER_ID);
    assert.equal(latest.requestOptions.requestNonPersonalizedAdsOnly, true);
    await press('advertising-age-under-18');
    assert(!host.textContent.includes('SAMPLE PUBLIC BANNER'));
    const minorCalls = f.calls.length;
    await render();
    assert.equal(f.calls.length, minorCalls);
    await press('advertising-age-adult');
    await press('advertising-privacy-options');
    assert(f.calls.includes('showPrivacyOptionsForm'));
    assert(f.calls.filter(x => x === 'requestInfoUpdate').length >= 3);
    await React.act(async () => latest.onAdFailedToLoad({ code: 'no-fill' }));
    assert(!host.textContent.includes('SAMPLE PUBLIC BANNER'));
    assert(find(host, node => node.attributes?.['data-height'] === '86'));
    const failedCalls = f.calls.length;
    await render();
    assert.equal(f.calls.length, failedCalls, 'No automatic retry');
    await React.act(async () => f.controller.retry());
    assert(host.textContent.includes('SAMPLE PUBLIC BANNER'));
    focused = false;
    await render();
    assert(!host.textContent.includes('SAMPLE PUBLIC BANNER'));
    focused = true;
    await render();
    assert(host.textContent.includes('SAMPLE PUBLIC BANNER'));
    await React.act(async () => {
      appState.currentState = 'background'; listeners.forEach(fn => fn('background'));
    });
    assert(!host.textContent.includes('SAMPLE PUBLIC BANNER'));
    await React.act(async () => {
      appState.currentState = 'active'; listeners.forEach(fn => fn('active'));
    });
    assert(host.textContent.includes('SAMPLE PUBLIC BANNER'));
    await render(true); // workout/recovery/cleanup/retained draft gate
    assert(!host.textContent.includes('SAMPLE PUBLIC BANNER'));
    width = 300;
    await render();
    assert(!host.textContent.includes('SAMPLE PUBLIC BANNER'));
    await React.act(async () => f.controller.setOwner('B'));
    await render(false, 'B');
    assert(!host.textContent.includes('SAMPLE PUBLIC BANNER'));
    assert.equal(f.controller.getSnapshot().declaration, 'unknown');
    await React.act(async () => root.unmount());
    assert.equal(mounted, unmounted);
    assert.equal(listeners.size, 0);
  } finally { dom.restore(); }
}

async function main() {
  assert(isPublicFlowTest(config));
  assert.equal(config.audienceApproved, false);
  for (const profile of [undefined, 'unknown', 'preview', 'production', 'internal-ad-rendering']) {
    for (const mode of [undefined, 'test', 'disabled', 'internal-test', 'public-flow-test']) {
      let candidate;
      try { candidate = buildAdvertisingConfig(profile, mode); } catch { continue; }
      assert(!isPublicFlowTest(candidate));
      const off = fixture({}, candidate);
      await adult(off);
      await off.controller.prepareHome(safe);
      assert.equal(off.calls.length, 0);
    }
  }
  for (const patch of [{ appId: 'live' }, { bannerId: 'other-test-id' },
    { audienceApproved: true }, { buildProfile: undefined }, { mode: 'live' }]) {
    assert(!isPublicFlowTest({ ...config, ...patch }));
  }
  assert.equal(purposeOneVeto(false, '1111111111'), 'applicability-unresolved');
  for (const value of ['', null, undefined, 'x', '1 1', '1'.repeat(25)]) {
    assert.equal(purposeOneVeto(true, value), 'purpose-one-unresolved');
  }
  assert.equal(purposeOneVeto(true, '0111111111'), 'purpose-one-refused');
  assert.equal(purposeOneVeto(true, '1100111111'), ''); // Personalization purposes 3/4 refused.
  const f = fixture();
  await f.controller.setOwner('A');
  for (const choice of ['unknown', 'under-18', 'prefer-not']) {
    await f.controller.declare('A', choice);
    await f.controller.prepareHome(safe);
    await f.controller.showPrivacyOptions(safe);
    assert.equal(f.calls.length, 0);
  }
  await f.controller.declare('A', 'adult');
  await Promise.all([f.controller.prepareHome(safe), f.controller.prepareHome(safe)]);
  assert(f.controller.getSnapshot().ready);
  assert.equal(f.calls.filter(x => x === 'initialize').length, 1);
  await f.controller.prepareHome(safe);
  assert.equal(f.calls.filter(x => x === 'requestInfoUpdate').length, 1);
  await f.controller.showPrivacyOptions(safe);
  assert(!f.controller.getSnapshot().ready);
  await f.controller.prepareHome(safe);
  assert.equal(f.calls.filter(x => x === 'requestInfoUpdate').length, 2);
  await f.controller.setOwner(null);
  await f.controller.prepareHome(safe);
  await f.controller.setOwner('B');
  assert.equal(f.controller.getSnapshot().declaration, 'unknown');
  await f.controller.declare('A', 'adult'); // A stale rendered handler cannot set B's category.
  assert.equal(f.controller.getSnapshot().declaration, 'unknown');
  await f.controller.prepareHome(safe);
  assert(!f.controller.getSnapshot().ready);
  await f.controller.setOwner('A');
  assert.equal(f.controller.getSnapshot().declaration, 'adult', 'Only same owner may restore');
  const newSession = fixture({}, config, { getItem: key => f.io.getItem(key) });
  await newSession.controller.setOwner('A');
  assert.equal(newSession.controller.getSnapshot().refresh, 'needed');
  await newSession.controller.prepareHome(safe);
  assert(newSession.calls.includes('requestInfoUpdate'), 'Restoring age never restores a consent grant');
  const restored = fixture({}, config, { async getItem() { throw Error('storage unavailable'); } });
  await restored.controller.setOwner('A');
  assert(!restored.controller.getSnapshot().loaded);
  await restored.controller.prepareHome(safe);
  assert.equal(restored.calls.length, 0);
  for (const raw of ['bad json', JSON.stringify({ version: 1, owner: 'B', declaration: 'adult' }),
    JSON.stringify({ version: 0, owner: 'A', declaration: 'adult' })]) {
    const corrupt = fixture({}, config, { async getItem() { return raw; } });
    await corrupt.controller.setOwner('A');
    assert(!corrupt.controller.getSnapshot().loaded);
    assert.equal(corrupt.calls.length, 0);
  }
  const badWrite = fixture({}, config, { async setItem() { throw Error('disk full'); } });
  await adult(badWrite);
  assert(!badWrite.controller.getSnapshot().loaded);
  assert.equal(badWrite.calls.length, 0);
  let releaseRead;
  const delayedRead = fixture({}, config, { getItem(key) {
    return key.endsWith(':A') ? new Promise(resolve => { releaseRead = resolve; }) : Promise.resolve(null);
  } });
  const loadingA = delayedRead.controller.setOwner('A');
  await drain();
  await delayedRead.controller.setOwner('B');
  releaseRead(JSON.stringify({ version: 1, owner: 'A', declaration: 'adult' }));
  await loadingA;
  assert.equal(delayedRead.controller.getSnapshot().owner, 'B');
  assert.equal(delayedRead.controller.getSnapshot().declaration, 'unknown');
  // A read on returning to an owner must wait for their pending write.
  let releaseWrite;
  const delayedWrite = fixture({}, config, { setItem(key, value) {
    return new Promise(resolve => { releaseWrite = () => { delayedWrite.values.set(key, value); resolve(); }; });
  } });
  await delayedWrite.controller.setOwner('A');
  const savingA = delayedWrite.controller.declare('A', 'under-18');
  await drain();
  await delayedWrite.controller.setOwner('B');
  const returningA = delayedWrite.controller.setOwner('A');
  releaseWrite();
  await Promise.all([savingA, returningA]);
  assert.equal(delayedWrite.controller.getSnapshot().declaration, 'under-18');
  for (const overrides of [
    { getConsentInfo: async () => ({ ...allowedInfo, canRequestAds: false }) },
    { getGdprApplies: async () => false }, // Missing OR explicit false: unresolved, including US cases.
    { getGdprApplies: async () => undefined },
    { getConsentInfo: async () => ({ ...allowedInfo, status: 'NOT_REQUIRED' }) },
    { getPurposeConsents: async () => '' }, { getPurposeConsents: async () => 'bad' },
    { getPurposeConsents: async () => '0111111111' },
  ]) {
    const blocked = fixture(overrides);
    await adult(blocked);
    await blocked.controller.prepareHome(safe);
    assert(!blocked.controller.getSnapshot().ready);
    assert(!blocked.calls.includes('configure'));
    assert(!blocked.calls.includes('initialize'));
  }
  const refreshFailure = fixture({ async requestInfoUpdate() { throw Error('offline'); } });
  await adult(refreshFailure);
  await refreshFailure.controller.prepareHome(safe);
  await refreshFailure.controller.prepareHome(safe);
  assert.equal(refreshFailure.controller.getSnapshot().refresh, 'failed');
  assert(!refreshFailure.calls.includes('getConsentInfo'), 'No cached-status fallback after failure');
  assert(!refreshFailure.calls.includes('initialize'));
  let offline = true;
  const retried = fixture({ async requestInfoUpdate() {
    if (offline) throw Error('offline');
    return allowedInfo;
  } });
  await adult(retried);
  await retried.controller.prepareHome(safe);
  offline = false;
  retried.controller.retry();
  await retried.controller.prepareHome(safe);
  assert(retried.controller.getSnapshot().ready);
  assert.equal(retried.calls.filter(x => x === 'requestInfoUpdate').length, 2);
  let withdrawn = false;
  const withdrawal = fixture({
    async showPrivacyOptionsForm() { withdrawn = true; return allowedInfo; },
    async getPurposeConsents() { return withdrawn ? '0111111111' : '1111111111'; },
  });
  await adult(withdrawal);
  await withdrawal.controller.prepareHome(safe);
  assert(withdrawal.controller.getSnapshot().ready);
  await withdrawal.controller.showPrivacyOptions(safe);
  await withdrawal.controller.prepareHome(safe);
  assert(!withdrawal.controller.getSnapshot().ready);
  assert.equal(withdrawal.controller.getSnapshot().reason, 'purpose-one-refused');
  assert(withdrawal.controller.getSnapshot().privacyRequired);
  let closeForm;
  const latePrivacy = fixture({ showPrivacyOptionsForm: () => new Promise(resolve => { closeForm = resolve; }) });
  await adult(latePrivacy);
  await latePrivacy.controller.prepareHome(safe);
  const showing = latePrivacy.controller.showPrivacyOptions(safe);
  await drain();
  await latePrivacy.controller.setOwner('B');
  const callsAtSwitch = latePrivacy.calls.length;
  closeForm(allowedInfo);
  await showing;
  assert.equal(latePrivacy.calls.length, callsAtSwitch, 'No old-owner SDK call after form dismissal');
  assert.equal(latePrivacy.controller.getSnapshot().owner, 'B');
  assert(!latePrivacy.controller.getSnapshot().ready);
  for (const method of ['requestInfoUpdate', 'loadAndShowConsentFormIfRequired', 'getConsentInfo',
    'getGdprApplies', 'getPurposeConsents', 'configure', 'initialize']) {
    let release;
    const stale = fixture({ [method]: () => new Promise(resolve => { release = resolve; }) });
    await adult(stale);
    const pending = stale.controller.prepareHome(safe);
    await drain();
    assert(release, method);
    await stale.controller.declare('A', 'under-18');
    const callsAtChange = stale.calls.length;
    release(method === 'getGdprApplies' ? true : method === 'getPurposeConsents' ? '1111111111' : allowedInfo);
    await pending;
    assert.equal(stale.calls.length, callsAtChange, method);
    assert(!stale.controller.getSnapshot().ready);
    const failed = fixture({ async [method]() { throw Error('SDK error'); } });
    await adult(failed);
    await failed.controller.prepareHome(safe);
    assert(!failed.controller.getSnapshot().ready);
    assert(failed.controller.getSnapshot().error);
    let finishDeleted;
    const deleted = fixture({ [method]: () => new Promise(resolve => { finishDeleted = resolve; }) });
    await adult(deleted);
    const working = deleted.controller.prepareHome(safe);
    await drain();
    assert(finishDeleted, method);
    const removing = deleted.controller.removeDeclaration('A');
    assert.equal(deleted.controller.getSnapshot().owner, null, 'Invalidate synchronously before removal');
    assert(!deleted.controller.getSnapshot().ready);
    await removing;
    const callsAtDeletion = deleted.calls.length;
    finishDeleted(method === 'getGdprApplies' ? true : method === 'getPurposeConsents' ? '1111111111' : allowedInfo);
    await working;
    assert.equal(deleted.calls.length, callsAtDeletion, `${method}: no stale post-deletion SDK call`);
    assert.equal(deleted.values.size, 0);
    await deleted.controller.setOwner('A');
    assert.equal(deleted.controller.getSnapshot().declaration, 'unknown');
    assert(!deleted.controller.getSnapshot().loaded);
  }
  const failedRemoval = fixture({}, config, { async removeItem() { throw Error('disk failure'); } });
  await adult(failedRemoval);
  await failedRemoval.controller.prepareHome(safe);
  const callsBeforeFailure = failedRemoval.calls.length;
  const removal = failedRemoval.controller.removeDeclaration('A');
  assert(!failedRemoval.controller.getSnapshot().ready);
  await assert.rejects(removal, /disk failure/);
  await failedRemoval.controller.setOwner('A');
  await failedRemoval.controller.declare('A', 'adult');
  await failedRemoval.controller.prepareHome(safe);
  assert.equal(failedRemoval.calls.length, callsBeforeFailure);
  assert(failedRemoval.values.has('beluga:advertising-age:v1:A'));
  const otherOwner = fixture();
  await adult(otherOwner, 'B');
  await otherOwner.controller.prepareHome(safe);
  const beforeRemoval = otherOwner.controller.getSnapshot();
  await otherOwner.controller.removeDeclaration('A');
  assert.strictEqual(otherOwner.controller.getSnapshot(), beforeRemoval, 'A cleanup cannot invalidate B');
  let finishWrite;
  const raced = fixture({}, config, { setItem(key, value) {
    return new Promise(resolve => { finishWrite = () => { raced.values.set(key, value); resolve(); }; });
  } });
  await raced.controller.setOwner('A');
  const writing = raced.controller.declare('A', 'adult');
  await drain();
  const clearing = raced.controller.removeDeclaration('A');
  finishWrite();
  await Promise.all([writing, clearing]);
  assert.equal(raced.values.size, 0, 'Removal follows the late write and leaves no declaration');
  assert.equal(raced.controller.getSnapshot().owner, null);
  const appSource = fs.readFileSync('App.tsx', 'utf8');
  assert(appSource.includes('return () => setAdvertisingOwner(null)'));
  assert(!fs.readFileSync('src/advertising/runtime.android.ts', 'utf8').includes('gad_rdp'));
  assert(!fs.readFileSync('src/advertising/publicFlowController.ts', 'utf8').includes('getUserChoices()'));
  await mountedUi();
  console.log('PASS: public-test/sample-ID isolation, account-scoped age persistence/errors/races, no minor/unknown SDK calls, current-session refresh, Purpose 1 acceptance/refusal/ambiguity, no personalization veto, privacy withdrawal/reassessment, stale callbacks, mounted choices/lifecycle/no-fill/width/ownership cleanup.');
  console.log('US: native GPP handling documented, NOT simulated as an approved request path; false/unknown applicability stays blocked. All SDK/storage/native views mocked; no native/network verification.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
