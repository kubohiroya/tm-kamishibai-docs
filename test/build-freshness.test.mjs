import assert from 'node:assert/strict';
import {mkdir, mkdtemp, readFile, rm, stat, utimes, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  collectSourceInputs,
  copyFileIfStale,
  isBuildCurrent,
  referencedLocalAssets,
  runIncrementalBuild,
  writeFileIfChanged,
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

test('runs a reusable incremental build only when its outputs are stale or forced', async () => {
  await withTemporaryDirectory(async (directory) => {
    const inputPath = path.join(directory, 'guide.md');
    const markerPath = path.join(directory, 'build-info.json');
    const outputPath = path.join(directory, 'index.html');
    let buildCount = 0;
    const build = async () => {
      buildCount += 1;
      await Promise.all([
        writeFile(outputPath, `<main>build ${buildCount}</main>`),
        writeFile(markerPath, '{"kind":"guide"}\n'),
      ]);
    };
    const options = {
      inputs: [inputPath],
      markerPath,
      outputs: [outputPath],
      expectedBuildInfo: {kind: 'guide'},
      label: 'guide.md',
      build,
    };

    await writeFile(inputPath, '# Guide\n');
    assert.equal(await runIncrementalBuild(options), true);
    assert.equal(await runIncrementalBuild(options), false);
    assert.equal(buildCount, 1);

    const future = new Date(Date.now() + 2_000);
    await utimes(inputPath, future, future);
    assert.equal(await runIncrementalBuild(options), true);
    assert.equal(await runIncrementalBuild({...options, force: true}), true);
    assert.equal(buildCount, 3);
  });
});

test('copies stale files and writes changed content without touching current outputs', async () => {
  await withTemporaryDirectory(async (directory) => {
    const sourcePath = path.join(directory, 'source/image.png');
    const copyPath = path.join(directory, 'output/image.png');
    const textPath = path.join(directory, 'output/index.html');
    await mkdir(path.dirname(sourcePath), {recursive: true});
    await writeFile(sourcePath, 'image-v1');

    assert.equal(await copyFileIfStale(sourcePath, copyPath), true);
    const copiedMtime = (await stat(copyPath)).mtimeMs;
    assert.equal(await copyFileIfStale(sourcePath, copyPath), false);
    assert.equal((await stat(copyPath)).mtimeMs, copiedMtime);
    assert.equal(await readFile(copyPath, 'utf8'), 'image-v1');

    assert.equal(await writeFileIfChanged(textPath, '<main>Guide</main>\n'), true);
    const writtenMtime = (await stat(textPath)).mtimeMs;
    assert.equal(await writeFileIfChanged(textPath, '<main>Guide</main>\n'), false);
    assert.equal((await stat(textPath)).mtimeMs, writtenMtime);
    assert.equal(await writeFileIfChanged(textPath, '<main>Updated</main>\n'), true);
  });
});
