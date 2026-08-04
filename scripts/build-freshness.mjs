import {readFile, readdir, stat} from 'node:fs/promises';
import path from 'node:path';

function isLocalReference(reference) {
  return (
    reference !== '' &&
    !reference.startsWith('#') &&
    !reference.startsWith('/') &&
    !/^[a-z][a-z0-9+.-]*:/iu.test(reference)
  );
}

function withoutQueryOrFragment(reference) {
  return reference.split(/[?#]/u, 1)[0];
}

export function referencedLocalAssets(source, sourcePath) {
  const references = [];
  const addReference = (rawReference) => {
    const reference = withoutQueryOrFragment(rawReference.trim());
    if (!isLocalReference(reference)) return;
    references.push(path.resolve(path.dirname(sourcePath), decodeURIComponent(reference)));
  };

  for (const match of source.matchAll(/!\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))/gu)) {
    addReference(match[1] ?? match[2]);
  }
  const imageReferenceLabels = new Set(
    [...source.matchAll(/!\[[^\]]*\]\[([^\]]+)\]/gu)].map((match) =>
      match[1].trim().replace(/\s+/gu, ' ').toLowerCase(),
    ),
  );
  for (const match of source.matchAll(/^\s{0,3}\[([^\]]+)\]:\s*(?:<([^>]+)>|(\S+))/gmu)) {
    const label = match[1].trim().replace(/\s+/gu, ' ').toLowerCase();
    if (imageReferenceLabels.has(label)) addReference(match[2] ?? match[3]);
  }
  for (const match of source.matchAll(/\bsrc=(['"])(.*?)\1/giu)) {
    addReference(match[2]);
  }
  for (const match of source.matchAll(/\burl\(\s*(['"]?)(.*?)\1\s*\)/giu)) {
    addReference(match[2]);
  }

  return [...new Set(references)].sort();
}

export async function collectSourceInputs(sourcePaths) {
  const inputs = new Set(sourcePaths);
  for (const sourcePath of sourcePaths) {
    const source = await readFile(sourcePath, 'utf8');
    for (const assetPath of referencedLocalAssets(source, sourcePath)) inputs.add(assetPath);
  }
  return [...inputs];
}

async function newestMtimeMs(inputPath) {
  const inputStat = await stat(inputPath);
  if (!inputStat.isDirectory()) return inputStat.mtimeMs;

  const entries = await readdir(inputPath);
  const nestedMtimes = await Promise.all(
    entries.map((entry) => newestMtimeMs(path.join(inputPath, entry))),
  );
  return Math.max(inputStat.mtimeMs, ...nestedMtimes);
}

function includesExpectedBuildInfo(actual, expected) {
  return Object.entries(expected).every(([key, value]) => Object.is(actual[key], value));
}

export async function isBuildCurrent({inputs, markerPath, outputs, expectedBuildInfo = {}}) {
  try {
    const [markerStat, markerSource, ...outputStats] = await Promise.all([
      stat(markerPath),
      readFile(markerPath, 'utf8'),
      ...outputs.map((outputPath) => stat(outputPath)),
    ]);
    const buildInfo = JSON.parse(markerSource);
    if (!includesExpectedBuildInfo(buildInfo, expectedBuildInfo)) return false;

    const inputMtimes = await Promise.all(inputs.map(newestMtimeMs));
    const newestInputMtime = Math.max(...inputMtimes);
    const oldestOutputMtime = Math.min(
      markerStat.mtimeMs,
      ...outputStats.map((outputStat) => outputStat.mtimeMs),
    );
    return newestInputMtime <= oldestOutputMtime;
  } catch (error) {
    if (error?.code === 'ENOENT' || error instanceof SyntaxError) return false;
    throw error;
  }
}
