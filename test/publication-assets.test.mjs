import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {workshopImageCopyAsset} from '../docs/vivliostyle.workshop.config.mjs';
import {
  createSelectiveImageCopyAsset,
  organizePublicationAssets,
  publicationImageExtensions,
} from '../scripts/publication-assets.mjs';

async function withTemporaryDirectory(callback) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'tmpose-docs-assets-'));
  try {
    await callback(directory);
  } finally {
    await rm(directory, {recursive: true, force: true});
  }
}

test('copies only image assets referenced by a publication', async () => {
  await withTemporaryDirectory(async (directory) => {
    const sourcePath = path.join(directory, 'guides/guide.md');
    await mkdir(path.dirname(sourcePath), {recursive: true});
    await writeFile(
      sourcePath,
      `
![Used](../images/used.png)
<img src="../images/vector.svg?revision=1">
![Remote](https://example.com/remote.png)
[Other guide](other.md)
`,
    );

    const copyAsset = createSelectiveImageCopyAsset({
      rootDirectory: directory,
      sourcePaths: [sourcePath],
      additionalAssetPaths: ['images/cover.jpg', 'files/notes.txt'],
    });

    assert.deepEqual(copyAsset, {
      includes: ['images/cover.jpg', 'images/used.png', 'images/vector.svg'],
      excludeFileExtensions: publicationImageExtensions,
    });
  });
});

test('keeps workshop images referenced by its sources without copying unrelated captures', () => {
  assert.ok(workshopImageCopyAsset.includes.includes('images/image09.png'));
  assert.ok(workshopImageCopyAsset.includes.includes('images/image01.png'));
  assert.ok(!workshopImageCopyAsset.includes.includes('images/extension-editor-consoles.png'));
  assert.deepEqual(workshopImageCopyAsset.excludeFileExtensions, publicationImageExtensions);
});

test('extracts shared assets and keeps publication-specific images local', async () => {
  await withTemporaryDirectory(async (directory) => {
    const sourceRoot = path.join(directory, 'docs');
    const outputRoot = path.join(directory, 'dist');
    await Promise.all([
      mkdir(path.join(sourceRoot, 'guides'), {recursive: true}),
      mkdir(path.join(sourceRoot, 'images'), {recursive: true}),
      mkdir(path.join(sourceRoot, 'fonts'), {recursive: true}),
      mkdir(path.join(outputRoot, 'group/a/images'), {recursive: true}),
      mkdir(path.join(outputRoot, 'group/a/fonts'), {recursive: true}),
      mkdir(path.join(outputRoot, 'group/b/images'), {recursive: true}),
      mkdir(path.join(outputRoot, 'group/b/fonts'), {recursive: true}),
    ]);
    await Promise.all([
      writeFile(
        path.join(sourceRoot, 'guides/a.md'),
        '![Shared](../images/shared.png)\n![Only A](../images/only-a.png)\n',
      ),
      writeFile(path.join(sourceRoot, 'guides/b.md'), '![Shared](../images/shared.png)\n'),
      writeFile(path.join(sourceRoot, 'images/shared.png'), 'shared-image'),
      writeFile(path.join(sourceRoot, 'images/only-a.png'), 'only-a-image'),
      writeFile(path.join(sourceRoot, 'fonts/shared.ttf'), 'shared-font'),
      writeFile(path.join(sourceRoot, 'theme.css'), 'src: url("fonts/shared.ttf");\n'),
      writeFile(path.join(outputRoot, 'group/a/images/shared.png'), 'shared-image'),
      writeFile(path.join(outputRoot, 'group/a/images/only-a.png'), 'only-a-image'),
      writeFile(path.join(outputRoot, 'group/a/images/unused.png'), 'unused-image'),
      writeFile(path.join(outputRoot, 'group/b/images/shared.png'), 'shared-image'),
      writeFile(path.join(outputRoot, 'group/a/fonts/shared.ttf'), 'shared-font'),
      writeFile(path.join(outputRoot, 'group/b/fonts/shared.ttf'), 'shared-font'),
      writeFile(path.join(outputRoot, 'group/a/theme.css'), 'src: url("fonts/shared.ttf");\n'),
      writeFile(path.join(outputRoot, 'group/b/theme.css'), 'src: url("fonts/shared.ttf");\n'),
      writeFile(
        path.join(outputRoot, 'group/a/index.html'),
        '<img src="images/shared.png"><img src="images/only-a.png">',
      ),
      writeFile(
        path.join(outputRoot, 'group/a/publication.json'),
        '{"resources":["images/shared.png","images/only-a.png"]}\n',
      ),
      writeFile(path.join(outputRoot, 'group/b/index.html'), '<img src="images/shared.png">'),
      writeFile(
        path.join(outputRoot, 'group/b/publication.json'),
        '{"resources":["images/shared.png"]}\n',
      ),
    ]);

    const result = await organizePublicationAssets({
      sourceRoot,
      outputRoot,
      publications: [
        {outputDirectory: 'group/a', sourcePaths: ['guides/a.md', 'theme.css']},
        {outputDirectory: 'group/b', sourcePaths: ['guides/b.md', 'theme.css']},
      ],
    });

    assert.deepEqual(result, {
      publicationCount: 2,
      referencedAssetCount: 3,
      sharedAssetCount: 2,
      publicationSpecificAssetCount: 1,
      referencedImageCount: 2,
      sharedImageCount: 1,
      referencedFontCount: 1,
      sharedFontCount: 1,
      selectiveAssetBytes: 58,
      organizedAssetBytes: 35,
      sharedAssetSavings: 23,
    });
    assert.ok(existsSync(path.join(outputRoot, 'assets/images/shared.png')));
    assert.ok(existsSync(path.join(outputRoot, 'assets/fonts/shared.ttf')));
    assert.ok(existsSync(path.join(outputRoot, 'group/a/images/only-a.png')));
    assert.ok(!existsSync(path.join(outputRoot, 'group/a/images/shared.png')));
    assert.ok(!existsSync(path.join(outputRoot, 'group/a/images/unused.png')));
    assert.ok(!existsSync(path.join(outputRoot, 'group/b/images')));
    assert.ok(!existsSync(path.join(outputRoot, 'group/a/fonts')));
    assert.ok(!existsSync(path.join(outputRoot, 'group/b/fonts')));
    assert.match(
      await readFile(path.join(outputRoot, 'group/a/index.html'), 'utf8'),
      /\.\.\/\.\.\/assets\/images\/shared\.png/u,
    );
    assert.match(
      await readFile(path.join(outputRoot, 'group/a/publication.json'), 'utf8'),
      /\.\.\/\.\.\/assets\/images\/shared\.png/u,
    );
    assert.match(
      await readFile(path.join(outputRoot, 'group/a/theme.css'), 'utf8'),
      /\.\.\/\.\.\/assets\/fonts\/shared\.ttf/u,
    );

    await organizePublicationAssets({
      sourceRoot,
      outputRoot,
      publications: [
        {outputDirectory: 'group/a', sourcePaths: ['guides/a.md', 'theme.css']},
        {outputDirectory: 'group/b', sourcePaths: ['guides/b.md', 'theme.css']},
      ],
    });
    const rebuiltHtml = await readFile(path.join(outputRoot, 'group/a/index.html'), 'utf8');
    assert.equal((rebuiltHtml.match(/assets\/images\/shared\.png/gu) ?? []).length, 1);
    assert.doesNotMatch(rebuiltHtml, /assets\/\.\.\/\.\.\/assets/u);
  });
});
