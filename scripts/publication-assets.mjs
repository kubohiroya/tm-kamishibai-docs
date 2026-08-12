import {readFileSync} from 'node:fs';
import {readFile, readdir, rm, rmdir, stat} from 'node:fs/promises';
import path from 'node:path';

import {copyFileIfStale, referencedLocalAssets, writeFileIfChanged} from './build-freshness.mjs';

export const publicationImageExtensions = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'apng'];
export const publicationFontExtensions = ['ttf', 'otf', 'woff', 'woff2'];

const publicationImageExtensionSet = new Set(publicationImageExtensions);
const publicationFontExtensionSet = new Set(publicationFontExtensions);
const publicationAssetExtensionSet = new Set([
  ...publicationImageExtensions,
  ...publicationFontExtensions,
]);

function resolveFromRoot(rootDirectory, targetPath) {
  return path.isAbsolute(targetPath) ? targetPath : path.resolve(rootDirectory, targetPath);
}

function toAssetPattern(rootDirectory, assetPath) {
  const relativePath = path.relative(rootDirectory, assetPath);
  if (
    relativePath === '' ||
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`${assetPath} must be inside ${rootDirectory}.`);
  }
  return relativePath.split(path.sep).join('/');
}

function isPublicationImage(assetPath) {
  return publicationImageExtensionSet.has(path.extname(assetPath).slice(1).toLowerCase());
}

function isPublicationFont(assetPath) {
  return publicationFontExtensionSet.has(path.extname(assetPath).slice(1).toLowerCase());
}

function isPublicationAsset(assetPath) {
  return publicationAssetExtensionSet.has(path.extname(assetPath).slice(1).toLowerCase());
}

function collectPublicationAssetsByType({
  rootDirectory,
  sourcePaths,
  additionalAssetPaths = [],
  predicate,
}) {
  const assets = new Set(
    additionalAssetPaths.map((assetPath) => resolveFromRoot(rootDirectory, assetPath)),
  );

  for (const sourcePath of sourcePaths.map((entry) => resolveFromRoot(rootDirectory, entry))) {
    const source = readFileSync(sourcePath, 'utf8');
    for (const assetPath of referencedLocalAssets(source, sourcePath)) {
      if (predicate(assetPath)) assets.add(assetPath);
    }
  }

  return [...assets]
    .filter(predicate)
    .map((assetPath) => toAssetPattern(rootDirectory, assetPath))
    .sort();
}

export function collectPublicationImageAssets(options) {
  return collectPublicationAssetsByType({...options, predicate: isPublicationImage});
}

export function collectPublicationAssets(options) {
  return collectPublicationAssetsByType({...options, predicate: isPublicationAsset});
}

export function createSelectiveImageCopyAsset(options) {
  return {
    includes: collectPublicationImageAssets(options),
    excludeFileExtensions: [...publicationImageExtensions],
  };
}

/**
 * @param {string} directory
 * @param {(filePath: string) => boolean} [predicate]
 */
async function findFiles(directory, predicate = () => true) {
  try {
    const entries = await readdir(directory, {withFileTypes: true});
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return findFiles(entryPath, predicate);
        return entry.isFile() && predicate(entryPath) ? [entryPath] : [];
      }),
    );
    return nested.flat();
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

async function removeEmptyDirectories(directory) {
  try {
    const entries = await readdir(directory, {withFileTypes: true});
    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => removeEmptyDirectories(path.join(directory, entry.name))),
    );
    if ((await readdir(directory)).length === 0) await rmdir(directory);
  } catch (error) {
    if (error?.code !== 'ENOENT' && error?.code !== 'ENOTEMPTY') throw error;
  }
}

function asReference(fromDirectory, targetPath) {
  const reference = path.relative(fromDirectory, targetPath).split(path.sep).join('/');
  return reference === '' ? '.' : reference;
}

function referenceCandidates(reference) {
  const candidates = new Set([reference, encodeURI(reference)]);
  if (!reference.startsWith('.')) {
    candidates.add(`./${reference}`);
    candidates.add(`./${encodeURI(reference)}`);
  }
  return candidates;
}

async function rewritePublicationReferences({
  publicationDirectory,
  sharedRoot,
  assets,
  sharedAssets,
}) {
  const textFiles = await findFiles(publicationDirectory, (filePath) =>
    ['.html', '.css', '.json'].includes(path.extname(filePath).toLowerCase()),
  );

  for (const textFile of textFiles) {
    const textDirectory = path.dirname(textFile);
    let source = await readFile(textFile, 'utf8');
    for (const [assetIndex, asset] of assets.entries()) {
      const localPath = path.join(publicationDirectory, asset);
      const sharedPath = path.join(sharedRoot, asset);
      const localReference = asReference(textDirectory, localPath);
      const sharedReference = asReference(textDirectory, sharedPath);
      const targetReference = sharedAssets.has(asset) ? sharedReference : localReference;
      const placeholder = `__PUBLICATION_ASSET_${assetIndex}__`;
      const candidates = [
        ...new Set([
          ...referenceCandidates(localReference),
          ...referenceCandidates(sharedReference),
        ]),
      ].sort((left, right) => right.length - left.length);
      for (const candidate of candidates) {
        source = source.replaceAll(candidate, placeholder);
      }
      source = source.replaceAll(placeholder, targetReference);
    }
    await writeFileIfChanged(textFile, source);
  }
}

export async function organizePublicationAssets({
  sourceRoot,
  outputRoot,
  publications,
  sharedOutputDirectory = 'assets',
}) {
  const plans = publications.map((publication) => ({
    ...publication,
    directory: path.resolve(outputRoot, publication.outputDirectory),
    assets: collectPublicationAssets({
      rootDirectory: sourceRoot,
      sourcePaths: publication.sourcePaths,
      additionalAssetPaths: publication.additionalAssetPaths,
    }),
  }));
  const usages = new Map();
  for (const plan of plans) {
    for (const asset of plan.assets) {
      if (!usages.has(asset)) usages.set(asset, []);
      usages.get(asset).push(plan);
    }
  }

  const sharedAssets = new Set(
    [...usages].filter(([, assetPlans]) => assetPlans.length >= 2).map(([asset]) => asset),
  );
  const sharedRoot = path.resolve(outputRoot, sharedOutputDirectory);
  for (const existingAsset of await findFiles(sharedRoot, isPublicationAsset)) {
    const asset = path.relative(sharedRoot, existingAsset).split(path.sep).join('/');
    if (!sharedAssets.has(asset)) await rm(existingAsset);
  }

  for (const asset of sharedAssets) {
    const destination = path.join(sharedRoot, asset);
    await copyFileIfStale(path.join(sourceRoot, asset), destination);
  }

  for (const plan of plans) {
    const expectedAssets = new Set(plan.assets);
    const localAssetRoots = ['images', 'fonts'].map((directory) =>
      path.join(plan.directory, directory),
    );
    for (const localAssetRoot of localAssetRoots) {
      for (const existingAsset of await findFiles(localAssetRoot, isPublicationAsset)) {
        const asset = path.relative(plan.directory, existingAsset).split(path.sep).join('/');
        if (!expectedAssets.has(asset) || sharedAssets.has(asset)) {
          await rm(existingAsset);
        }
      }
    }
    for (const asset of plan.assets) {
      if (sharedAssets.has(asset)) continue;
      const destination = path.join(plan.directory, asset);
      await copyFileIfStale(path.join(sourceRoot, asset), destination);
    }
    await rewritePublicationReferences({
      publicationDirectory: plan.directory,
      sharedRoot,
      assets: plan.assets,
      sharedAssets,
    });
    await Promise.all(localAssetRoots.map(removeEmptyDirectories));
  }
  await removeEmptyDirectories(sharedRoot);

  let selectiveAssetBytes = 0;
  let organizedAssetBytes = 0;
  for (const [asset, assetPlans] of usages) {
    const assetBytes = (await stat(path.join(sourceRoot, asset))).size;
    selectiveAssetBytes += assetBytes * assetPlans.length;
    organizedAssetBytes += assetBytes;
  }

  const images = [...usages.keys()].filter(isPublicationImage);
  const fonts = [...usages.keys()].filter(isPublicationFont);

  return {
    publicationCount: plans.length,
    referencedAssetCount: usages.size,
    sharedAssetCount: sharedAssets.size,
    publicationSpecificAssetCount: usages.size - sharedAssets.size,
    referencedImageCount: images.length,
    sharedImageCount: images.filter((image) => sharedAssets.has(image)).length,
    referencedFontCount: fonts.length,
    sharedFontCount: fonts.filter((font) => sharedAssets.has(font)).length,
    selectiveAssetBytes,
    organizedAssetBytes,
    sharedAssetSavings: selectiveAssetBytes - organizedAssetBytes,
  };
}
