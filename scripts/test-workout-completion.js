const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const checklist = fs.readFileSync(
  path.join(__dirname, '../src/components/WorkoutChecklistScreen.tsx'), 'utf8',
);
const source = ts.createSourceFile('checklist.tsx', checklist, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const names = ['doSaveWorkout', 'handleFinishWorkout', 'handleSavedWorkoutClose', 'formatLastTime'];
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

function makeWorkout(kind = 'reps', failFirstInsert = false, options = {}) {
  const events = {
    attempts: 0, sessions: 0, prs: [], navigations: [], errors: [], alerts: [],
    setRows: [], sessionRows: [], challengeProgress: [],
  };
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
        ? { kind, raw: 'invalid', origin: 'test' }
        : { kind, value: options.targetValue ?? (kind === 'seconds' ? 45 : kind === 'steps' ? 20 : 12) },
      weight: options.weight ?? '',
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
    formatWorkoutTarget: targetExports.formatWorkoutTarget,
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
      update(rows) {
        this.updating = true;
        if (table === 'user_challenges' && 'current_progress' in rows) {
          events.challengeProgress.push(rows.current_progress);
        }
        return this;
      },
      insert(rows) { this.rows = rows; return this; },
      upsert(rows) { events.prs.push(...rows); return this; },
      then(resolve, reject) {
        let data = table === 'exercises' ? [{ id: 'exercise-1', name: 'Test Lift' }] : [];
        if (options.volumeChallenge) {
          if (table === 'user_challenges' && !this.updating) {
            data = [{
              id: 'challenge-1', started_at: '2026-01-01', ends_at: '2027-01-01',
              target_value: 9999,
              challenges: { challenge_type: 'volume', target_exercise_id: 'exercise-1' },
            }];
          }
          if (table === 'workout_sessions') data = [{ id: 'session-1' }];
          if (table === 'session_exercises') data = [{ id: 'session-exercise-1' }];
          if (table === 'session_sets') data = events.setRows.map((row) => ({ reps: row.reps }));
        }
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
      events.sessionRows.push(JSON.parse(JSON.stringify(chain.rows)));
      return { id: `session-${events.sessions}` };
    }
    if (chain.table === 'session_exercises') return [{ id: 'session-exercise-1', order_index: 0 }];
    if (chain.table === 'session_sets') {
      const rows = JSON.parse(JSON.stringify(chain.rows));
      events.setRows.push(...rows);
      return rows.map((row, index) => ({ id: `set-${index + 1}`, ...row }));
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
  assert.deepEqual(reps.events.setRows[0], {
    session_exercise_id: 'session-exercise-1', set_number: 1,
    target_kind: 'reps', target_value: 12, target_raw: null,
    reps: 12, duration_seconds: null, weight_kg: null,
    is_completed: true, is_pr: false,
  });
  reps.handleFinishWorkout();
  await reps.doSaveWorkout();
  assert.equal(reps.events.sessions, 1);
  reps.handleSavedWorkoutClose();
  assert.equal(reps.events.navigations[0][0], 'WorkoutDetails');
  assert.equal(reps.events.navigations[0][1].workoutId, 'session-1');
  assert.equal(reps.formatLastTime({ sets: 2, reps: 12, weight: null, target: null }), '2×12');
  assert.equal(reps.formatLastTime({ sets: 2, reps: null, weight: null, target: null }), '2 sets · reps not recorded');

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

  for (const kind of ['reps', 'seconds', 'steps']) {
    const workout = makeWorkout(kind, false, { weight: '100', volumeChallenge: true });
    const planned = workout.ctx.exercises[0].target.value;
    workout.handleFinishWorkout();
    workout.handleFinishWorkout();
    await tick();
    assert.deepEqual(workout.events.errors, []);
    assert.equal(workout.events.sessions, 1);
    assert.equal(workout.ctx.workoutFinishedRef.current, true);
    assert.deepEqual(workout.events.setRows[0], {
      session_exercise_id: 'session-exercise-1', set_number: 1,
      target_kind: kind, target_value: planned, target_raw: null,
      reps: kind === 'reps' ? planned : null, duration_seconds: null,
      weight_kg: 100, is_completed: true, is_pr: true,
    });
    assert.equal(workout.events.prs.filter((pr) => pr.record_type === 'max_reps').length, kind === 'reps' ? 1 : 0);
    assert.equal(workout.events.prs.filter((pr) => pr.record_type === 'max_weight').length, 1);
    assert.equal(workout.events.prs.some((pr) => pr.record_type === 'max_duration'), false);
    assert.deepEqual(workout.events.challengeProgress, [kind === 'reps' ? planned : 0]);
    const lastTime = workout.formatLastTime({
      sets: 1, reps: kind === 'reps' ? planned : null, weight: 100,
      target: workout.ctx.exercises[0].target,
    });
    assert.equal(lastTime, kind === 'reps'
      ? `1×${planned}`
      : `1 sets · planned target: ${planned} ${kind}`);
    assert.ok(workout.events.sessionRows[0].duration_seconds >= 60);
    assert.match(workout.ctx.completedWorkout.message, /Great job!/);
    workout.handleFinishWorkout();
    await workout.doSaveWorkout();
    assert.equal(workout.events.sessions, 1);
    workout.handleSavedWorkoutClose();
    assert.equal(workout.events.navigations[0][0], 'WorkoutDetails');
    assert.equal(workout.events.navigations[0][1].workoutId, 'session-1');

    const retryTarget = makeWorkout(kind, true);
    retryTarget.handleFinishWorkout();
    await tick();
    assert.equal(retryTarget.ctx.isSaving, false);
    assert.equal(retryTarget.ctx.workoutFinishedRef.current, false);
    assert.equal(retryTarget.ctx.saveInProgressRef.current, false);
    retryTarget.handleFinishWorkout();
    await tick();
    assert.equal(retryTarget.events.sessions, 1);
    assert.equal(retryTarget.events.attempts, 2);
  }

  for (const [kind, options] of [
    ['unknown', {}], ['seconds', { targetValue: 2147483648 }],
    ['steps', { targetValue: 0 }], ['reps', { targetValue: 1.5 }],
  ]) {
    const blocked = makeWorkout(kind, false, options);
    blocked.handleFinishWorkout();
    await blocked.doSaveWorkout(); // second guard also must block direct save
    assert.equal(blocked.ctx.unsupportedFinishVisible, true);
    assert.equal(blocked.events.attempts, 0);
    assert.equal(blocked.events.sessions, 0);
    assert.equal(blocked.events.setRows.length, 0);
    assert.equal(blocked.events.prs.length, 0);
  }
  console.log('Workout completion: reps/seconds/steps payloads, completion, double-tap, navigation, retry, PR, rep volume, and unknown/invalid blocking passed.');
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
