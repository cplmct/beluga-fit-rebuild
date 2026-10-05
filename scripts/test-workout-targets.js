const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function compile(file, dependencies = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`);
      return dependencies[name];
    },
    Date,
  }, { filename: file });
  return exports;
}

const target = compile('src/utils/workoutTarget.ts');
const {
  parseWorkoutTarget,
  repsTarget,
  restoreWorkoutTarget,
  restoreSavedWorkoutTarget,
  formatWorkoutTargetLabel,
  canSaveWorkoutTargets,
  isMaxRepsPrCandidate,
} = target;

for (const text of ['12', '12 reps']) {
  assert.equal(parseWorkoutTarget(text, 'plan').kind, 'reps', text);
  assert.equal(parseWorkoutTarget(text, 'plan').value, 12);
}
for (const text of ['45 sec', '45 secs', '45 second', '45 seconds']) {
  assert.equal(parseWorkoutTarget(text, 'plan').kind, 'seconds', text);
  assert.equal(parseWorkoutTarget(text, 'plan').value, 45);
}
for (const text of ['20 step', '20 steps']) {
  assert.equal(parseWorkoutTarget(text, 'plan').kind, 'steps', text);
  assert.equal(parseWorkoutTarget(text, 'plan').value, 20);
}
for (const text of ['', ' ', '0', '-2', '1.5', '12abc', '45 sec rest', '20 km', 'abc12', '12 repz']) {
  const parsed = parseWorkoutTarget(text, 'plan');
  assert.equal(parsed.kind, 'unknown', text);
  assert.equal(parsed.raw, text);
  assert.equal(parsed.origin, 'plan');
}
assert.equal(formatWorkoutTargetLabel(parseWorkoutTarget('45 secs', 'plan')), 'Target: 45 seconds');
assert.equal(formatWorkoutTargetLabel(parseWorkoutTarget('20 steps', 'plan')), 'Target: 20 steps');
assert.equal(formatWorkoutTargetLabel(parseWorkoutTarget('12', 'plan')), 'Target: 12 reps');
assert.equal(restoreWorkoutTarget(undefined, 12).kind, 'unknown');
assert.equal(restoreWorkoutTarget(undefined, 12).origin, 'legacy-resume');
assert.equal(restoreWorkoutTarget({ kind: 'seconds', value: 45 }).value, 45);
assert.equal(restoreWorkoutTarget({ kind: 'reps', value: 0 }, 12).kind, 'unknown');
assert.equal(repsTarget(10).kind, 'reps');
assert.equal(isMaxRepsPrCandidate(repsTarget(12), 10), true);
assert.equal(isMaxRepsPrCandidate(repsTarget(10), 10), false);
for (const kind of ['seconds', 'steps', 'unknown']) {
  const item = kind === 'unknown' ? { kind, raw: 'bad', origin: 'plan' } : { kind, value: 45 };
  assert.equal(isMaxRepsPrCandidate(item, 0), false);
  assert.equal(canSaveWorkoutTargets([repsTarget(10), item]), kind !== 'unknown');
}
assert.equal(canSaveWorkoutTargets([repsTarget(10), repsTarget(12)]), true);
for (const kind of ['reps', 'seconds', 'steps']) {
  assert.equal(restoreWorkoutTarget({ kind, value: 45 }).kind, kind);
  assert.equal(restoreWorkoutTarget({ kind, value: 45 }).value, 45);
  assert.equal(canSaveWorkoutTargets([{ kind, value: 2147483647 }]), true);
  for (const value of [0, -1, 1.5, NaN, Infinity, 2147483648, Number.MAX_SAFE_INTEGER]) {
    assert.equal(canSaveWorkoutTargets([{ kind, value }]), false, `${kind}: ${value}`);
  }
  const saved = restoreSavedWorkoutTarget({
    target_kind: kind, target_value: 45, target_raw: null,
  });
  assert.equal(saved.kind, kind);
  assert.equal(saved.value, 45);
  assert.equal(formatWorkoutTargetLabel(saved), `Target: 45 ${kind}`);
}
assert.equal(restoreSavedWorkoutTarget({
  target_kind: null, target_value: null, target_raw: null,
}), null);
assert.equal(restoreSavedWorkoutTarget({}), null); // Older responses have no metadata.
assert.equal(restoreSavedWorkoutTarget({
  target_kind: 'unknown', target_value: null, target_raw: 'unparsed',
}).raw, 'unparsed');
for (const metadata of [
  { target_kind: 'seconds', target_value: null, target_raw: null },
  { target_kind: 'steps', target_value: 2147483648, target_raw: null },
  { target_kind: null, target_value: 12, target_raw: null },
  { target_kind: 'reps', target_value: 12, target_raw: 'invalid' },
]) {
  assert.equal(restoreSavedWorkoutTarget(metadata).kind, 'unknown');
}
// Parsing/restoration remain unchanged; the database boundary rejects oversize values.
assert.equal(parseWorkoutTarget('2147483648 steps', 'plan').kind, 'steps');
assert.equal(canSaveWorkoutTargets([parseWorkoutTarget('2147483648 steps', 'plan')]), false);

const stored = new Map();
const storage = {
  async getItem(key) { return stored.get(key) ?? null; },
  async setItem(key, value) { stored.set(key, value); },
  async removeItem(key) { stored.delete(key); },
};
const session = compile('src/utils/workoutSession.ts', {
  '@react-native-async-storage/async-storage': { __esModule: true, default: storage },
  './workoutTarget': target,
  './accountCleanup': { async readPendingAccountCleanup() { return null; } },
});
const exercise = { name: 'Test', bodyPart: 'Legs', category: 'Strength', equipment: 'None',
  sets: 2, target: { kind: 'steps', value: 20 }, weight: '', selected: true };

async function main() {
  session.setWorkoutSessionOwner('test-user');
  await session.saveWorkoutSession({
    ownerUserId: 'test-user',
    exerciseNames: ['Test'],
    completedSets: { 0: [1] },
    startTime: Date.now(),
    exercises: [exercise],
    bodyParts: ['Legs'],
  });
  let resumed = await session.loadWorkoutSession('test-user');
  assert.equal(resumed.exercises[0].target.kind, 'steps');
  assert.equal(resumed.exercises[0].target.value, 20);
  assert.deepEqual(Array.from(resumed.completedSets['0']), [1]);

  const key = '@beluga_active_workout_v1';
  stored.set(key, JSON.stringify({
    ownerUserId: 'test-user',
    exerciseNames: ['Test'],
    completedSets: { 0: [1] },
    startTime: Date.now(),
    savedAt: Date.now(),
    exercises: [{ ...exercise, reps: 12, target: undefined }],
    bodyParts: ['Legs'],
  }));
  resumed = await session.loadWorkoutSession('test-user');
  assert.equal(resumed.exercises[0].target.kind, 'unknown');
  assert.equal(resumed.exercises[0].target.raw, '12');
  assert.equal(canSaveWorkoutTargets(resumed.exercises.map((ex) => ex.target)), false);

  const checklist = fs.readFileSync(path.join(__dirname, '../src/components/WorkoutChecklistScreen.tsx'), 'utf8');
  const savePath = checklist.slice(checklist.indexOf('const doSaveWorkout = async () =>'));
  const saveGuard = savePath.indexOf('if (!canSaveWorkoutTargets(');
  assert.ok(saveGuard >= 0 && saveGuard < savePath.indexOf(".from('workout_sessions')"));
  assert.ok(saveGuard < savePath.indexOf('setIsSaving(true)'));
  assert.ok(checklist.includes('visible={unsupportedFinishVisible || resolutionFailure !== null}'));
  assert.ok(checklist.includes("resolutionFailure?.title ?? 'Unable to finish workout'"));
  assert.ok(checklist.includes('resolutionFailure?.message ?? UNSUPPORTED_SAVE_MESSAGE'));
  assert.ok(checklist.includes("{resolutionFailure ? 'Keep workout' : 'OK'}"));
  assert.equal((checklist.match(/setUnsupportedFinishVisible\(true\)/g) || []).length, 2);
  assert.ok(checklist.includes('isMaxRepsPrCandidate(target, prRepsMap[exId] || 0)'));
  assert.ok(checklist.includes('formatWorkoutTargetLabel(target)'));
  assert.ok(checklist.includes('Unsupported target formats cannot be saved.'));
  assert.ok(!checklist.includes('Timed and step targets cannot be saved yet.'));
  assert.ok(!checklist.includes('.toLowerCase()')); // Exercise-name lookups stay exact.
  assert.ok(checklist.includes('delete next[String(swapIndex)]'));

  const editor = fs.readFileSync(path.join(__dirname, '../src/components/EditExerciseModal.tsx'), 'utf8');
  assert.ok(editor.includes("setTargetStr('')")); // Changing kind requires explicit value entry.
  assert.ok(editor.includes("setTargetStr(v)")); // Value editing does not change kind.
  const details = fs.readFileSync(path.join(__dirname, '../src/components/WorkoutDetailsScreen.tsx'), 'utf8');
  assert.ok(details.includes("firstSet?.reps ?? null"));
  assert.ok(!details.includes('firstSet?.reps ?? 0'));
  assert.ok(checklist.includes("firstSet?.reps ?? null"));
  const exerciseDetails = fs.readFileSync(path.join(__dirname, '../src/components/ExerciseDetailScreen.tsx'), 'utf8');
  for (const reader of [details, exerciseDetails, checklist]) {
    assert.ok(reader.includes('target_kind, target_value, target_raw'));
    assert.ok(reader.includes('restoreSavedWorkoutTarget'));
  }
  assert.ok(details.includes('Planned target'));
  assert.ok(exerciseDetails.includes('Planned target'));
  console.log('Workout targets: parsing, resume, integer bounds, saved-target restoration, supported saves, PR, and legacy-reader checks passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
