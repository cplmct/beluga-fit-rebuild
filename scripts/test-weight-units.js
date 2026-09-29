const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/utils/weightUnits.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const moduleExports = {};
vm.runInNewContext(compiled, { exports: moduleExports });
const { kgToDisplayWeight, profileWeightForUnit, profileWeightToKg } = moduleExports;

assert.equal(profileWeightForUnit('210', 'lbs', 'kg'), '95.25');
assert.equal(profileWeightForUnit('95.25', 'kg', 'lbs'), '210');
assert.equal(kgToDisplayWeight(95.25, 'lbs'), 210);
assert.equal(kgToDisplayWeight(10, 'kg'), 10);
assert.equal(kgToDisplayWeight(10, 'lbs'), 22);
assert.equal(kgToDisplayWeight(95.25431999999999, 'kg'), 95.25);
assert.equal(kgToDisplayWeight(95, 'kg'), 95);
assert.equal(profileWeightForUnit('95.25431999999999', 'kg', 'kg'), '95.25');
assert.equal(profileWeightForUnit('95.250', 'kg', 'kg'), '95.25');
assert.equal(profileWeightForUnit('95.00', 'kg', 'kg'), '95');
assert.equal(profileWeightForUnit('95.', 'kg', 'kg'), '95.');
assert.equal(profileWeightForUnit('95.0', 'kg', 'kg'), '95.0');
assert.equal(profileWeightForUnit('', 'kg', 'lbs'), '');
assert.equal(profileWeightToKg('', 'lbs'), null);
assert.equal(profileWeightToKg('210', 'lbs'), 210 * 0.453592);
assert.equal(profileWeightToKg('95.25', 'kg'), 95.25);
assert.equal(kgToDisplayWeight(-2, 'lbs'), -4.4);
assert.equal(kgToDisplayWeight(0, 'kg'), 0);

console.log('18 focused weight-unit assertions passed.');
