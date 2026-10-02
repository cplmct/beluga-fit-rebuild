const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const checklist = fs.readFileSync(
  path.join(__dirname, '../src/components/WorkoutChecklistScreen.tsx'), 'utf8',
);
const source = ts.createSourceFile('checklist.tsx', checklist, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const names = ['doSaveWorkout', 'handleFinishWorkout', 'handleSavedWorkoutClose', 'formatLastTime', 'checkForSavedSession', 'persistSavedWorkoutResult', 'handleRetrySavedResult'];
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
    clears: 0, snapshots: [], successes: 0, reminders: 0,
  };
  const refs = {
    saveInProgressRef: { current: false },
    workoutFinishedRef: { current: false },
    sessionRestoreBlockedRef: { current: false },
    startTimeRef: { current: Date.now() - 60_000 },
  };
  const ctx = {
    exports: {},
    __DEV__: false,
    Date,
    ...refs,
    user: { id: 'test-user' },
    exercises: options.exercises ?? [{
      name: 'Test Lift', bodyPart: 'Legs', sets: 1, target: kind === 'unknown'
        ? { kind, raw: 'invalid', origin: 'test' }
        : { kind, value: options.targetValue ?? (kind === 'seconds' ? 45 : kind === 'steps' ? 20 : 12) },
      weight: options.weight ?? '',
    }],
    completedSets: options.completedSets ?? { 0: [1] },
    completedCount: 1,
    totalCount: 1,
    bodyParts: ['Legs'],
    weightUnit: 'kg',
    isSaving: false,
    completedWorkout: null,
    setIsSaving(value) { ctx.isSaving = value; },
    setUnsupportedFinishVisible(value) { ctx.unsupportedFinishVisible = value; },
    setResolutionFailure(value) { ctx.resolutionFailure = value; },
    setResultStorageError(value) { ctx.resultStorageError = value; },
    setResultWriteFailed(value) { ctx.resultWriteFailed = value; },
    setSessionStorageError(value) { ctx.sessionStorageError = value; },
    setIsRestoringSession(value) { ctx.isRestoringSession = value; },
    setCompletedWorkout(value) { ctx.completedWorkout = value; },
    setExercises(value) { ctx.exercises = value; },
    setCompletedSets(value) { ctx.completedSets = value; },
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
      setSuccess() { events.successes++; },
      setError(error) { events.errors.push(error.message); },
    },
    savedPayload: null,
    async saveWorkoutSession(payload) {
      ctx.savedPayload = JSON.parse(JSON.stringify({ ...payload, savedAt: Date.now() }));
      events.snapshots.push(ctx.savedPayload);
    },
    async loadWorkoutSession() { return ctx.savedPayload; },
    async clearWorkoutSession() { events.clears++; ctx.savedPayload = null; },
    scheduleInactivityReminder() { events.reminders++; },
    navigation: { navigate(...args) { events.navigations.push(args); } },
    Alert: { alert(...args) { events.alerts.push(args); } },
  };
  ctx.completedCount = Object.values(ctx.completedSets).reduce((sum, sets) => sum + sets.length, 0);
  ctx.totalCount = ctx.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);

  function query(table) {
    const chain = {
      table,
      rows: null,
      select() { return this; },
      eq() { return this; },
      in(field, values) { this.filter = { field, values }; return this; },
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
        const catalog = options.catalog ?? ctx.exercises.map((exercise, index) => ({
          id: `exercise-${index + 1}`, name: exercise.name,
        }));
        let data = table === 'exercises'
          ? catalog.filter((row) => !this.filter || this.filter.values.includes(row[this.filter.field]))
          : [];
        if (table === 'exercises' && options.lookupError) {
          return Promise.resolve({ data: null, error: { message: 'Lookup failed' } }).then(resolve, reject);
        }
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
    if (chain.table === 'session_exercises') {
      return chain.rows
        .filter((row) => !(options.missingSessionIndices ?? []).includes(row.order_index))
        .map((row) => ({ id: `session-exercise-${row.order_index + 1}`, order_index: row.order_index }));
    }
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
  assert.equal(reps.ctx.completedWorkout.partial, false);
  assert.equal(reps.events.clears, 0); // no draft clearing before acknowledgement
  assert.equal(reps.ctx.savedPayload.saveOutcome.id, 'session-1');
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
  await Promise.all([reps.handleSavedWorkoutClose(), reps.handleSavedWorkoutClose()]);
  assert.equal(reps.events.clears, 1);
  assert.equal(reps.events.navigations.length, 1);
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
  assert.equal(retry.events.clears, 0);
  assert.equal(retry.ctx.completedWorkout, null);
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
    await workout.handleSavedWorkoutClose();
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
  const selections = [
    { name: 'Test Lift', bodyPart: 'Legs', sets: 1, target: { kind: 'reps', value: 12 }, weight: '100' },
    { name: 'Missing Lift', bodyPart: 'Legs', sets: 1, target: { kind: 'reps', value: 18 }, weight: '100' },
  ];
  const completed = { 0: [1], 1: [1] };
  const catalog = selections.map((exercise, index) => ({ id: `exercise-${index + 1}`, name: exercise.name }));
  const full = makeWorkout('reps', false, { exercises: selections, completedSets: completed });
  await full.doSaveWorkout();
  assert.equal(full.ctx.completedWorkout.partial, false);
  assert.equal(full.events.setRows.length, 2);
  assert.equal(full.events.prs.length, 4);
  assert.equal(full.events.successes, 1);

  for (const options of [
    { catalog: catalog.slice(0, 1) }, // database exercise unresolved
    { missingSessionIndices: [1] }, // database exercise resolves, session exercise does not
    { catalog: catalog.slice(1) }, // preserve original index when first exercise is omitted
  ]) {
    const partial = makeWorkout('reps', false, { exercises: selections, completedSets: completed, ...options });
    partial.handleFinishWorkout();
    partial.handleFinishWorkout();
    await tick();
    assert.equal(partial.events.sessions, 1);
    assert.equal(partial.ctx.completedWorkout.partial, true);
    const omittedName = options.catalog?.[0]?.name === 'Missing Lift' ? 'Test Lift' : 'Missing Lift';
    assert.match(partial.ctx.completedWorkout.message, /partially saved/);
    assert.ok(partial.ctx.completedWorkout.message.includes(`• ${omittedName}`));
    assert.ok(checklist.includes('Viewing the saved workout will clear the retained draft, including the exercises not saved.'));
    assert.equal(partial.events.setRows.length, 1);
    assert.equal(partial.events.successes, 0);
    assert.equal(partial.events.clears, 0);
    assert.equal(partial.ctx.workoutFinishedRef.current, true);
    const savedId = omittedName === 'Test Lift' ? 'exercise-2' : 'exercise-1';
    assert.ok(partial.events.prs.every((pr) => pr.exercise_id === savedId));
    const prSection = partial.ctx.completedWorkout.message.split('Duration:')[1];
    assert.ok(!prSection.includes(`• ${omittedName}`));
    partial.handleFinishWorkout();
    await partial.doSaveWorkout();
    assert.equal(partial.events.sessions, 1); // partial save cannot be retried as a new full save

    const restored = makeWorkout();
    restored.ctx.savedPayload = partial.ctx.savedPayload;
    await restored.checkForSavedSession();
    assert.equal(restored.ctx.workoutFinishedRef.current, true);
    assert.equal(restored.ctx.completedWorkout.partial, true);
    assert.equal(restored.ctx.exercises.length, 2);
    restored.handleFinishWorkout();
    await restored.doSaveWorkout();
    assert.equal(restored.events.sessions, 0); // pending acknowledgement survives restart
    await restored.handleSavedWorkoutClose();
    assert.equal(restored.events.clears, 1);
    assert.equal(restored.events.navigations[0][1].workoutId, 'session-1');
  }

  const restoredFull = makeWorkout();
  restoredFull.ctx.savedPayload = full.ctx.savedPayload;
  await restoredFull.checkForSavedSession();
  assert.equal(restoredFull.ctx.completedWorkout.partial, false);
  await restoredFull.doSaveWorkout();
  assert.equal(restoredFull.events.sessions, 0);

  const unresolvedOptions = { exercises: selections, completedSets: completed, catalog: [] };
  const unresolved = makeWorkout('reps', false, unresolvedOptions);
  unresolved.handleFinishWorkout();
  unresolved.handleFinishWorkout();
  await tick();
  assert.equal(unresolved.events.sessions, 0);
  assert.equal(unresolved.events.attempts, 0);
  assert.equal(unresolved.events.setRows.length, 0);
  assert.equal(unresolved.events.prs.length, 0);
  assert.equal(unresolved.ctx.completedWorkout, null);
  assert.equal(unresolved.ctx.resolutionFailure.title, 'Workout not saved');
  assert.equal(unresolved.ctx.workoutFinishedRef.current, false);
  assert.equal(unresolved.events.clears, 0);
  assert.ok(selections.every((exercise) => unresolved.events.errors[0].includes(exercise.name)));
  unresolvedOptions.catalog = catalog;
  await unresolved.doSaveWorkout(); // lookup repair can be retried
  assert.equal(unresolved.events.sessions, 1);
  assert.equal(unresolved.ctx.completedWorkout.partial, false);
  assert.equal(unresolved.ctx.resolutionFailure, null);

  const missingSession = makeWorkout('reps', false, {
    exercises: selections, completedSets: completed, missingSessionIndices: [0, 1],
  });
  await missingSession.doSaveWorkout();
  assert.equal(missingSession.ctx.completedWorkout, null);
  assert.equal(missingSession.ctx.resolutionFailure.title, 'Save incomplete');
  assert.equal(missingSession.events.clears, 0);
  assert.equal(missingSession.events.successes, 0);
  assert.equal(missingSession.events.prs.length, 0);
  assert.equal(missingSession.events.reminders, 0);
  assert.match(missingSession.events.errors[0], /No exercises could be confirmed saved/);
  assert.match(missingSession.events.errors[0], /Check History before retrying/);

  const lookupFailure = makeWorkout('reps', false, { lookupError: true });
  await lookupFailure.doSaveWorkout();
  assert.equal(lookupFailure.events.sessions, 0);
  assert.equal(lookupFailure.ctx.completedWorkout, null);
  assert.equal(lookupFailure.ctx.resolutionFailure.title, 'Workout not saved');
  assert.equal(lookupFailure.events.clears, 0);
  assert.match(lookupFailure.events.errors[0], /Test Lift/);

  const writeFailure = makeWorkout();
  writeFailure.ctx.saveWorkoutSession = async () => { throw new Error('Storage write rejected'); };
  await writeFailure.doSaveWorkout();
  assert.equal(writeFailure.events.sessions, 1);
  assert.equal(writeFailure.ctx.completedWorkout.id, 'session-1');
  assert.equal(writeFailure.ctx.workoutFinishedRef.current, true);
  assert.equal(writeFailure.events.successes, 0);
  assert.match(writeFailure.ctx.resultStorageError, /could not be stored/);
  assert.match(writeFailure.ctx.resultStorageError, /duplicate save/);
  await writeFailure.doSaveWorkout();
  assert.equal(writeFailure.events.sessions, 1);
  await writeFailure.handleRetrySavedResult();
  assert.match(writeFailure.ctx.resultStorageError, /still could not be stored/);
  writeFailure.ctx.saveWorkoutSession = async (payload) => { writeFailure.ctx.savedPayload = payload; };
  await writeFailure.handleRetrySavedResult();
  assert.equal(writeFailure.ctx.resultStorageError, '');
  assert.equal(writeFailure.ctx.savedPayload.saveOutcome.id, 'session-1');
  assert.equal(writeFailure.events.sessions, 1); // retrying storage is not retrying database save

  const clearFailure = makeWorkout();
  await clearFailure.doSaveWorkout();
  clearFailure.ctx.clearWorkoutSession = async () => { throw new Error('Storage clear rejected'); };
  await clearFailure.handleSavedWorkoutClose();
  assert.equal(clearFailure.ctx.completedWorkout.id, 'session-1');
  assert.equal(clearFailure.ctx.savedPayload.saveOutcome.id, 'session-1');
  assert.equal(clearFailure.events.navigations.length, 0);
  assert.match(clearFailure.ctx.resultStorageError, /has not been cleared/);
  clearFailure.ctx.clearWorkoutSession = async () => { clearFailure.ctx.savedPayload = null; };
  await clearFailure.handleSavedWorkoutClose();
  assert.equal(clearFailure.ctx.completedWorkout, null);
  assert.equal(clearFailure.events.navigations.length, 1);

  const readFailure = makeWorkout();
  readFailure.ctx.loadWorkoutSession = async () => { throw new Error('Storage read rejected'); };
  await readFailure.checkForSavedSession();
  assert.equal(readFailure.ctx.sessionRestoreBlockedRef.current, true);
  assert.match(readFailure.ctx.sessionStorageError, /Saving is blocked/);
  assert.equal(readFailure.ctx.isRestoringSession, false);
  readFailure.handleFinishWorkout();
  await readFailure.doSaveWorkout();
  assert.equal(readFailure.events.sessions, 0);
  readFailure.ctx.savedPayload = full.ctx.savedPayload;
  readFailure.ctx.loadWorkoutSession = async () => readFailure.ctx.savedPayload;
  await readFailure.checkForSavedSession();
  assert.equal(readFailure.ctx.sessionStorageError, '');
  assert.equal(readFailure.ctx.workoutFinishedRef.current, true);
  await readFailure.doSaveWorkout();
  assert.equal(readFailure.events.sessions, 0);

  const delayedRead = makeWorkout();
  let finishRead;
  delayedRead.ctx.loadWorkoutSession = () => new Promise(resolve => { finishRead = resolve; });
  const restoring = delayedRead.checkForSavedSession();
  delayedRead.handleFinishWorkout();
  await delayedRead.doSaveWorkout();
  assert.equal(delayedRead.events.sessions, 0);
  finishRead(full.ctx.savedPayload);
  await restoring;
  assert.equal(delayedRead.ctx.workoutFinishedRef.current, true);

  assert.ok(checklist.includes("'Workout partially saved' : 'Workout Saved!'"));
  console.log('Workout completion: PASS — reps/seconds/steps payloads, full/partial/unresolved saves, session-exercise resolution, lookup failure, retained drafts, restored outcomes, double-tap, navigation, retry, PR, rep volume, invalid-target blocking, observable write/read/clear failures, storage-only retry, and delayed-read save protection.');
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
