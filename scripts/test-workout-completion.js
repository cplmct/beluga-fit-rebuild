const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const checklist = fs.readFileSync(
  path.join(__dirname, '../src/components/WorkoutChecklistScreen.tsx'), 'utf8',
);
const source = ts.createSourceFile('checklist.tsx', checklist, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const names = ['doSaveWorkout', 'handleFinishWorkout', 'handleSavedWorkoutClose'];
const declarations = [];
function visit(node) {
  if (ts.isVariableDeclaration(node) && names.includes(node.name.getText(source))) {
    declarations.push(`const ${node.name.getText(source)} = ${node.initializer.getText(source)};`);
  }
  ts.forEachChild(node, visit);
}
visit(source);
assert.equal(declarations.length, names.length);
const code = ts.transpileModule(
  `${declarations.join('\n')}\nexports.handlers = { ${names.join(', ')} };`,
  { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } },
).outputText;

const targetCode = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, '../src/utils/workoutTarget.ts'), 'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } },
).outputText;
const targetExports = {};
vm.runInNewContext(targetCode, { exports: targetExports });

const tick = () => new Promise((resolve) => setImmediate(resolve));

function makeWorkout(kind = 'reps', failFirstInsert = false) {
  const events = { attempts: 0, sessions: 0, prs: [], navigations: [], errors: [], alerts: [] };
  const refs = {
    saveInProgressRef: { current: false },
    workoutFinishedRef: { current: false },
    startTimeRef: { current: Date.now() - 60_000 },
  };
  const ctx = {
    exports: {},
    __DEV__: false,
    Date,
    ...refs,
    user: { id: 'test-user' },
    exercises: [{
      name: 'Test Lift', bodyPart: 'Legs', sets: 1, target: kind === 'unknown'
        ? { kind, raw: 'invalid', origin: 'test' } : { kind, value: 12 },
      weight: '',
    }],
    completedSets: { 0: [1] },
    completedCount: 1,
    totalCount: 1,
    bodyParts: ['Legs'],
    weightUnit: 'kg',
    isSaving: false,
    completedWorkout: null,
    setIsSaving(value) { ctx.isSaving = value; },
    setUnsupportedFinishVisible(value) { ctx.unsupportedFinishVisible = value; },
    setCompletedWorkout(value) { ctx.completedWorkout = value; },
    getTarget: (exercise) => targetExports.restoreWorkoutTarget(exercise.target, exercise.reps),
    canSaveWorkoutTargets: targetExports.canSaveWorkoutTargets,
    isMaxRepsPrCandidate: targetExports.isMaxRepsPrCandidate,
    getCompletedSetNumbers: (sets, index) => sets[String(index)] || [],
    countCompletedSetsForExercise: (sets, index) => (sets[String(index)] || []).length,
    formatDuration: () => '1m',
    haptic: { success() {}, error() {} },
    saveStatus: {
      setSaving() {},
      setSuccess() {},
      setError(error) { events.errors.push(error.message); },
    },
    async clearWorkoutSession() {},
    scheduleInactivityReminder() {},
    navigation: { navigate(...args) { events.navigations.push(args); } },
    Alert: { alert(...args) { events.alerts.push(args); } },
  };

  function query(table) {
    const chain = {
      table,
      rows: null,
      select() { return this; },
      eq() { return this; },
      in() { return this; },
      lt() { return this; },
      gt() { return this; },
      gte() { return this; },
      lte() { return this; },
      maybeSingle() { return this; },
      update() { return this; },
      insert(rows) { this.rows = rows; return this; },
      upsert(rows) { events.prs.push(...rows); return this; },
      then(resolve, reject) {
        const data = table === 'exercises' ? [{ id: 'exercise-1', name: 'Test Lift' }] : [];
        return Promise.resolve({ data }).then(resolve, reject);
      },
    };
    return chain;
  }
  ctx.supabase = { from: query };
  ctx.safeQuery = async (chain) => {
    if (chain.table === 'workout_sessions') {
      events.attempts++;
      if (failFirstInsert && events.attempts === 1) throw new Error('Insert failed');
      events.sessions++;
      return { id: `session-${events.sessions}` };
    }
    if (chain.table === 'session_exercises') return [{ id: 'session-exercise-1', order_index: 0 }];
    if (chain.table === 'session_sets') {
      return [{ id: 'set-1', session_exercise_id: 'session-exercise-1', set_number: 1 }];
    }
    return [];
  };

  vm.runInNewContext(code, ctx, { filename: 'WorkoutChecklistScreen.tsx' });
  return { ctx, events, ...ctx.exports.handlers };
}

async function run() {
  const reps = makeWorkout();
  reps.handleFinishWorkout();
  reps.handleFinishWorkout(); // same-tick tap must not start another save
  assert.equal(reps.ctx.saveInProgressRef.current, true);
  await tick();
  assert.deepEqual(reps.events.errors, []);
  assert.equal(reps.events.sessions, 1);
  assert.equal(reps.ctx.workoutFinishedRef.current, true);
  assert.equal(reps.ctx.isSaving, false);
  assert.match(reps.ctx.completedWorkout.message, /Great job!\n\nDuration: 1m/);
  assert.equal(reps.ctx.completedWorkout.id, 'session-1');
  assert.equal(reps.events.prs.filter((pr) => pr.record_type === 'max_reps').length, 1);
  assert.equal(reps.events.prs.find((pr) => pr.record_type === 'max_reps').value, 12);
  reps.handleFinishWorkout();
  await reps.doSaveWorkout();
  assert.equal(reps.events.sessions, 1);
  reps.handleSavedWorkoutClose();
  assert.equal(reps.events.navigations[0][0], 'WorkoutDetails');
  assert.equal(reps.events.navigations[0][1].workoutId, 'session-1');

  const retry = makeWorkout('reps', true);
  retry.handleFinishWorkout();
  await tick();
  assert.equal(retry.ctx.saveInProgressRef.current, false);
  assert.equal(retry.ctx.workoutFinishedRef.current, false);
  assert.equal(retry.ctx.isSaving, false);
  assert.deepEqual(retry.events.errors, ['Insert failed']);
  retry.handleFinishWorkout();
  await tick();
  assert.equal(retry.events.attempts, 2);
  assert.equal(retry.events.sessions, 1);
  assert.equal(retry.ctx.workoutFinishedRef.current, true);

  for (const kind of ['seconds', 'steps', 'unknown']) {
    const blocked = makeWorkout(kind);
    blocked.handleFinishWorkout();
    await blocked.doSaveWorkout(); // second guard also must block direct save
    assert.equal(blocked.ctx.unsupportedFinishVisible, true);
    assert.equal(blocked.events.attempts, 0);
    assert.equal(blocked.events.sessions, 0);
  }
  console.log('Workout completion: double-tap, success, navigation, retry, PR, and blocked-target checks passed.');
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
