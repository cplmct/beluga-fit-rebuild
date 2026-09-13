/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const exerciseSource = fs.readFileSync(path.join(ROOT, 'src/data/exercises.ts'), 'utf8');
const guidanceSource = fs.readFileSync(path.join(ROOT, 'src/data/exerciseGuidance.ts'), 'utf8');

function unescapeKey(value) {
  return value.replace(/\\(['"])/g, '$1');
}

function objectKeys(source) {
  const keys = [];
  for (const line of source.split('\n')) {
    const match = line.match(/^\s*(?:'((?:\\.|[^'])*)'|"((?:\\.|[^"])*)")\s*:/);
    if (match) keys.push(unescapeKey(match[1] ?? match[2]));
  }
  return keys;
}

function sectionBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  return source.slice(start, end < 0 ? source.length : end);
}

function sameIgnoringCase(left, right) {
  return left.localeCompare(right, undefined, { sensitivity: 'accent' }) === 0;
}

const canonicalNames = [...exerciseSource.matchAll(/name:\s*'((?:\\.|[^'])*)'/g)]
  .map((match) => unescapeKey(match[1]));
const canonicalUnique = [...new Set(canonicalNames)];
const catalogCounts = new Map();
for (const name of canonicalNames) catalogCounts.set(name, (catalogCounts.get(name) ?? 0) + 1);
const catalogDuplicates = [...catalogCounts.entries()].filter(([, count]) => count > 1);
const intentionalShared = new Set(['Pike Push-ups', 'Diamond Push-ups', 'Muscle-ups', 'Wall Walk']);
const unexpectedCatalogDuplicates = catalogDuplicates.filter(([name]) => !intentionalShared.has(name));

const copySection = sectionBetween(guidanceSource, 'const GUIDANCE_COPY', 'const IMAGE_SOURCES');
const guidanceNames = objectKeys(copySection);
const guidanceCounts = new Map();
for (const name of guidanceNames) guidanceCounts.set(name, (guidanceCounts.get(name) ?? 0) + 1);
const duplicateGuidanceDeclarations = [...guidanceCounts.entries()].filter(([, count]) => count > 1);
const canonicalSet = new Set(canonicalUnique);
const guidanceSet = new Set(guidanceNames);
const missingGuidance = canonicalUnique.filter((name) => !guidanceSet.has(name));
const staleGuidance = guidanceNames.filter((name) => !canonicalSet.has(name));
const caseMismatchedGuidance = guidanceNames.filter(
  (name) => !canonicalSet.has(name) && canonicalUnique.some((canonical) => sameIgnoringCase(name, canonical)),
);

const imageSection = sectionBetween(guidanceSource, 'const IMAGE_SOURCES', 'export const EXERCISE_GUIDANCE');
const imageNames = objectKeys(imageSection);
const imageSet = new Set(imageNames);
const staleImageKeys = imageNames.filter((name) => !canonicalSet.has(name));
const caseMismatchedImageKeys = imageNames.filter(
  (name) => !canonicalSet.has(name) && canonicalUnique.some((canonical) => sameIgnoringCase(name, canonical)),
);

const dynamicRequirePattern = /require\s*\(\s*(?!['"])/g;
const dynamicRequires = guidanceSource.match(dynamicRequirePattern) ?? [];
const literalRequires = [...guidanceSource.matchAll(/require\s*\(\s*(['"])(.*?)\1\s*\)/g)]
  .map((match) => match[2]);
const missingAssets = literalRequires.filter((assetPath) => {
  const absolutePath = path.resolve(path.dirname(path.join(ROOT, 'src/data/exerciseGuidance.ts')), assetPath);
  return !fs.existsSync(absolutePath);
});
const jpgReferences = guidanceSource.match(/assets\/guidance\/[^'")\s]+\.jpe?g\b/gi) ?? [];

const imageLines = imageSection.split('\n');
const startImages = imageLines.filter((line) => /\bstart:\s*require\(/.test(line)).length;
const finishImages = imageLines.filter((line) => /\bfinish:\s*require\(/.test(line)).length;
const fullyTextOnly = canonicalUnique.filter((name) => !imageSet.has(name));
const phaseTextOnly = canonicalUnique.filter((name) => {
  const line = imageLines.find((candidate) => candidate.includes(`'${name}':`) || candidate.includes(`"${name}":`));
  return !line || !/\bstart:\s*require\(/.test(line) || !/\bfinish:\s*require\(/.test(line);
});

const failures = [];
if (canonicalUnique.length !== 112) failures.push(`expected 112 canonical unique exercises, found ${canonicalUnique.length}`);
if (guidanceNames.length !== 112) failures.push(`expected 112 GUIDANCE_COPY entries, found ${guidanceNames.length}`);
if (unexpectedCatalogDuplicates.length) failures.push(`unexpected catalog duplicates: ${unexpectedCatalogDuplicates.map(([name]) => name).join(', ')}`);
if (duplicateGuidanceDeclarations.length) failures.push(`duplicate GUIDANCE_COPY declarations: ${duplicateGuidanceDeclarations.map(([name]) => name).join(', ')}`);
if (missingGuidance.length) failures.push(`missing guidance keys: ${missingGuidance.join(', ')}`);
if (staleGuidance.length) failures.push(`stale guidance keys: ${staleGuidance.join(', ')}`);
if (caseMismatchedGuidance.length) failures.push(`case-mismatched guidance keys: ${caseMismatchedGuidance.join(', ')}`);
if (staleImageKeys.length) failures.push(`stale IMAGE_SOURCES keys: ${staleImageKeys.join(', ')}`);
if (caseMismatchedImageKeys.length) failures.push(`case-mismatched IMAGE_SOURCES keys: ${caseMismatchedImageKeys.join(', ')}`);
if (dynamicRequires.length) failures.push('dynamic require() calls found');
if (missingAssets.length) failures.push(`missing image assets: ${missingAssets.join(', ')}`);
if (jpgReferences.length) failures.push(`JPG guidance references found: ${jpgReferences.join(', ')}`);

console.log(`Canonical entries: ${canonicalUnique.length}`);
console.log(`Catalog occurrences: ${canonicalNames.length}`);
console.log(`Intentional shared names: ${catalogDuplicates.filter(([name]) => intentionalShared.has(name)).map(([name, count]) => `${name} (${count})`).join(', ') || 'none'}`);
console.log(`Guidance entries: ${guidanceNames.length}`);
console.log(`Start images: ${startImages}`);
console.log(`Finish images: ${finishImages}`);
console.log(`Fully text-only fallbacks: ${fullyTextOnly.length}`);
console.log(`Entries with a text-only phase: ${phaseTextOnly.length}`);
console.log(`Literal image requires: ${literalRequires.length}`);

if (failures.length) {
  console.error(`Guidance validation failed:\\n- ${failures.join('\\n- ')}`);
  process.exitCode = 1;
} else {
  console.log('Guidance validation passed.');
}