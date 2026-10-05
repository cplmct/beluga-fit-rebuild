const assert = require('node:assert/strict');
const vm = require('node:vm');
const dom = require('./helpers/mock-dom');
const React = require('react');

const tick = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
function find(node, attribute, value) {
  if (node.attributes?.[attribute] === value) return node;
  for (const child of node.childNodes ?? []) {
    const match = find(child, attribute, value);
    if (match) return match;
  }
  return null;
}

module.exports = async function testOverlay({ environment, moduleFrom, extract }) {
  // Existing React + React DOM do the actual mounted reconciliation. Only the
  // native host components/DOM and SDK are mocked, not hooks or screen lifetime.
  dom.install();
  const { createRoot } = require('react-dom/client');
  const pendingResult = { id: 'saved-B-not-persisted', partial: true };
  const host = tag => ({ children, testID, pointerEvents }) => React.createElement(tag, {
    'data-testid': testID, 'data-pointer-events': pointerEvents,
  }, children);
  const native = { View: host('div'), Text: host('span'), TouchableOpacity: host('button'), ActivityIndicator: host('span'), Modal: host('section') };
  const jsx = require('react/jsx-runtime');

  async function mount(owner, cleanup = null) {
    const e = environment();
    const sdk = e.auth({ user: { id: owner } });
    if (cleanup) await e.cleanup.beginAccountCleanup(cleanup);
    const listeners = new Set();
    sdk.ctx.supabase.auth.onAuthStateChange = listener => {
      listeners.add(listener);
      return { data: { subscription: { unsubscribe() { listeners.delete(listener); } } } };
    };
    const auth = moduleFrom('src/contexts/AuthContext.tsx', {
      react: React,
      'react/jsx-runtime': jsx,
      'react-native': { Linking: { getInitialURL: async () => null, addEventListener: () => ({ remove() {} }) } },
      '@react-native-async-storage/async-storage': { __esModule: true, default: e.adapter },
      '../lib/supabase': { supabase: sdk.ctx.supabase },
      '../utils/workoutSession': e.storage, '../utils/accountCleanup': e.cleanup,
      '../utils/accountTransition': { withAccountTransitionLock: sdk.ctx.withAccountTransitionLock },
    });
    const counts = { mounted: 0, unmounted: 0 };
    let screen, authValue;
    function Screen() {
      const value = auth.useAuth();
      authValue = value;
      const [result] = React.useState(pendingResult);
      const guard = React.useRef(true);
      const [message, setMessage] = React.useState('');
      React.useEffect(() => {
        counts.mounted++;
        return () => { counts.unmounted++; };
      }, []);
      screen = { result, guard,
        async retry() { await value.retryAccountCleanup(); setMessage('Retry returned to this screen'); },
        async delete() { const { error } = await value.deleteAccount(); setMessage(error?.message ?? 'Deletion completed'); },
      };
      return React.createElement('div', { 'data-testid': 'retained-screen' }, message);
    }
    const context = {
      exports: {}, ...React, ...native,
      useAuth: auth.useAuth,
      useNavigationContainerRef: () => React.useRef({ navigate() {} }).current,
      NavigationContainer: ({ children }) => children,
      BottomTabNavigator: Screen, AuthStackNavigator: Screen,
      ChangePasswordScreen: Screen, OnboardingScreen: Screen, LaunchScreen: () => null,
      setupNotificationHandler() {}, scheduleInactivityReminder() {},
      Date, setTimeout, clearTimeout, require: name => {
        assert.equal(name, 'react/jsx-runtime'); return jsx;
      },
    };
    vm.runInNewContext(extract('App.tsx', ['AppContent']), context);
    const container = document.createElement('div');
    const root = createRoot(container);
    await React.act(async () => {
      root.render(React.createElement(auth.AuthProvider, null,
        React.createElement(context.exports.handlers.AppContent)));
      await tick(); await tick();
    });
    assert.equal(authValue.user.id, owner);
    assert.equal(counts.mounted, 1);
    return { e, sdk, container, root, counts, listeners, get screen() { return screen; }, get authValue() { return authValue; } };
  }

  let mounted;
  try {
    // B's in-memory result/duplicate guard survives a delayed, failing A retry.
    mounted = await mount('B', { ownerUserId: 'A', kind: 'sign-out' });
    const originalScreen = mounted.screen;
    const storedMarkerRead = deferred();
    const originalGet = mounted.e.adapter.getItem;
    mounted.e.adapter.getItem = key => key === '@beluga_active_workout_v1'
      ? storedMarkerRead.promise : originalGet(key);
    let retry;
    await React.act(async () => { retry = mounted.screen.retry(); await tick(); });
    assert.ok(find(mounted.container, 'data-testid', 'account-cleanup-overlay'));
    assert.ok(find(mounted.container, 'data-testid', 'retained-screen'));
    assert.equal(mounted.counts.unmounted, 0);
    assert.equal(mounted.screen.result, originalScreen.result);
    assert.equal(mounted.screen.guard, originalScreen.guard);
    assert.equal(mounted.screen.guard.current, true);
    await React.act(async () => { storedMarkerRead.reject(new Error('delayed storage read failure')); await retry; });
    assert.equal(mounted.authValue.user.id, 'B');
    assert.equal(mounted.counts.unmounted, 0);
    assert.equal(mounted.screen.result.id, pendingResult.id);
    assert.match(mounted.container.textContent, /Retry returned to this screen/);
    assert.match(mounted.container.textContent, /cleanup is incomplete/);
    assert.equal(find(mounted.container, 'data-testid', 'account-cleanup-overlay'), null);
    // A successful retry also returns to the same screen with its result intact.
    mounted.e.adapter.getItem = originalGet;
    await React.act(async () => { await mounted.screen.retry(); });
    assert.equal(mounted.authValue.accountCleanupError, '');
    assert.equal(mounted.counts.unmounted, 0);
    assert.equal(mounted.screen.guard, originalScreen.guard);
    await React.act(async () => { mounted.root.unmount(); });
    mounted = null;

    // A delayed deletion preflight failure publishes to the initiating instance.
    mounted = await mount('A');
    const prepare = deferred();
    const originalSet = mounted.e.adapter.setItem;
    mounted.e.adapter.setItem = (key, value) => key === '@beluga_account_cleanup_v1'
      ? prepare.promise : originalSet(key, value);
    let deletion;
    await React.act(async () => { deletion = mounted.screen.delete(); await tick(); });
    assert.ok(find(mounted.container, 'data-testid', 'account-cleanup-overlay'));
    assert.equal(mounted.counts.unmounted, 0);
    await React.act(async () => { prepare.reject(new Error('delayed preflight failure')); await deletion; });
    assert.equal(mounted.counts.unmounted, 0);
    assert.match(mounted.container.textContent, /account was not deleted/);
    assert.equal(mounted.e.counts.rpc, 0);
    await React.act(async () => { mounted.root.unmount(); });
    mounted = null;

    // Explicit RPC rejection, including a same-owner refresh while intent is
    // persisted, must preserve the review screen and its returned error.
    mounted = await mount('A');
    const rpc = deferred();
    mounted.sdk.ctx.supabase.rpc = () => rpc.promise;
    await React.act(async () => { deletion = mounted.screen.delete(); await tick(); });
    assert.ok(find(mounted.container, 'data-testid', 'account-cleanup-overlay'));
    await React.act(async () => {
      for (const listener of listenersFor(mounted)) listener('TOKEN_REFRESHED', mounted.sdk.ctx.sdkSession);
      await tick();
    });
    assert.equal(mounted.counts.unmounted, 0);
    await React.act(async () => { rpc.resolve({ error: { code: 'P0001', message: 'Deletion rejected by server' } }); await deletion; });
    assert.equal(mounted.counts.unmounted, 0);
    assert.match(mounted.container.textContent, /Deletion rejected by server/);
    assert.equal(mounted.authValue.user.id, 'A');
    console.log('Mounted cleanup overlay: PASS — real React screen lifetime, retained B result/duplicate guard, delayed retry recovery, deletion preflight/RPC errors, and same-owner token refresh.');
  } finally {
    if (mounted) await React.act(async () => { mounted.root.unmount(); });
    dom.restore();
  }
  function listenersFor(instance) { return instance.listeners; }
};
