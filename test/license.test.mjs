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
