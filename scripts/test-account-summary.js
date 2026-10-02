const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const compile = (text) => ts.transpileModule(text, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
  },
}).outputText;
const helper = {};
vm.runInNewContext(compile(read('src/utils/accountSummary.ts')), { exports: helper });
const component = read('src/components/DeleteAccountScreen.tsx');
const ast = ts.createSourceFile('screen.tsx', component, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let handler;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'fetchStats') {
    handler = node.initializer.getText(ast);
  }
  ts.forEachChild(node, visit);
}
visit(ast);
assert.ok(handler);
const ok = (data) => ({ data, error: null });
const failed = { data: null, error: { message: 'Request failed' } };
const sessions = [
  { started_at: '2026-10-01T10:00:00Z' },
  { started_at: '2026-10-01T12:00:00Z' },
  { started_at: '2026-10-02T10:00:00Z' },
];
const measurement = { created_at: '2026-10-02T09:00:00Z' };
const plain = (value) => JSON.parse(JSON.stringify(value));

function makeLoader(workouts, measurements) {
  const state = { loading: false, error: 'previous error', stats: { totalWorkouts: 999 }, requests: 0 };
  const responses = { workout_sessions: workouts, body_measurements: measurements };
  const ctx = {
    exports: {}, __DEV__: false, user: { id: 'test-user' },
    buildAccountSummary: helper.buildAccountSummary,
    setStatsLoading(value) { state.loading = value; },
    setStatsError(value) { state.error = value; },
    setStats(value) { state.stats = value; },
    supabase: {
      from(table) {
        state.requests++;
        const query = {
          select() { return this; }, eq() { return this; }, order() { return this; },
          limit() { return this; }, maybeSingle() { return this; },
          then(resolve, reject) {
            const response = responses[table];
            return (response instanceof Error ? Promise.reject(response) : Promise.resolve(response))
              .then(resolve, reject);
          },
        };
        return query;
      },
    },
  };
  vm.runInNewContext(compile(`exports.fetchStats = ${handler};`), ctx);
  return { state, responses, fetchStats: ctx.exports.fetchStats };
}

// Render the actual screen with deterministic hooks and lightweight native
// elements: verify unavailable data cannot render numeric summary cells.
function renderSummary(state) {
  const values = [state.loading, state.stats, state.error, 'review', '', false, ''];
  let hookIndex = 0;
  const jsx = (type, props) => ({ type, props: props ?? {} });
  const native = {
    StyleSheet: { create: (styles) => styles },
    Platform: { OS: 'web' },
  };
  for (const name of ['View', 'Text', 'TouchableOpacity', 'ScrollView', 'ActivityIndicator',
    'TextInput', 'KeyboardAvoidingView']) native[name] = name;
  const modules = {
    react: { useState: () => [values[hookIndex++], () => {}], useEffect() {} },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': native,
    '@react-navigation/native': { useNavigation: () => ({ goBack() {} }) },
    '../contexts/AuthContext': { useAuth: () => ({ user: { email: 'test@example.invalid' } }) },
    '../lib/supabase': { supabase: {} },
    '../utils/accountSummary': helper,
  };
  const ctx = { exports: {}, require: (name) => {
    assert.ok(modules[name], `Unexpected dependency: ${name}`);
    return modules[name];
  } };
  vm.runInNewContext(compile(component), ctx);
  return ctx.exports.DeleteAccountScreen();
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap((child) => find(child, predicate));
  return [...(predicate(node) ? [node] : []), ...find(node.props?.children, predicate)];
}
function checkUnavailable(state) {
  assert.equal(state.loading, false);
  assert.equal(state.stats, null);
  assert.match(state.error, /Couldn’t load your account data summary/);
  const tree = renderSummary(state);
  assert.equal(find(tree, (node) => node.props?.testID === 'account-summary-error').length, 1);
  assert.equal(find(tree, (node) => node.props?.testID === 'retry-account-summary').length, 1);
  assert.equal(find(tree, (node) => typeof node.type === 'function' && node.type.name === 'StatItem').length, 0);
}

async function run() {
  const populated = makeLoader(ok(sessions), ok(measurement));
  await populated.fetchStats();
  assert.equal(populated.state.error, '');
  assert.deepEqual(plain(populated.state.stats), {
    totalWorkouts: 3, daysActive: 2, lastMeasurementDate: measurement.created_at,
  });

  const empty = makeLoader(ok([]), ok(null));
  await empty.fetchStats();
  assert.deepEqual(plain(empty.state.stats), {
    totalWorkouts: 0, daysActive: 0, lastMeasurementDate: null,
  });
  const cells = find(renderSummary(empty.state), (node) => typeof node.type === 'function' && node.type.name === 'StatItem');
  assert.deepEqual(cells.map((node) => node.props.value), ['0', '0', 'None']);

  for (const [workouts, measurements] of [
    [failed, ok(measurement)], [ok(sessions), failed], [failed, failed],
    [new Error('Network failure'), ok(measurement)],
    [ok(sessions), new Error('Network failure')],
  ]) {
    const loader = makeLoader(workouts, measurements);
    const pending = loader.fetchStats();
    assert.equal(loader.state.loading, true);
    assert.equal(loader.state.stats, null); // stale numbers cleared immediately
    assert.equal(loader.state.error, '');
    await pending;
    checkUnavailable(loader.state);
    loader.responses.workout_sessions = ok(sessions);
    loader.responses.body_measurements = ok(measurement);
    await loader.fetchStats();
    assert.equal(loader.state.loading, false);
    assert.equal(loader.state.error, '');
    assert.equal(loader.state.stats.totalWorkouts, 3);
    assert.equal(loader.state.requests, 4);
    assert.equal(find(renderSummary(loader.state), (node) => node.props?.testID === 'account-summary-error').length, 0);
  }
  console.log('Account summary: PASS — non-empty/empty results, workout/measurement errors, rejected requests, hidden stale/zero cells, rendered error + retry action, and retry recovery. No profile query exists.');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });