/* Synthetic JS/prebuild fixtures. No Android build, preference writes or SDK/network calls. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { spawnSync } = require('node:child_process');
const plugin = require('../plugins/withGdprApplicability');
const { buildAdvertisingConfig } = require('../config/advertising');

function reader(nativeModules) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(
    fs.readFileSync('src/advertising/gdprApplicability.android.ts', 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, { exports, require(name) {
    assert.equal(name, 'react-native');
    return { NativeModules: nativeModules };
  } });
  return exports.readGdprApplicability;
}

async function main() {
  for (const value of ['missing', 'not-applicable', 'applicable', 'invalid']) {
    let calls = 0;
    assert.equal(await reader({ BelugaGdprApplicability: {
      async readGdprApplicability(...args) { calls++; assert.equal(args.length, 0); return value; },
    } })(), value);
    assert.equal(calls, 1);
  }
  for (const value of [undefined, null, true, false, 0, 1, '0', '1', 'sensitive']) {
    assert.equal(await reader({ BelugaGdprApplicability: {
      async readGdprApplicability() { return value; },
    } })(), 'invalid');
  }
  for (const modules of [{}, { BelugaGdprApplicability: {} },
    Object.defineProperty({}, 'BelugaGdprApplicability', { get() { throw Error('secret'); } })]) {
    await assert.rejects(reader(modules)(), error => error.code === 'applicability-unavailable'
      && !String(error).includes('secret'));
  }
  await assert.rejects(reader({ BelugaGdprApplicability: {
    async readGdprApplicability() { throw { code: 'secret', message: 'secret' }; },
  } })(), error => error.code === 'applicability-read-failed' && !String(error).includes('secret'));

  // Exact package-list statements from the Expo SDK 53 MainApplication.kt template.
  const fixture = `class MainApplication {
    override fun getPackages(): List<ReactPackage> {
      val packages = PackageList(this).packages
      // Packages that cannot be autolinked yet can be added manually here
      return packages
    }
  }`;
  const registered = plugin.register(fixture, 'kt');
  assert.equal(plugin.register(registered, 'kt'), registered, 'Idempotent registration');
  assert.equal((registered.match(/packages.add\(com.belugafit/g) || []).length, 1);
  assert(registered.indexOf('BelugaGdprApplicabilityPackage') < registered.indexOf('return packages'));
  assert.throws(() => plugin.register(fixture, 'java'));
  assert.throws(() => plugin.register('unreviewed template', 'kt'));
  assert.throws(() => plugin.register(fixture + fixture, 'kt'));
  const cfg = { extra: { belugaAdvertising: buildAdvertisingConfig('public-ad-flow-test', 'public-flow-test') } };
  assert(plugin.enabled(cfg));
  const eeaCfg = { extra: { belugaAdvertising: buildAdvertisingConfig('consent-eea-test', 'public-flow-test') } };
  assert(plugin.enabled(eeaCfg));
  const prodCfg = { extra: { belugaAdvertising: buildAdvertisingConfig('production-advertising', 'production-tcf') } };
  assert(plugin.enabled(prodCfg));
  const prodRegistered = plugin(structuredClone(prodCfg));
  assert.equal(typeof prodRegistered.mods.android.mainApplication, 'function');
  assert.equal(typeof prodRegistered.mods.android.dangerous, 'function');
  assert(!plugin.enabled({ extra: { belugaAdvertising: {
    ...prodCfg.extra.belugaAdvertising, audienceApproved: false,
  } } }));
  const eeaRegistered = plugin(structuredClone(eeaCfg));
  assert.equal(typeof eeaRegistered.mods.android.mainApplication, 'function');
  assert.equal(typeof eeaRegistered.mods.android.dangerous, 'function');
  assert(!plugin.enabled({ extra: { belugaAdvertising: {
    ...eeaCfg.extra.belugaAdvertising, appId: 'not-the-approved-app',
  } } }));
  const registeredConfig = plugin(structuredClone(cfg));
  assert.equal(typeof registeredConfig.mods.android.mainApplication, 'function');
  assert.equal(typeof registeredConfig.mods.android.dangerous, 'function');
  for (const [profile, mode] of [['preview', 'test'], ['production', 'disabled'],
    ['internal-ad-rendering', 'internal-test']]) {
    const off = { extra: { belugaAdvertising: buildAdvertisingConfig(profile, mode) } };
    assert(!plugin.enabled(off));
    assert.equal(plugin(off), off, 'No registration mods in other profiles');
  }
  assert.throws(() => plugin({ extra: { belugaAdvertising: {
    ...cfg.extra.belugaAdvertising, appId: 'not-a-sample',
  } } }));

  // Execute both real plugin callbacks in an isolated synthetic Android project.
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'beluga-applicability-'));
  try {
    const request = { projectRoot: process.cwd(), platformProjectRoot: temp, platform: 'android' };
    // Callback wiring is tested directly below; no Expo prebuild or Gradle runs.
    const file = 'native/advertising/BelugaGdprApplicabilityModule.java';
    const source = fs.readFileSync(file, 'utf8');
    assert.equal((source.match(/@ReactMethod/g) || []).length, 1);
    assert(source.includes('getApplicationContext()).getAll()'));
    assert(!/\.(?:edit|putInt|putString|remove|clear)\(/.test(source));
    // A config-plugin mod delegates to nextMod; supply an identity base provider.
    const mainResult = await registeredConfig.mods.android.mainApplication({
      ...cfg, modRequest: { ...request, nextMod: async v => v },
      modResults: { language: 'kt', contents: fixture },
    });
    assert.equal(mainResult.modResults.contents, registered);
    await registeredConfig.mods.android.dangerous({
      ...cfg, modRequest: { ...request, nextMod: async v => v }, modResults: {},
    });
    const copied = path.join(temp, 'app/src/main/java/com/belugafit/advertising');
    const names = fs.readdirSync(copied).sort();
    assert.deepEqual(names, ['BelugaGdprApplicabilityModule.java',
      'BelugaGdprApplicabilityPackage.java', 'GdprApplicabilityReader.java']);
    for (const name of names) assert.equal(fs.readFileSync(path.join(copied, name), 'utf8'),
      fs.readFileSync(path.join('native/advertising', name), 'utf8'));
    assert(!names.some(name => /Test/.test(name)), 'No native fixture copied');

    if (process.argv.includes('--native-fixtures')) {
      const javac = spawnSync('javac', ['-d', temp,
        'native/advertising/GdprApplicabilityReader.java',
        'scripts/native-tests/GdprApplicabilityReaderTest.java'], { encoding: 'utf8' });
      if (javac.error || javac.status !== 0) throw Error('Java fixtures NOT run: JDK required, or compilation failed.');
      const java = spawnSync('java', ['-cp', temp, 'com.belugafit.advertising.GdprApplicabilityReaderTest'],
        { encoding: 'utf8' });
      if (java.error || java.status !== 0) throw Error('Java fixtures failed.');
      console.log(java.stdout.trim());
    } else console.log('NOT RUN: Java fixtures (use --native-fixtures with a JDK); Android compilation/interop/device checks.');
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
  console.log('PASS: wrapper sanitation, four states, unavailable module, profile isolation and synthetic prebuild registration/copy fixtures.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
