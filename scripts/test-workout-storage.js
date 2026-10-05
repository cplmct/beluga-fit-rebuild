const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const compile = text => ts.transpileModule(text, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  },
}).outputText;
function moduleFrom(text, dependencies) {
  const exports = {};
  vm.runInNewContext(compile(text), {
    exports, Date,
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}
const target = moduleFrom(read('src/utils/workoutTarget.ts'), {});
const key = '@beluga_active_workout_v1';
const stored = new Map();
const failures = { read: false, write: false, clear: false };
let clears = 0;
const adapter = {
  async getItem(key) {
    if (failures.read) throw new Error('Read rejected');
    return stored.get(key) ?? null;
  },
  async setItem(key, value) {
    if (failures.write) throw new Error('Write rejected');
    stored.set(key, value);
  },
  async removeItem(key) {
    if (failures.clear) throw new Error('Clear rejected');
    clears++;
    stored.delete(key);
  },
};
const accountCleanup = moduleFrom(read('src/utils/accountCleanup.ts'), {
  '@react-native-async-storage/async-storage': { __esModule: true, default: adapter },
});
const storage = moduleFrom(read('src/utils/workoutSession.ts'), {
  '@react-native-async-storage/async-storage': { __esModule: true, default: adapter },
  './workoutTarget': target,
  './accountCleanup': accountCleanup,
});
const draft = {
  ownerUserId: 'test-user',
  exerciseNames: ['Saved lift', 'Omitted lift'],
  completedSets: { 0: [1], 1: [1] },
  startTime: Date.now() - 60_000,
  savedAt: Date.now() - 25 * 60 * 60 * 1000,
  exercises: ['Saved lift', 'Omitted lift'].map(name => ({
    name, bodyPart: 'Legs', sets: 1, target: { kind: 'reps', value: 12 }, weight: '',
  })),
  bodyParts: ['Legs'],
};
const pending = {
  ...draft,
  saveOutcome: { id: 'saved-session', message: 'Omitted lift was not saved.', partial: true },
};

function extractHandlers(source, names) {
  const ast = ts.createSourceFile('screen.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && names.includes(node.name.getText(ast))) {
      declarations.push(`const ${node.name.getText(ast)} = ${node.initializer.getText(ast)};`);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.equal(declarations.length, names.length);
  return compile(`${declarations.join('\n')}\nexports.handlers = { ${names.join(', ')} };`);
}

function makeHome() {
  const ctx = {
    exports: {}, user: { id: 'test-user' }, resumeSession: pending, resumeStorageError: '',
    discardStorageError: '', pendingDiscardConfirm: false, discardingSession: false,
    discardInProgressRef: { current: false }, discardConfirmOpenRef: { current: false }, resumeReadRef: { current: 0 },
    loadWorkoutSession: storage.loadWorkoutSession,
    clearWorkoutSession: storage.clearWorkoutSession,
  };
  for (const name of ['ResumeSession', 'ResumeStorageError', 'DiscardStorageError', 'PendingDiscardConfirm', 'DiscardingSession']) {
    const field = name[0].toLowerCase() + name.slice(1);
    ctx[`set${name}`] = value => { ctx[field] = value; };
  }
  vm.runInNewContext(extractHandlers(read('src/components/HomeScreen.tsx'),
    ['refreshResumeSession', 'confirmDiscardSession', 'handleDiscardSession', 'cancelDiscardSession']), ctx);
  return { ctx, ...ctx.exports.handlers };
}

// Render the actual result modal JSX, not a copy of its layout.
function renderResultModal(outcome, error = '') {
  const source = read('src/components/WorkoutChecklistScreen.tsx');
  const ast = ts.createSourceFile('screen.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let modal;
  let styles;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'styles') styles = node.initializer.getText(ast);
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(ast) === 'Modal' &&
      node.openingElement.attributes.properties.some(attribute =>
        attribute.name?.getText(ast) === 'visible' &&
        attribute.initializer?.expression?.getText(ast) === 'completedWorkout !== null')) {
      modal = node.getText(ast);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(modal && styles);
  const jsx = (type, props) => ({ type, props: props ?? {} });
  let acknowledgements = 0;
  const ctx = {
    exports: {}, completedWorkout: outcome, resultStorageError: error, resultWriteFailed: false, isSaving: false,
    Modal: 'Modal', View: 'View', Text: 'Text', ScrollView: 'ScrollView', TouchableOpacity: 'TouchableOpacity',
    StyleSheet: { create: styles => styles }, Platform: { OS: 'web' },
    handleSavedWorkoutClose: () => { acknowledgements++; }, handleRetrySavedResult() {},
    require: () => ({ jsx, jsxs: jsx }),
  };
  vm.runInNewContext(compile(`const styles = ${styles}; exports.tree = (${modal});`), ctx);
  return { tree: ctx.exports.tree, count: () => acknowledgements };
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(child => find(child, predicate));
  return [...(predicate(node) ? [node] : []), ...find(node.props?.children, predicate)];
}

// Render Home's real banner and use the same onPress handlers as the device flow.
function renderHomeBanner(home) {
  const source = read('src/components/HomeScreen.tsx');
  const ast = ts.createSourceFile('home.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let banner;
  function visit(node) {
    if (ts.isJsxExpression(node) && node.expression?.getText(ast).startsWith('resumeSession && resumeSession.ownerUserId')) {
      banner = node.expression.getText(ast);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(banner);
  const jsx = (type, props) => ({ type, props: props ?? {} });
  const ctx = {
    ...home.ctx, exports: {}, ...home,
    View: 'View', Text: 'Text', TouchableOpacity: 'TouchableOpacity', styles: {},
    navigation: { navigate() { throw new Error('Discard must not navigate'); } },
    require: () => ({ jsx, jsxs: jsx }),
  };
  vm.runInNewContext(compile(`exports.tree = (${banner});`), ctx);
  return ctx.exports.tree;
}
function bannerButton(home, label) {
  const buttons = find(renderHomeBanner(home), node => node.type === 'TouchableOpacity' &&
    find(node, child => child.type === 'Text' && child.props.children === label).length > 0);
  assert.equal(buttons.length, 1, `Home should render one ${label} action`);
  return buttons[0];
}

async function run() {
  storage.setWorkoutSessionOwner('test-user');
  stored.set(key, JSON.stringify(draft));
  assert.equal(await storage.loadWorkoutSession('test-user'), null);
  assert.equal(stored.has(key), false); // ordinary 24-hour expiry unchanged

  const rawPending = JSON.stringify(pending);
  stored.set(key, rawPending);
  const restored = await storage.loadWorkoutSession('test-user');
  assert.equal(restored.saveOutcome.id, 'saved-session');
  assert.equal(restored.saveOutcome.partial, true);
  assert.equal(restored.exercises.length, 2);
  assert.equal(stored.get(key), rawPending); // old pending results are never expired
  await assert.rejects(storage.saveWorkoutSession(draft), /must be acknowledged or discarded/);
  assert.equal(stored.get(key), rawPending); // ordinary autosave cannot overwrite it
  await assert.rejects(storage.saveWorkoutSession({
    ...pending, saveOutcome: { ...pending.saveOutcome, id: 'different-session' },
  }), /must be acknowledged or discarded/);
  await storage.saveWorkoutSession(pending); // same-result persistence retry remains valid

  failures.read = true;
  await assert.rejects(storage.loadWorkoutSession('test-user'), /Read rejected/);
  assert.ok(stored.has(key));
  const home = makeHome();
  await home.refreshResumeSession();
  assert.match(home.ctx.resumeStorageError, /Couldn’t check/);
  assert.equal(home.ctx.resumeSession.saveOutcome.id, 'saved-session');
  failures.read = false;
  await home.refreshResumeSession();
  assert.equal(home.ctx.resumeStorageError, '');

  failures.write = true;
  const beforeWrite = stored.get(key);
  await assert.rejects(storage.saveWorkoutSession(pending), /Write rejected/);
  assert.equal(stored.get(key), beforeWrite);
  failures.write = false;

  stored.set(key, JSON.stringify({ ...draft, savedAt: Date.now() }));
  failures.write = true;
  await assert.rejects(storage.saveWorkoutSession(pending), /Write rejected/);
  assert.equal(JSON.parse(stored.get(key)).saveOutcome, undefined); // failed marker write is not persisted
  failures.write = false;
  await storage.saveWorkoutSession(pending);

  const beforeDiscard = clears;
  await bannerButton(home, 'Discard').props.onPress();
  assert.equal(home.ctx.pendingDiscardConfirm, true);
  assert.equal(clears, beforeDiscard); // first tap only asks for destructive confirmation
  assert.ok(find(renderHomeBanner(home), node => node.type === 'Text' &&
    typeof node.props.children === 'string' && node.props.children.includes('workout already saved in History will remain')).length);
  bannerButton(home, 'Keep retained draft').props.onPress();
  assert.equal(home.ctx.pendingDiscardConfirm, false);
  assert.ok(stored.has(key));
  await bannerButton(home, 'Discard').props.onPress();
  failures.clear = true;
  await assert.rejects(storage.clearWorkoutSession('test-user'), /Clear rejected/);
  await home.confirmDiscardSession();
  assert.equal(home.ctx.resumeSession.saveOutcome.id, 'saved-session');
  assert.equal(home.ctx.pendingDiscardConfirm, true);
  assert.match(home.ctx.discardStorageError, /has not been cleared/);
  assert.ok(stored.has(key));
  failures.clear = false;
  await home.confirmDiscardSession();
  assert.equal(home.ctx.resumeSession, null);
  assert.equal(home.ctx.pendingDiscardConfirm, false);
  assert.equal(home.ctx.discardStorageError, '');
  assert.equal(stored.has(key), false); // explicit confirmed discard

  await storage.saveWorkoutSession(pending);
  const ack = {
    exports: {}, user: { id: 'test-user' }, completedWorkout: pending.saveOutcome, resultWriteFailed: false,
    resultStorageError: '', saveInProgressRef: { current: false },
    clearWorkoutSession: () => storage.clearWorkoutSession('test-user'), navigations: [],
    setCompletedWorkout(value) { ack.completedWorkout = value; },
    setResultStorageError(value) { ack.resultStorageError = value; },
    navigation: { navigate(...args) { ack.navigations.push(args); } },
  };
  vm.runInNewContext(extractHandlers(read('src/components/WorkoutChecklistScreen.tsx'),
    ['handleSavedWorkoutClose']), ack);
  failures.clear = true;
  await ack.exports.handlers.handleSavedWorkoutClose();
  assert.ok(stored.has(key));
  assert.equal(ack.completedWorkout.id, 'saved-session');
  assert.equal(ack.navigations.length, 0);
  assert.match(ack.resultStorageError, /has not been cleared/);
  failures.clear = false;
  await ack.exports.handlers.handleSavedWorkoutClose();
  assert.equal(stored.has(key), false); // real helper + actual acknowledgement handler
  assert.equal(ack.completedWorkout, null);
  assert.equal(ack.navigations[0][0], 'WorkoutDetails');
  assert.equal(ack.navigations[0][1].workoutId, 'saved-session');

  const ordinaryHome = makeHome();
  ordinaryHome.ctx.resumeSession = draft;
  stored.set(key, JSON.stringify(draft));
  const beforeOrdinary = stored.get(key);
  const clearsBeforeOrdinary = clears;
  await ordinaryHome.handleDiscardSession();
  assert.equal(ordinaryHome.ctx.pendingDiscardConfirm, true);
  assert.equal(stored.get(key), beforeOrdinary);
  assert.equal(clears, clearsBeforeOrdinary);
  const readAfterPrompt = ordinaryHome.ctx.resumeReadRef.current;
  await ordinaryHome.handleDiscardSession();
  assert.equal(ordinaryHome.ctx.resumeReadRef.current, readAfterPrompt); // duplicate prompt blocked
  bannerButton(ordinaryHome, 'Cancel').props.onPress();
  assert.equal(ordinaryHome.ctx.pendingDiscardConfirm, false);
  assert.equal(ordinaryHome.ctx.resumeSession, draft);
  assert.equal(stored.get(key), beforeOrdinary); // Cancel leaves exact local draft unchanged

  // One completed set in the observed five-exercise device flow.
  const oneSetDraft = {
    ...draft, savedAt: Date.now(), completedSets: { 0: [1] },
    exercises: Array.from({ length: 5 }, (_, i) => ({ ...draft.exercises[0], name: `Lift ${i}` })),
  };
  ordinaryHome.ctx.resumeSession = oneSetDraft;
  stored.set(key, JSON.stringify(oneSetDraft));
  await bannerButton(ordinaryHome, 'Discard').props.onPress();
  assert.equal(ordinaryHome.ctx.pendingDiscardConfirm, true);
  assert.equal(clears, clearsBeforeOrdinary);
  const ordinaryTree = renderHomeBanner(ordinaryHome);
  assert.ok(find(ordinaryTree, node => node.type === 'Text' &&
    node.props.children === 'Discard unfinished workout?').length);
  assert.ok(find(ordinaryTree, node => node.type === 'Text' &&
    node.props.children === 'Your progress in this workout will be deleted and cannot be recovered.').length);
  failures.clear = true;
  await bannerButton(ordinaryHome, 'Discard Workout').props.onPress();
  assert.equal(ordinaryHome.ctx.resumeSession, oneSetDraft);
  assert.equal(ordinaryHome.ctx.pendingDiscardConfirm, true);
  assert.equal(stored.get(key), JSON.stringify(oneSetDraft));
  assert.match(ordinaryHome.ctx.discardStorageError, /has not been cleared/);
  failures.clear = false;
  await bannerButton(ordinaryHome, 'Discard Workout').props.onPress();
  assert.equal(ordinaryHome.ctx.resumeSession, null);
  assert.equal(ordinaryHome.ctx.pendingDiscardConfirm, false);
  assert.equal(stored.has(key), false);

  // Zero completed sets may still contain edited targets; conservatively confirm.
  const emptyDraft = { ...draft, savedAt: Date.now(), completedSets: {} };
  ordinaryHome.ctx.resumeSession = emptyDraft;
  stored.set(key, JSON.stringify(emptyDraft));
  await ordinaryHome.handleDiscardSession();
  assert.equal(ordinaryHome.ctx.pendingDiscardConfirm, true);
  assert.ok(stored.has(key));
  ordinaryHome.cancelDiscardSession();
  assert.equal(stored.get(key), JSON.stringify(emptyDraft));

  const editedDraft = { ...emptyDraft, exercises: [{ ...draft.exercises[0], target: { kind: 'seconds', value: 45 } }] };
  ordinaryHome.ctx.resumeSession = editedDraft;
  stored.set(key, JSON.stringify(editedDraft));
  await ordinaryHome.handleDiscardSession();
  assert.equal(ordinaryHome.ctx.pendingDiscardConfirm, true);
  const originalRemove = adapter.removeItem;
  let finishDiscard;
  let discardAttempts = 0;
  adapter.removeItem = () => {
    discardAttempts++;
    return new Promise(resolve => { finishDiscard = resolve; });
  };
  const inFlightDiscard = ordinaryHome.confirmDiscardSession();
  await new Promise(resolve => setImmediate(resolve));
  await ordinaryHome.confirmDiscardSession();
  await ordinaryHome.handleDiscardSession();
  ordinaryHome.cancelDiscardSession();
  assert.equal(discardAttempts, 1);
  assert.equal(bannerButton(ordinaryHome, 'Discard Workout').props.disabled, true);
  assert.equal(bannerButton(ordinaryHome, 'Cancel').props.disabled, true);
  assert.equal(ordinaryHome.ctx.discardingSession, true);
  assert.equal(ordinaryHome.ctx.pendingDiscardConfirm, true);
  assert.equal(stored.get(key), JSON.stringify(editedDraft));
  adapter.removeItem = originalRemove;
  await originalRemove(key);
  finishDiscard();
  await inFlightDiscard;
  assert.equal(ordinaryHome.ctx.resumeSession, null);
  assert.equal(ordinaryHome.ctx.pendingDiscardConfirm, false);

  // No active draft after completed-workout acknowledgement: no Home prompt/clear.
  const clearsAfterCompletion = clears;
  await ordinaryHome.handleDiscardSession();
  assert.equal(ordinaryHome.ctx.pendingDiscardConfirm, false);
  assert.equal(clears, clearsAfterCompletion);

  stored.set(key, JSON.stringify(draft));
  const originalGet = adapter.getItem;
  let finishRead;
  adapter.getItem = name => name === key
    ? new Promise(resolve => { finishRead = resolve; }) : originalGet(name);
  const cleanup = storage.loadWorkoutSession('test-user');
  const markerWrite = storage.saveWorkoutSession(pending);
  await new Promise(resolve => setImmediate(resolve));
  adapter.getItem = originalGet;
  finishRead(JSON.stringify(draft));
  assert.equal(await cleanup, null);
  await markerWrite;
  assert.equal(JSON.parse(stored.get(key)).saveOutcome.id, 'saved-session');
  // Expiry cleanup cannot overtake and erase a queued pending-result write.

  stored.set(key, JSON.stringify({ ...pending, exercises: [] }));
  await assert.rejects(storage.loadWorkoutSession('test-user'), /could not be restored/);
  assert.ok(stored.has(key)); // malformed pending result is not silently removed
  stored.set(key, JSON.stringify({ ...pending, saveOutcome: { id: '' } }));
  await assert.rejects(storage.loadWorkoutSession('test-user'), /could not be read/);
  await assert.rejects(storage.saveWorkoutSession(draft), /must be acknowledged or discarded/);
  assert.ok(stored.has(key));

  const longResult = { ...pending.saveOutcome, message: 'Omitted exercise\n'.repeat(100) };
  const modal = renderResultModal(longResult);
  const warning = find(modal.tree, node => node.props.testID === 'partial-draft-clear-warning')[0];
  assert.ok(warning);
  assert.match(warning.props.children, /Omitted work cannot be resumed afterward/);
  assert.equal(warning.props.style.flexShrink, 0);
  const scrolls = find(modal.tree, node => node.type === 'ScrollView');
  assert.equal(scrolls.length, 1);
  assert.equal(find(scrolls[0], node => node === warning).length, 0);
  const dialog = modal.tree.props.children.props.children;
  const children = dialog.props.children.filter(Boolean);
  assert.equal(children[children.length - 2], warning); // warning immediately before acknowledgement
  assert.equal(children[children.length - 1].type, 'TouchableOpacity');
  modal.tree.props.onRequestClose();
  assert.equal(modal.count(), 0); // partial hardware Back still blocked
  children[children.length - 1].props.onPress();
  assert.equal(modal.count(), 1);
  const full = renderResultModal({ ...longResult, partial: false });
  full.tree.props.onRequestClose();
  assert.equal(full.count(), 1);
  // Exercise Home's actual boundary path with its previous account's retained state.
  stored.set(key, JSON.stringify(pending));
  storage.setWorkoutSessionOwner('other-user');
  const switchedHome = makeHome();
  switchedHome.ctx.user = { id: 'other-user' };
  assert.equal(renderHomeBanner(switchedHome), false);
  failures.clear = true;
  await switchedHome.refreshResumeSession();
  assert.equal(switchedHome.ctx.resumeSession, null);
  assert.match(switchedHome.ctx.resumeStorageError, /Couldn’t check/);
  assert.equal(stored.get(key), JSON.stringify(pending));
  failures.clear = false;
  await switchedHome.refreshResumeSession();
  assert.equal(switchedHome.ctx.resumeSession, null);
  assert.equal(stored.has(key), false);
  await require('./test-account-boundaries.js')();
  console.log('Workout storage: PASS — ordinary expiry, non-expiring pending results, restore, overwrite protection, zero/one-set and edited-draft confirmation, Cancel retention, confirmed discard, duplicate-discard blocking, no completed-workout discard prompt, pending-result confirmation, write/read/clear rejections, no false-cleared state, and fixed-footer warning with blocked partial Back.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });