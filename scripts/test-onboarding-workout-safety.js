const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { environment, extract, moduleFrom } = require('./test-account-boundaries.js').helpers;
const { makeWorkout } = require('./test-workout-completion.js').helpers;
const tick = () => new Promise(resolve => setImmediate(resolve));
const session = id => ({ user: { id, email: `${id}@example.invalid` } });
const KEY = '@beluga_active_workout_v1';
const lift = { name: 'Exact Case Lift', bodyPart: 'Legs', sets: 2, target: { kind: 'reps', value: 10 }, weight: '' };
const draft = owner => ({
  ownerUserId: owner, exercises: [lift], exerciseNames: [lift.name],
  bodyParts: ['Legs'], completedSets: { 0: [1] }, startTime: Date.now(),
});
const compile = code => ts.transpileModule(code, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function checklist(e, selected = lift) {
  const w = makeWorkout('reps', false, { exercises: [selected], completedSets: {} });
  const c = w.ctx;
  c.user = session('A').user;
  c.isRestoringSession = false;
  c.route = { params: { exercises: [selected], bodyParts: [selected.bodyPart] } };
  c.bodyParts = c.route.params.bodyParts;
  c.initialTargetedExercises = c.exercises;
  c.draftStateRef.current = { exercises: c.exercises, completedSets: c.completedSets, bodyParts: c.bodyParts };
  c.setBodyParts = value => { c.bodyParts = value; };
  c.loadWorkoutSession = e.storage.loadWorkoutSession;
  c.clearWorkoutSession = e.storage.clearWorkoutSession;
  c.saveWorkoutSession = e.storage.saveWorkoutSession;
  c.background = null;
  c.AppState = { addEventListener(_, fn) { c.background = fn; return { remove() {} }; } };
  const text = fs.readFileSync('src/components/WorkoutChecklistScreen.tsx', 'utf8');
  const ast = ts.createSourceFile('check.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const effects = {};
  function visit(n) {
    if (ts.isCallExpression(n) && n.expression.getText(ast) === 'useEffect') {
      const code = n.arguments[0].getText(ast);
      if (code.includes('saveWorkoutSession({')) effects[code.includes('AppStateStatus') ? 'backgroundEffect' : 'autoEffect'] = code;
    }
    if (ts.isCallExpression(n) && n.expression.getText(ast) === 'usePreventRemove') {
      effects.guard = `() => ${n.getText(ast)}`;
    }
    ts.forEachChild(n, visit);
  }
  visit(ast);
  for (const [name, code] of Object.entries(effects)) vm.runInNewContext(compile(`exports.${name} = ${code};`), c);
  c.usePreventRemove = blocked => { c.removalBlocked = blocked; };
  c.exports.backgroundEffect();
  return { ...w, c };
}

async function testDraftDecisions() {
  const e = environment(); e.storage.setWorkoutSessionOwner('A');
  await e.storage.saveWorkoutSession(draft('A'));
  let w = checklist(e);
  await w.checkForSavedSession();
  assert.equal(w.c.sessionRestoreBlockedRef.current, true);
  const retained = e.stored.get(KEY);
  w.c.exports.autoEffect(); w.c.background('background');
  await tick();
  w.c.exports.autoEffect(); w.c.background('inactive');
  await tick();
  assert.equal(e.stored.get(KEY), retained, 'unanswered prompt and delayed effects must not overwrite checked sets');
  // A write queued earlier must recheck the decision gate at execution.
  await e.storage.saveWorkoutSession({ ...draft('A'), completedSets: {} }, () => !w.c.sessionRestoreBlockedRef.current);
  assert.equal(e.stored.get(KEY), retained);
  w.events.alerts[0][2].find(b => b.text === 'Resume').onPress();
  assert.equal(w.c.completedSets['0'][0], 1);
  assert.equal(w.c.sessionRestoreBlockedRef.current, false);
  w.c.background('background'); await tick();
  assert.equal((await e.storage.loadWorkoutSession('A')).completedSets['0'][0], 1);

  w = checklist(e);
  await w.checkForSavedSession();
  let clears = 0;
  const clear = w.c.clearWorkoutSession;
  w.c.clearWorkoutSession = async (...args) => { clears++; return clear(...args); };
  const fresh = w.events.alerts[0][2].find(b => b.text === 'Start Fresh');
  fresh.onPress(); fresh.onPress();
  w.c.exports.guard(); assert.equal(w.c.removalBlocked, true, 'discard cleanup prevents removal');
  await tick();
  assert.equal(clears, 1);
  assert.equal(w.c.sessionRestoreBlockedRef.current, false);
  assert.equal(Object.keys(w.c.completedSets).length, 0);
  w.c.exports.autoEffect(); await tick();
  assert.equal(Object.keys((await e.storage.loadWorkoutSession('A')).completedSets).length, 0);

  await e.storage.saveWorkoutSession(draft('A'));
  w = checklist(e, { ...lift, name: 'Different Selected Lift', bodyPart: 'Arms' });
  await w.checkForSavedSession();
  const buttons = w.events.alerts[0][2];
  assert.equal(buttons.length, 3);
  const beforeCancel = e.stored.get(KEY);
  buttons.find(b => b.text === 'Cancel').onPress();
  w.c.background('background'); await tick();
  assert.equal(e.stored.get(KEY), beforeCancel);
  // Returning focus after Cancel must not implicitly accept/replace the draft.
  await w.checkForSavedSession(false);
  assert.equal(w.c.sessionRestoreBlockedRef.current, true);
  w.events.alerts[1][2].find(b => b.text === 'Resume').onPress();
  assert.equal(w.c.exercises[0].name, lift.name);
  assert.equal(w.c.bodyParts[0], 'Legs');

  w = checklist(e, { ...lift, bodyPart: 'Arms' });
  await w.checkForSavedSession();
  e.faults.remove = true;
  w.events.alerts[0][2].find(b => b.text === 'Discard and start selected').onPress();
  await tick();
  assert.equal(w.c.sessionRestoreBlockedRef.current, true);
  assert.match(w.c.sessionStorageError, /still protected/);
  assert.equal(e.stored.get(KEY), beforeCancel);
  e.faults.remove = false;
  const sameParts = checklist(e, { ...lift, name: 'Different Selected Lift' });
  await sameParts.checkForSavedSession();
  assert.equal(sameParts.events.alerts[0][2].length, 3, 'same count/body parts must not conceal a different selection');

  // A result that arrived after the ordinary-draft prompt cannot be discarded.
  await e.storage.saveWorkoutSession({ ...draft('A'), saveOutcome: { id: 'saved-A', message: 'Partial', partial: true } });
  w.events.alerts[0][2].find(b => b.text === 'Discard and start selected').onPress();
  await tick();
  assert.equal((await e.storage.loadWorkoutSession('A')).saveOutcome.id, 'saved-A');
  for (const owner of ['B', undefined]) {
    const payload = { ...draft('A'), ownerUserId: owner, savedAt: Date.now() };
    e.stored.set(KEY, JSON.stringify(payload));
    const snapshot = e.stored.get(KEY);
    assert.equal(await e.storage.loadWorkoutSession('A'), null);
    await assert.rejects(e.storage.loadWorkoutSession('A', true), /Protected workout/);
    await assert.rejects(e.storage.clearWorkoutSession('A'), /does not belong/);
    await assert.rejects(e.storage.saveWorkoutSession(draft('A')), /protected workout/);
    assert.equal(e.stored.get(KEY), snapshot);
  }
  console.log('PASS: unresolved/delayed/background resume protection, Resume, explicit guarded Start Fresh, mismatch three-way choice/Cancel, failed discard, pending/foreign/ownerless protection.');
}

async function testSaveRemoval() {
  const e = environment(); e.storage.setWorkoutSessionOwner('A');
  const w = checklist(e);
  w.c.completedSets = { 0: [1, 2] }; w.c.completedCount = 2; w.c.totalCount = 2;
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const query = w.c.safeQuery;
  w.c.safeQuery = async chain => { await pending; return query(chain); };
  w.handleFinishWorkout(); w.handleFinishWorkout();
  w.c.exports.guard(); assert.equal(w.c.removalBlocked, true);
  const attemptRemoval = () => { if (!w.c.removalBlocked) w.c.workoutMountedRef.current = false; };
  attemptRemoval(); assert.equal(w.c.workoutMountedRef.current, true);
  release(); await tick();
  assert.equal(w.events.sessions, 1);
  w.c.exports.guard(); assert.equal(w.c.removalBlocked, true, 'unacknowledged result keeps removal blocked');
  await w.handleSavedWorkoutClose(); await w.handleSavedWorkoutClose();
  assert.equal(w.events.navigations.length, 1);
  const failed = makeWorkout('reps', true);
  await failed.doSaveWorkout();
  assert.equal(failed.events.navigations.length, 0);
  assert.equal(failed.ctx.isSaving, false);
  assert.equal(failed.ctx.saveInProgressRef.current, false);
  assert.equal(failed.ctx.workoutFinishedRef.current, false);
  assert.ok(failed.events.errors.length);
  await failed.doSaveWorkout();
  assert.equal(failed.events.sessions, 1, 'failed save remains retryable');
  console.log('PASS: source-hook removal gate during save/cleanup/result, duplicate Finish, retryable failure, single success navigation. Native gestures still require device testing.');
}

async function testAuthPersistence() {
  for (const thrown of [false, true]) {
    const e = environment(), a = e.auth(session('A'));
    a.ctx.needsOnboarding = true;
    a.ctx.supabase.from = () => ({ async upsert() {
      if (thrown) throw Error('private mock provider detail');
      return { error: { message: 'private mock provider detail' } };
    } });
    await assert.rejects(a.completeOnboarding(), /retry/);
    assert.equal(a.ctx.needsOnboarding, true);
    assert.equal(e.stored.has('@beluga/onboarding_A'), false);
    assert.equal(a.ctx.onboardingBusy, false);
  }
  let e = environment(), a = e.auth(session('A'));
  let release, writes = 0;
  const pending = new Promise(resolve => { release = resolve; });
  const from = a.ctx.supabase.from;
  a.ctx.supabase.from = name => ({ ...from(name), async upsert() { writes++; return pending; } });
  const saving = a.completeOnboarding();
  assert.equal(await a.completeOnboarding(), false);
  await tick(); assert.equal(writes, 1);
  a.ctx.sdkSession = session('B'); await a.applyAuthSession(session('B'));
  release({ error: null }); await assert.rejects(saving, /retry/);
  assert.equal(e.stored.has('@beluga/onboarding_A'), false);
  assert.equal(a.ctx.user.id, 'B');

  e = environment(); a = e.auth(session('A'));
  await e.cleanup.beginAccountCleanup({ ownerUserId: 'A', kind: 'sign-out' });
  await assert.rejects(a.completeOnboarding(), /retry/);
  assert.equal(a.profileWrites.length, 0);
  for (const thrown of [false, true]) {
    e = environment(); a = e.auth();
    a.ctx.supabase.from = () => ({ select() { return this; }, eq() { return this; }, async maybeSingle() {
      if (thrown) throw Error('mock read failure');
      return { data: null, error: { message: 'mock read failure' } };
    } });
    await a.applyAuthSession(session('A'));
    assert.equal(a.ctx.needsOnboarding, true); assert.equal(a.ctx.loading, false);
    assert.match(a.ctx.startupError, /retry/);
  }
  e = environment(); a = e.auth(session('A'));
  assert.equal(await a.completeOnboarding(), true);
  assert.equal(e.stored.get('@beluga/onboarding_A'), 'server-confirmed:true');
  a.ctx.supabase.from = () => ({ select() { return this; }, eq() { return this; }, maybeSingle: async () => { throw Error('offline'); } });
  assert.equal(await a.resolveOnboardingCompleted('A'), true);
  e.stored.set('@beluga/onboarding_A', 'true');
  await assert.rejects(a.resolveOnboardingCompleted('A'), /retry/);
  a.ctx.supabase.auth.signUp = async () => ({ data: { session: null, user: session('A').user }, error: null });
  assert.equal((await a.signUp('A@example.invalid', 'mock-password')).data.session, null);
  console.log('PASS: returned/thrown onboarding write/read errors, duplicate completion, owner change, pending cleanup, server-confirmed-only cache, signup result preservation.');
}

async function testMountedFeedback() {
  const dom = require('./helpers/mock-dom'); dom.install();
  const { createRoot } = require('react-dom/client');
  const controls = new Map(), inputs = new Map();
  const text = node => Array.isArray(node) ? node.map(text).join('') :
    typeof node === 'string' ? node : node?.props ? text(node.props.children) : '';
  const host = tag => props => {
    if (props.onPress) controls.set(text(props.children), props);
    if (props.onChangeText) inputs.set(props.placeholder, props);
    return React.createElement(tag, { 'data-testid': props.testID }, props.children);
  };
  const native = { View: host('div'), Text: host('span'), TouchableOpacity: host('button'),
    ActivityIndicator: host('span'), TextInput: host('input'), KeyboardAvoidingView: host('div'),
    ScrollView: host('div'), SafeAreaView: host('div'), FlatList: () => null,
    StyleSheet: { create: x => x }, Platform: { OS: 'web' }, StatusBar: () => null,
    Dimensions: { get: () => ({ width: 400 }) }, Linking: { openURL() {} } };
  const jsx = require('react/jsx-runtime');
  const node = document.createElement('div'); document.body.appendChild(node);
  const root = createRoot(node);
  try {
    let reject, calls = 0;
    const pending = new Promise((_, fail) => { reject = fail; });
    const onboarding = moduleFrom('src/components/OnboardingScreen.tsx', {
      react: React, 'react/jsx-runtime': jsx, 'react-native': native,
    });
    await React.act(async () => root.render(React.createElement(onboarding.OnboardingScreen, {
      onComplete: async () => { calls++; await pending; },
    })));
    await React.act(async () => { controls.get('Skip').onPress(); controls.get('Skip').onPress(); });
    assert.equal(calls, 1); assert.equal(controls.get('Skip').disabled, true);
    await React.act(async () => reject(Error('private mock error')));
    assert.ok(controls.has('Retry')); assert.equal(controls.get('Skip').disabled, false);
    const registration = moduleFrom('src/components/RegisterScreen.tsx', {
      react: React, 'react/jsx-runtime': jsx, 'react-native': native,
      '../contexts/AuthContext': { useAuth: () => ({ signUp: async () => ({ data: { session: null }, error: null }) }) },
    });
    await React.act(async () => root.render(React.createElement(registration.RegisterScreen, { navigation: { navigate() {} } })));
    await React.act(async () => {
      const fields = [...inputs.values()]; fields[0].onChangeText('A@example.invalid');
      fields[1].onChangeText('mock-password'); fields[2].onChangeText('mock-password');
    });
    await React.act(async () => { controls.get('Create Account').onPress(); });
    assert.ok(controls.has('Back to login'), 'confirmation branch visible');

    const e = environment(), a = e.auth(session('A'));
    let units;
    let unitsOwner = 'A';
    const module = moduleFrom('src/contexts/UnitsContext.tsx', {
      react: React, 'react/jsx-runtime': jsx,
      './AuthContext': { useAuth: () => ({ user: session(unitsOwner).user }) },
      '../lib/supabase': { supabase: a.ctx.supabase },
      '../utils/accountTransition': { withAccountTransitionLock: a.ctx.withAccountTransitionLock },
      '../utils/accountCleanup': e.cleanup,
    });
    function Consumer() { units = module.useUnits(); return null; }
    await React.act(async () => root.render(React.createElement(module.UnitsProvider, null, React.createElement(Consumer))));
    const from = a.ctx.supabase.from;
    a.ctx.supabase.from = name => ({ ...from(name), upsert: async () => ({ error: { message: 'mock failure' } }) });
    await React.act(async () => units.updateUnitSystem('metric'));
    assert.equal(units.unitSystem, 'imperial'); assert.match(units.unitsError, /retry/); assert.equal(units.unitsBusy, false);
    a.ctx.supabase.from = from;
    await React.act(async () => units.updateUnitSystem('metric'));
    assert.equal(units.unitSystem, 'metric'); assert.equal(units.unitsError, '');
    let releaseUnits, pendingUnits;
    const delayedUnits = new Promise(resolve => { releaseUnits = resolve; });
    a.ctx.supabase.from = name => ({ ...from(name), upsert: async row => {
      assert.equal(row.id, 'A');
      return delayedUnits;
    } });
    await React.act(async () => { pendingUnits = units.updateUnitSystem('imperial'); await tick(); });
    unitsOwner = 'B'; a.ctx.sdkSession = session('B');
    a.profileReads.set('B', { promise: Promise.resolve({ data: { unit_system: 'metric' }, error: null }) });
    await React.act(async () => root.render(React.createElement(module.UnitsProvider, null, React.createElement(Consumer))));
    assert.equal(units.unitSystem, 'metric');
    await React.act(async () => { releaseUnits({ error: null }); await pendingUnits; });
    assert.equal(units.unitSystem, 'metric'); assert.equal(units.unitsError, ''); assert.equal(units.unitsBusy, false);
    console.log('PASS: mounted onboarding error/Retry/duplicate controls, signup confirmation branch, units failure/retry and stale A-write/B-response isolation.');
  } finally {
    await React.act(async () => root.unmount()); dom.restore();
  }
}

async function testStartupTimeout() {
  const e = environment(), a = e.auth();
  const timers = [];
  a.ctx.setTimeout = fn => { timers.push(fn); return fn; };
  a.ctx.clearTimeout = () => {};
  const getSession = a.ctx.supabase.auth.getSession;
  a.ctx.supabase.auth.getSession = () => new Promise(() => {});
  const restoring = a.restoreAuthSession();
  await tick(); timers.at(-1)(); await restoring;
  assert.match(a.ctx.startupError, /retry/); assert.equal(a.ctx.loading, false);
  const p = e.auth(session('B'));
  const profileTimers = [];
  p.ctx.setTimeout = fn => { profileTimers.push(fn); return fn; };
  p.ctx.clearTimeout = () => {};
  let release;
  const read = new Promise(resolve => { release = resolve; });
  p.ctx.supabase.from = () => ({ select() { return this; }, eq() { return this; }, maybeSingle: () => read });
  const resolving = p.applyAuthSession(session('B'));
  await tick(); profileTimers.at(-1)(); await resolving;
  assert.match(p.ctx.startupError, /retry/);
  assert.equal(p.ctx.needsOnboarding, true);
  release({ data: { onboarding_completed: true }, error: null }); await tick();
  assert.equal(p.ctx.needsOnboarding, true);
  assert.equal(e.stored.has('@beluga/onboarding_B'), false, 'late timed-out profile read cannot update cache');
  const dom = require('./helpers/mock-dom'); dom.install();
  const { createRoot } = require('react-dom/client');
  const node = document.createElement('div'); document.body.appendChild(node);
  const root = createRoot(node); let visibleError = '', retry;
  const host = props => React.createElement('div', null, props.children);
  const c = { exports: {}, ...React, useAuth: () => ({ ...a.ctx, recoveryLinkState: { status: 'idle' }, retryStartup: a.retryStartup }),
    View: host, Text: props => { if (typeof props.children === 'string' && props.children.includes('retry')) visibleError = props.children; return null; },
    TouchableOpacity: props => { retry = props.onPress; return null; }, ActivityIndicator: () => null,
    useNavigationContainerRef: () => ({ navigate() {} }), setupNotificationHandler() {}, scheduleInactivityReminder() {},
    NavigationContainer: host, BottomTabNavigator: () => null,
    LaunchScreen: () => null, setTimeout: () => 1, clearTimeout() {},
    require: () => require('react/jsx-runtime') };
  vm.runInNewContext(extract('App.tsx', ['AppContent']), c);
  try {
    await React.act(async () => root.render(React.createElement(c.exports.handlers.AppContent)));
    assert.match(visibleError, /retry/); assert.equal(typeof retry, 'function');
    a.ctx.supabase.auth.getSession = getSession;
    await React.act(async () => retry());
    assert.equal(a.ctx.startupError, '');
    assert.equal(a.ctx.loading, false);
    a.ctx.loading = true; a.ctx.startupError = '';
    await React.act(async () => root.render(React.createElement(c.exports.handlers.AppContent)));
  } finally { await React.act(async () => root.unmount()); dom.restore(); }
  console.log('PASS: stalled startup reaches a visible error/Retry state instead of indefinite blank content.');
}

(async () => {
  await testDraftDecisions();
  await testSaveRemoval();
  await testAuthPersistence();
  await testMountedFeedback();
  await testStartupTimeout();
  console.log('Onboarding/workout safety: PASS — all SDK/storage operations mocked; no live requests.');
})().catch(error => { console.error(error); process.exitCode = 1; });
