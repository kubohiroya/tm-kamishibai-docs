import assert from 'node:assert/strict';
import {mkdir, mkdtemp, rm, utimes, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  collectSourceInputs,
  isBuildCurrent,
  referencedLocalAssets,
} from '../scripts/build-freshness.mjs';

async function withTemporaryDirectory(callback) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'tmpose-docs-build-'));
  try {
    await callback(directory);
  } finally {
    await rm(directory, {recursive: true, force: true});
  }
}

test('collects local image dependencies without following document links', async () => {
  await withTemporaryDirectory(async (directory) => {
    const sourcePath = path.join(directory, 'guides/guide.md');
    await mkdir(path.dirname(sourcePath), {recursive: true});
    const source = `
![PNG](../images/example.png)
<img src="../images/example.svg?version=1">
![][Venue Map]
[venue map]: <../images/venue.png>
![Remote](https://example.com/image.png)
[Other guide](other.md)
`;
    await writeFile(sourcePath, source);

    const expected = [
      path.join(directory, 'images/example.png'),
      path.join(directory, 'images/example.svg'),
      path.join(directory, 'images/venue.png'),
    ];
    assert.deepEqual(referencedLocalAssets(source, sourcePath), expected);
    assert.deepEqual(await collectSourceInputs([sourcePath]), [sourcePath, ...expected]);
  });
});

test('compares input timestamps with a completed build marker', async () => {
  await withTemporaryDirectory(async (directory) => {
    const inputPath = path.join(directory, 'source.md');
    const markerPath = path.join(directory, 'build-info.json');
    const outputPath = path.join(directory, 'document.pdf');
    await Promise.all([
      writeFile(inputPath, '# Source\n'),
      writeFile(markerPath, '{"learnedThroughGrade":3}\n'),
      writeFile(outputPath, 'PDF'),
    ]);
    await utimes(inputPath, new Date(1_000), new Date(1_000));
    await utimes(markerPath, new Date(2_000), new Date(2_000));
    await utimes(outputPath, new Date(2_000), new Date(2_000));

    const build = {
      inputs: [inputPath],
      markerPath,
      outputs: [outputPath],
      expectedBuildInfo: {learnedThroughGrade: 3},
    };
    assert.equal(await isBuildCurrent(build), true);
    assert.equal(
      await isBuildCurrent({...build, expectedBuildInfo: {learnedThroughGrade: 4}}),
      false,
    );

    await utimes(inputPath, new Date(3_000), new Date(3_000));
    assert.equal(await isBuildCurrent(build), false);
    await utimes(inputPath, new Date(1_000), new Date(1_000));
    await utimes(outputPath, new Date(500), new Date(500));
    assert.equal(await isBuildCurrent(build), false);
    assert.equal(
      await isBuildCurrent({...build, outputs: [path.join(directory, 'missing.pdf')]}),
      false,
    );
  });
});

test('detects newer files inside a shared input directory', async () => {
  await withTemporaryDirectory(async (directory) => {
    const inputDirectory = path.join(directory, 'fonts');
    const inputPath = path.join(inputDirectory, 'font.ttf');
    const markerPath = path.join(directory, 'build-info.json');
    const outputPath = path.join(directory, 'document.pdf');
    await mkdir(inputDirectory);
    await Promise.all([
      writeFile(inputPath, 'font'),
      writeFile(markerPath, '{}\n'),
      writeFile(outputPath, 'PDF'),
    ]);
    await utimes(inputPath, new Date(3_000), new Date(3_000));
    await utimes(markerPath, new Date(2_000), new Date(2_000));

    assert.equal(
      await isBuildCurrent({
        inputs: [inputDirectory],
        markerPath,
        outputs: [outputPath],
      }),
      false,
    );
  });
});
