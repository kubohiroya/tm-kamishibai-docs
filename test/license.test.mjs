import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {documentationConfig, workshopDocumentConfig} from '../docs/config.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const copyrightNotice = /Copyright © 2026 Hiroya Kubo\./u;

async function markdownFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return markdownFiles(entryPath);
      return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

test('marks reader-oriented documents as CC BY-SA 4.0', async () => {
  for (const document of documentationConfig.documents) {
    const source = await readFile(
      path.join(projectRoot, 'docs', document.sourceDirectory, document.sourceFilename),
      'utf8',
    );
    assert.match(source, copyrightNotice);
    assert.match(source, /CC BY-SA 4\.0/u);
  }
});

test('preserves the workshop license boundary', async () => {
  const workshopRoot = path.join(projectRoot, 'docs/workshops');
  const participantPath = path.join(
    projectRoot,
    'docs',
    workshopDocumentConfig.sourceDirectory,
    workshopDocumentConfig.sourceFilename,
  );
  for (const filePath of (await markdownFiles(workshopRoot)).filter(
    (filePath) => path.basename(filePath) !== 'LICENSE.md' && filePath !== participantPath,
  )) {
    const source = await readFile(filePath, 'utf8');
    assert.match(source, copyrightNotice);
    assert.match(source, /All rights reserved\./u);
  }
  assert.doesNotMatch(await readFile(participantPath, 'utf8'), copyrightNotice);
});

test('declares the repository as multi-licensed without a residual MPL category', async () => {
  const [rootNotice, licenseMap, mplText, packageMetadata] = await Promise.all([
    readFile(path.join(projectRoot, 'LICENSE'), 'utf8'),
    readFile(path.join(projectRoot, 'LICENSES.md'), 'utf8'),
    readFile(path.join(projectRoot, 'LICENSES/MPL-2.0.txt'), 'utf8'),
    readFile(path.join(projectRoot, 'package.json'), 'utf8').then(JSON.parse),
  ]);

  assert.match(rootNotice, /単一のライセンスは適用されません/u);
  assert.match(licenseMap, /`scripts\/\*\*`/u);
  assert.match(licenseMap, /`docs\/developer-guides\/\*\*`/u);
  assert.match(licenseMap, /生成元の\s*ライセンスや利用条件は変わりません/u);
  assert.doesNotMatch(licenseMap, /上記以外/u);
  assert.match(mplText, /^Mozilla Public License Version 2\.0/u);
  assert.equal(packageMetadata.license, 'SEE LICENSE IN LICENSES.md');
});
