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
  let signOutButton;
  const confirmations = [];
  const platform = { OS: 'web' };
  const host = tag => props => {
    const { children, testID, pointerEvents, disabled } = props;
    if (testID === 'settings-sign-out-button') signOutButton = props;
    return React.createElement(tag, {
      'data-testid': testID, 'data-pointer-events': pointerEvents,
      'data-disabled': String(!!disabled),
    }, children);
  };
  const native = { View: host('div'), Text: host('span'), TouchableOpacity: host('button'), ActivityIndicator: host('span'), Modal: host('section') };
  const jsx = require('react/jsx-runtime');

  async function mount(owner, cleanup = null, settingsMode = false) {
    const e = environment();
    const sdk = e.auth({ user: { id: owner } });
    if (cleanup) await e.cleanup.beginAccountCleanup(cleanup);
    const listeners = new Set();
    sdk.ctx.supabase.auth.onAuthStateChange = listener => {
      listeners.add(listener);
      return { data: { subscription: { unsubscribe() { listeners.delete(listener); } } } };
    };
    const originalSignOut = sdk.ctx.supabase.auth.signOut;
    sdk.ctx.supabase.auth.signOut = async () => {
      const result = await originalSignOut();
      if (!result.error) for (const listener of listeners) listener('SIGNED_OUT', null);
      return result;
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
    const counts = { mounted: 0, unmounted: 0, signOutRequests: 0 };
    const settings = settingsMode ? moduleFrom('src/components/SettingsScreen.tsx', {
      react: React, 'react/jsx-runtime': jsx,
      'react-native': { ...native, ScrollView: host('div'), StyleSheet: { create: styles => styles },
        Platform: platform, Alert: { alert: (...args) => confirmations.push(args) } },
      '@react-navigation/native': {
        useNavigation: () => ({ navigate() {} }),
        useFocusEffect: callback => React.useEffect(callback, [callback]),
      },
      'expo-constants': { __esModule: true, default: { expoConfig: { version: 'test' } } },
      '../contexts/AuthContext': { ...auth, useAuth: () => {
        const value = auth.useAuth();
        return { ...value, signOut: () => { counts.signOutRequests++; return value.signOut(); } };
      } },
      '../contexts/UnitsContext': { useUnits: () => ({ unitSystem: 'imperial', updateUnitSystem() {} }) },
      '../lib/supabase': { supabase: sdk.ctx.supabase },
      '../utils/notifications': { DEFAULT_PREFS: { enabled: false }, getPrefs: async () => ({ enabled: false }), formatTime: () => '' },
      '../utils/goalPrefs': { DEFAULT_WEEKLY_GOAL: 3, WEEKLY_GOAL_OPTIONS: [3], getWeeklyGoal: async () => 3, saveWeeklyGoal: async () => {} },
    }) : null;
    let screen, authValue;
    function SettingsNavigator() {
      authValue = auth.useAuth();
      React.useEffect(() => {
        counts.mounted++;
        return () => { counts.unmounted++; };
      }, []);
      return React.createElement(settings.SettingsScreen);
    }
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
      BottomTabNavigator: settingsMode ? SettingsNavigator : Screen,
      AuthStackNavigator: settingsMode ? () => React.createElement('div', { 'data-testid': 'auth-stack' }, 'Sign in') : Screen,
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
    await React.act(async () => { mounted.root.unmount(); });
    mounted = null;

    // Actual Settings + AuthProvider: pending cleanup is visible and retryable.
    mounted = await mount('B', { ownerUserId: 'A', kind: 'sign-out' }, true);
    await React.act(async () => { signOutButton.onPress(); await tick(); });
    assert.equal(find(mounted.container, 'data-testid', 'settings-sign-out-notice').textContent,
      'Finish local account cleanup before signing out.');
    assert.match(mounted.container.textContent, /Retry local cleanup/);
    assert.equal(mounted.e.counts.signOut, 0);
    assert.equal(mounted.authValue.user.id, 'B');
    await React.act(async () => { await mounted.authValue.retryAccountCleanup(); });
    assert.equal(mounted.authValue.user.id, 'B');
    assert.equal(mounted.e.counts.signOut, 0);
    await React.act(async () => { mounted.root.unmount(); });
    mounted = null;

    // Native confirmation is retained, cancellable, and cannot be opened twice.
    mounted = await mount('A', null, true);
    platform.OS = 'ios';
    await React.act(async () => { signOutButton.onPress(); signOutButton.onPress(); });
    assert.equal(confirmations.length, 1);
    confirmations[0][2].find(button => button.text === 'Cancel').onPress();
    assert.equal(mounted.e.counts.signOut, 0);
    platform.OS = 'web';

    // Durable-marker write failure is also reported without leaving Settings.
    mounted.e.faults.write = true;
    await React.act(async () => { signOutButton.onPress(); await tick(); });
    assert.equal(find(mounted.container, 'data-testid', 'settings-sign-out-notice').textContent,
      'Couldn’t prepare local cleanup. Sign-out was not performed. Please retry.');
    assert.equal(mounted.counts.unmounted, 0);
    assert.equal(mounted.e.counts.signOut, 0);
    mounted.e.faults.write = false;

    // An already-running account transition reports its blocker on Settings.
    const transitionDone = deferred();
    let transitionCalls = 0;
    mounted.sdk.ctx.supabase.auth.signInWithPassword = async () => {
      transitionCalls++;
      await transitionDone.promise;
      return { error: null };
    };
    const transition = mounted.authValue.signIn('synthetic@example.invalid', 'fake');
    await React.act(async () => { await tick(); signOutButton.onPress(); await tick(); });
    assert.equal(transitionCalls, 1);
    assert.equal(find(mounted.container, 'data-testid', 'settings-sign-out-notice').textContent,
      'Please wait for the current account operation to finish.');
    assert.equal(mounted.e.counts.signOut, 0);
    await React.act(async () => { transitionDone.resolve(); await transition; });

    // Rapid web taps enter signOut only once; busy props/text remain visible.
    const sdkFailure = deferred();
    let sdkCalls = 0;
    const successfulSdkSignOut = mounted.sdk.ctx.supabase.auth.signOut;
    mounted.sdk.ctx.supabase.auth.signOut = async () => { sdkCalls++; return sdkFailure.promise; };
    const before = find(mounted.container, 'data-testid', 'settings-sign-out-button');
    const press = signOutButton.onPress;
    const previousRequests = mounted.counts.signOutRequests;
    await React.act(async () => { press(); press(); await tick(); });
    assert.equal(mounted.counts.signOutRequests, previousRequests + 1);
    assert.equal(sdkCalls, 1);
    assert.equal(signOutButton.disabled, true);
    assert.equal(signOutButton.accessibilityState.busy, true);
    assert.match(before.textContent, /Signing out…/);
    assert.equal(mounted.counts.unmounted, 0);
    await React.act(async () => {
      sdkFailure.resolve({ error: { message: 'Mock SDK failure' } });
      await tick(); await tick();
    });
    assert.equal(mounted.counts.unmounted, 0);
    assert.equal(find(mounted.container, 'data-testid', 'settings-sign-out-button'), before);
    assert.equal(signOutButton.disabled, false);
    assert.equal(find(mounted.container, 'data-testid', 'settings-sign-out-notice').textContent,
      'Couldn’t finish signing out. Retry local account cleanup.');
    assert.match(mounted.container.textContent, /Retry local cleanup/);
    assert.equal(mounted.authValue.user.id, 'A');
    mounted.sdk.ctx.supabase.auth.signOut = successfulSdkSignOut;
    await React.act(async () => { await mounted.authValue.retryAccountCleanup(); });
    assert.ok(find(mounted.container, 'data-testid', 'auth-stack'));
    assert.equal(find(mounted.container, 'data-testid', 'settings-sign-out-button'), null);
    assert.equal(mounted.e.stored.has('@beluga_account_cleanup_v1'), false);
    await React.act(async () => { mounted.root.unmount(); });
    mounted = null;

    // Ordinary logout reaches the auth stack through the SDK state listener.
    mounted = await mount('A', null, true);
    await React.act(async () => { signOutButton.onPress(); await tick(); await tick(); });
    assert.equal(mounted.e.counts.signOut, 1);
    assert.ok(find(mounted.container, 'data-testid', 'auth-stack'));
    assert.equal(mounted.counts.unmounted, 1);
    console.log('Settings logout: PASS — successful auth routing, visible pending/transition/SDK errors, retry recovery, disabled/loading button, rapid-tap and native-confirmation guards, and preserved A/B isolation.');
    console.log('Mounted cleanup overlay: PASS — real React screen lifetime, retained B result/duplicate guard, delayed retry recovery, deletion preflight/RPC errors, and same-owner token refresh.');
  } finally {
    if (mounted) await React.act(async () => { mounted.root.unmount(); });
    dom.restore();
  }
  function listenersFor(instance) { return instance.listeners; }
};

if (require.main === module) {
  module.exports(require('./test-account-boundaries.js').helpers)
    .catch(error => { console.error(error); process.exitCode = 1; });
}
