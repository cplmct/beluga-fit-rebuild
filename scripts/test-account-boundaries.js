const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const compile = text => ts.transpileModule(text, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
function moduleFrom(file, dependencies) {
  const exports = {};
  vm.runInNewContext(compile(read(file)), { exports, Date, require: name => {
    assert.ok(name in dependencies, `Unexpected dependency ${name}`);
    return dependencies[name];
  } });
  return exports;
}
function extract(file, names) {
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && names.includes(node.name.getText(ast))) {
      declarations.push(`const ${node.name.getText(ast)} = ${node.initializer.getText(ast)};`);
    } else if (ts.isFunctionDeclaration(node) && names.includes(node.name?.text)) {
      declarations.push(node.getText(ast).replace(/^export /, ''));
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.equal(declarations.length, names.length);
  return compile(declarations.join('\n') + `\nexports.handlers = {${names.join(',')}};`);
}
const tick = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
const sessionFor = id => ({ user: { id, email: `${id}@example.invalid` } });
const draftFor = id => ({
  ownerUserId: id, exerciseNames: ['Exact Case Lift'], completedSets: { 0: [1] },
  startTime: Date.now(), savedAt: Date.now(),
  exercises: [{ name: 'Exact Case Lift', bodyPart: 'Legs', sets: 1, target: { kind: 'steps', value: 20 }, weight: '' }],
  bodyParts: ['Legs'],
});
const DRAFT_KEY = '@beluga_active_workout_v1';
const MARKER_KEY = '@beluga_account_cleanup_v1';
const authNames = [
  'onboardingKey', 'readOnboardingCache', 'writeOnboardingCache', 'resolveOnboardingCompleted',
  'invalidateLocalAuth', 'invalidateAccountAuth', 'applyAuthSession', 'restoreAuthSession', 'finishLocalAccountCleanup',
  'retryAccountCleanup', 'signOut', 'deleteAccount', 'completeOnboarding', 'triggerOnboarding',
];
const authCode = extract('src/contexts/AuthContext.tsx', authNames);

function environment() {
  const stored = new Map();
  const faults = { remove: false, write: false, read: false, caches: false, signOut: false, rpc: false, rpcThrow: false };
  const counts = { signOut: 0, rpc: 0 };
  const adapter = {
    async getItem(key) { if (faults.read) throw new Error('read failure'); return stored.get(key) ?? null; },
    async setItem(key, value) { if (faults.write) throw new Error('write failure'); stored.set(key, value); },
    async removeItem(key) { if (faults.remove) throw new Error('remove failure'); stored.delete(key); },
    async multiRemove(keys) {
      if (faults.caches) throw new Error('cache failure');
      for (const key of keys) stored.delete(key);
    },
  };
  const cleanup = moduleFrom('src/utils/accountCleanup.ts', {
    '@react-native-async-storage/async-storage': { __esModule: true, default: adapter },
  });
  const targets = moduleFrom('src/utils/workoutTarget.ts', {});
  const storage = moduleFrom('src/utils/workoutSession.ts', {
    '@react-native-async-storage/async-storage': { __esModule: true, default: adapter },
    './workoutTarget': targets, './accountCleanup': cleanup,
  });
  function auth(sdkSession = sessionFor('A')) {
    const profileReads = new Map();
    const profileWrites = [];
    const ctx = {
      exports: {}, __DEV__: false, console, setTimeout,
      AsyncStorage: adapter, ...cleanup,
      clearWorkoutSessionForAccount: storage.clearWorkoutSessionForAccount,
      setWorkoutSessionOwner: storage.setWorkoutSessionOwner,
      user: sdkSession?.user ?? null, session: sdkSession, sdkSession,
      loading: false, needsOnboarding: false, isPasswordRecovery: false,
      accountCleanupError: '', accountCleanupBusy: false,
      authReadyRef: { current: true }, authMountedRef: { current: true },
      cleanupInProgressRef: { current: false }, pendingCleanupRef: { current: null },
      currentUserIdRef: { current: sdkSession?.user.id ?? null },
      resolvedUserRef: { current: null }, authEventVersion: { current: 0 },
    };
    for (const name of ['User', 'Session', 'Loading', 'NeedsOnboarding', 'IsPasswordRecovery', 'AccountCleanupError', 'AccountCleanupBusy']) {
      ctx[`set${name}`] = value => { ctx[name[0].toLowerCase() + name.slice(1)] = value; };
    }
    ctx.supabase = {
      auth: {
        async getSession() { return { data: { session: ctx.sdkSession }, error: null }; },
        async signOut() {
          counts.signOut++;
          if (faults.signOut) return { error: { message: 'SDK failure' } };
          ctx.sdkSession = null;
          void ctx.exports.handlers.applyAuthSession(null);
          return { error: null };
        },
      },
      async rpc(name) {
        assert.equal(name, 'delete_user');
        counts.rpc++;
        if (faults.rpcThrow) throw new Error('Network interruption');
        return { error: faults.rpc ? { message: 'RPC rejected', code: 'P0001' } : null };
      },
      from(name) {
        assert.equal(name, 'profiles');
        return {
          select() { return this; },
          eq(_, id) { this.id = id; return this; },
          maybeSingle() { return profileReads.get(this.id)?.promise ?? Promise.resolve({ data: { onboarding_completed: true }, error: null }); },
          async upsert(row) { profileWrites.push(row); return { error: null }; },
        };
      },
    };
    vm.runInNewContext(authCode, ctx);
    storage.setWorkoutSessionOwner(sdkSession?.user.id ?? null);
    return { ctx, profileReads, profileWrites, ...ctx.exports.handlers };
  }
  return { stored, faults, counts, adapter, cleanup, storage, auth };
}

async function testStorageOwnership() {
  const e = environment();
  const a = draftFor('A');
  e.storage.setWorkoutSessionOwner('A');
  await e.storage.saveWorkoutSession(a);
  assert.equal(JSON.parse(e.stored.get(DRAFT_KEY)).ownerUserId, 'A');
  assert.equal((await e.storage.loadWorkoutSession('A')).exercises[0].name, 'Exact Case Lift');
  const pending = { ...a, saveOutcome: { id: 'saved-A', partial: true, message: 'Partial result' } };
  await e.storage.saveWorkoutSession(pending);
  assert.equal((await e.storage.loadWorkoutSession('A')).saveOutcome.id, 'saved-A');

  e.storage.setWorkoutSessionOwner('B');
  e.faults.remove = true;
  await assert.rejects(e.storage.loadWorkoutSession('B'), /remove failure/);
  assert.equal(JSON.parse(e.stored.get(DRAFT_KEY)).ownerUserId, 'A');
  await assert.rejects(e.storage.saveWorkoutSession(a), /account changed/);
  await assert.rejects(e.storage.clearWorkoutSession('A'), /account changed/);
  e.faults.remove = false;
  assert.equal(await e.storage.loadWorkoutSession('B'), null);
  assert.equal(e.stored.has(DRAFT_KEY), false);

  const { ownerUserId, ...legacy } = pending;
  e.stored.set(DRAFT_KEY, JSON.stringify(legacy));
  e.faults.remove = true;
  await assert.rejects(e.storage.loadWorkoutSession('B'), /remove failure/);
  assert.equal(e.stored.get(DRAFT_KEY), JSON.stringify(legacy));
  e.faults.remove = false;
  assert.equal(await e.storage.loadWorkoutSession('B'), null);
  assert.equal(e.stored.has(DRAFT_KEY), false); // Never auto-assign ownerless pending results.
  assert.equal(await e.storage.loadWorkoutSession(null), null);

  // An in-flight A read must not return A's data after the account changes.
  e.storage.setWorkoutSessionOwner('A');
  e.stored.set(DRAFT_KEY, JSON.stringify(a));
  const originalGet = e.adapter.getItem;
  const delayed = deferred();
  e.adapter.getItem = key => key === DRAFT_KEY ? delayed.promise : originalGet(key);
  const readA = e.storage.loadWorkoutSession('A');
  await tick();
  e.storage.setWorkoutSessionOwner('B');
  delayed.resolve(JSON.stringify(a));
  await assert.rejects(readA, /account changed/);
  e.adapter.getItem = originalGet;
  // Queued stale A writes are rejected too, including after a switch back to A.
  e.storage.setWorkoutSessionOwner('A');
  const staleWrite = e.storage.saveWorkoutSession(a);
  e.storage.setWorkoutSessionOwner('B');
  e.storage.setWorkoutSessionOwner('A');
  await assert.rejects(staleWrite, /account changed/);
  e.storage.setWorkoutSessionOwner('B');
  await e.storage.saveWorkoutSession(draftFor('B'));
  await e.storage.clearWorkoutSessionForAccount('A');
  assert.equal((await e.storage.loadWorkoutSession('B')).ownerUserId, 'B');
}

async function testAuthCleanup() {
  let e = environment();
  let a = e.auth();
  await e.storage.saveWorkoutSession(draftFor('A'));
  await a.signOut();
  assert.equal(e.counts.signOut, 1);
  assert.equal(a.ctx.user, null);
  assert.equal(e.stored.has(DRAFT_KEY), false);
  assert.equal(e.stored.has(MARKER_KEY), false);
  assert.equal(a.ctx.accountCleanupError, '');

  e = environment();
  a = e.auth();
  await e.storage.saveWorkoutSession(draftFor('A'));
  e.faults.remove = true;
  await a.signOut();
  assert.equal(a.ctx.user, null);
  assert.match(a.ctx.accountCleanupError, /data may remain blocked/);
  assert.ok(e.stored.has(MARKER_KEY));
  // Simulated app restart with a stale SDK session: durable marker wins.
  const restarted = e.auth(sessionFor('A'));
  restarted.ctx.authReadyRef.current = false;
  await restarted.restoreAuthSession();
  assert.equal(restarted.ctx.user, null);
  e.storage.setWorkoutSessionOwner('A');
  await assert.rejects(e.storage.loadWorkoutSession('A'), /cleanup must finish/);
  await restarted.applyAuthSession(sessionFor('B'));
  await assert.rejects(e.storage.loadWorkoutSession('B'), /remove failure/);
  e.faults.remove = false;
  restarted.ctx.sdkSession = sessionFor('B');
  const signOuts = e.counts.signOut;
  await restarted.retryAccountCleanup();
  assert.equal(restarted.ctx.user.id, 'B');
  assert.equal(e.counts.signOut, signOuts); // A's retry must not sign out B.
  assert.equal(await e.storage.loadWorkoutSession('B'), null);

  e = environment();
  a = e.auth();
  await e.storage.saveWorkoutSession(draftFor('A'));
  for (const key of ['@beluga/onboarding_A', 'beluga_notif_prefs', 'beluga_notif_id']) e.stored.set(key, 'old');
  assert.equal((await a.deleteAccount()).error, null);
  assert.equal(e.counts.rpc, 1);
  assert.equal(a.ctx.user, null);
  assert.equal(e.stored.size, 0);

  e = environment();
  a = e.auth();
  await e.storage.saveWorkoutSession(draftFor('A'));
  e.faults.remove = true;
  await a.deleteAccount();
  assert.equal(a.ctx.user, null);
  assert.match(a.ctx.accountCleanupError, /account was deleted/);
  const blockedDeleted = e.auth();
  await blockedDeleted.restoreAuthSession();
  assert.equal(blockedDeleted.ctx.user, null);
  await blockedDeleted.applyAuthSession(sessionFor('B'));
  await assert.rejects(e.storage.loadWorkoutSession('B'), /remove failure/);
  e.faults.remove = false;
  blockedDeleted.ctx.sdkSession = sessionFor('B');
  await blockedDeleted.retryAccountCleanup();
  assert.equal(blockedDeleted.ctx.user.id, 'B');
  assert.equal(e.stored.has(DRAFT_KEY), false);

  e = environment();
  a = e.auth();
  await e.storage.saveWorkoutSession(draftFor('A'));
  e.stored.set('@beluga/onboarding_A', 'true');
  e.faults.caches = true;
  await a.deleteAccount();
  assert.equal(a.ctx.user, null);
  assert.match(a.ctx.accountCleanupError, /account was deleted.*old workout is blocked/);
  assert.ok(e.stored.has(MARKER_KEY));
  e.faults.caches = false;
  await a.retryAccountCleanup();
  assert.equal(e.stored.has('@beluga/onboarding_A'), false);
  assert.equal(e.stored.has(MARKER_KEY), false);

  // A failed SDK sign-out after deletion cannot revive local auth on restart.
  e = environment();
  a = e.auth();
  await e.storage.saveWorkoutSession(draftFor('A'));
  e.faults.signOut = true;
  await a.deleteAccount();
  assert.equal(a.ctx.user, null);
  const deletedRestart = e.auth();
  await deletedRestart.restoreAuthSession();
  assert.equal(deletedRestart.ctx.user, null);
  assert.ok(e.stored.has(MARKER_KEY));
  e.faults.signOut = false;
  await deletedRestart.retryAccountCleanup();
  assert.equal(e.stored.has(DRAFT_KEY), false);

  // Do not begin a destructive operation unless durable suppression is writable.
  e = environment();
  a = e.auth();
  e.faults.write = true;
  await a.signOut();
  assert.equal(e.counts.signOut, 0);
  assert.equal(a.ctx.user.id, 'A');
  assert.match(a.ctx.accountCleanupError, /Sign-out was not performed/);
  assert.match((await a.deleteAccount()).error.message, /account was not deleted/);
  assert.equal(e.counts.rpc, 0);

  // A definite RPC error keeps the existing account/draft, rather than claiming deletion.
  e = environment();
  a = e.auth();
  await e.storage.saveWorkoutSession(draftFor('A'));
  e.faults.rpc = true;
  assert.match((await a.deleteAccount()).error.message, /RPC rejected/);
  assert.equal(a.ctx.user.id, 'A');
  assert.equal(e.stored.has(MARKER_KEY), false);
  assert.equal((await e.storage.loadWorkoutSession('A')).ownerUserId, 'A');

  e = environment();
  a = e.auth();
  await e.storage.saveWorkoutSession(draftFor('A'));
  e.faults.rpcThrow = true;
  assert.match((await a.deleteAccount()).error.message, /could not be confirmed/);
  assert.equal(a.ctx.user, null);
  assert.ok(e.stored.has(MARKER_KEY));
  e.faults.rpcThrow = false;
  await a.retryAccountCleanup();
  assert.equal(e.counts.rpc, 1); // Retry is local cleanup, never a second delete RPC.
}

async function testOnboardingRaces() {
  const e = environment();
  const a = e.auth();
  const oldRead = deferred();
  a.profileReads.set('A', oldRead);
  const applyingA = a.applyAuthSession(sessionFor('A'));
  await tick();
  await a.applyAuthSession(sessionFor('B'));
  oldRead.resolve({ data: { onboarding_completed: false }, error: null });
  await applyingA;
  assert.equal(a.ctx.user.id, 'B');
  assert.equal(a.ctx.needsOnboarding, false);
  assert.equal(e.stored.has('@beluga/onboarding_A'), false);

  const readB = deferred();
  a.ctx.resolvedUserRef.current = null;
  a.profileReads.set('B', readB);
  const pendingB = a.applyAuthSession(sessionFor('B'));
  await tick();
  await a.applyAuthSession(null);
  readB.resolve({ data: { onboarding_completed: false }, error: null });
  await pendingB;
  assert.equal(a.ctx.user, null);
  assert.equal(a.ctx.needsOnboarding, false);

  const refreshed = e.auth();
  const refreshRead = deferred();
  refreshed.profileReads.set('A', refreshRead);
  const first = refreshed.applyAuthSession(sessionFor('A'));
  await tick();
  await refreshed.applyAuthSession(sessionFor('A')); // TOKEN_REFRESHED during initial resolution
  refreshRead.resolve({ data: { onboarding_completed: true }, error: null });
  await first;
  assert.equal(refreshed.ctx.loading, false);
}

async function testUnitsRaces() {
  const source = read('src/contexts/UnitsContext.tsx');
  const ast = ts.createSourceFile('units.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let effect;
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'useEffect') effect = node.arguments[0].getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(effect);
  const reads = new Map([['A', deferred()], ['B', deferred()]]);
  const ctx = {
    exports: {}, user: { id: 'A' }, currentUserIdRef: { current: 'A' },
    requestVersionRef: { current: 0 }, units: null,
    setUnits(value) { ctx.units = value; },
    supabase: { from() { return {
      select() { return this; }, eq(_, id) { this.id = id; return this; },
      maybeSingle() { return reads.get(this.id).promise; },
    }; } },
  };
  vm.runInNewContext(compile(`exports.effect = ${effect};`), ctx);
  const cleanupA = ctx.exports.effect();
  cleanupA();
  ctx.user = { id: 'B' };
  ctx.currentUserIdRef.current = 'B';
  const cleanupB = ctx.exports.effect();
  reads.get('B').resolve({ data: { unit_system: 'imperial' } });
  await tick();
  reads.get('A').resolve({ data: { unit_system: 'metric' } });
  await tick();
  assert.equal(ctx.units.ownerUserId, 'B');
  assert.equal(ctx.units.system, 'imperial');
  cleanupB();
  ctx.user = null;
  ctx.currentUserIdRef.current = null;
  ctx.exports.effect();
  assert.equal(ctx.units.ownerUserId, null);
  assert.equal(ctx.units.system, 'imperial');
}

async function run() {
  await testStorageOwnership();
  await testAuthCleanup();
  await testOnboardingRaces();
  await testUnitsRaces();
  console.log('Account boundaries: PASS — owned/legacy/pending drafts, mismatched clear failures, stale reads/writes, sign-out/deletion cleanup, durable restart suppression, safe retry, preflight failures, and late units/onboarding responses. Auth/RPC calls were mocked.');
}
module.exports = run;
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
