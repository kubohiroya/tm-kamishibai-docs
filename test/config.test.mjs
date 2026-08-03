import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {documentationConfig, documentCollections} from '../docs/config.mjs';
import sourceSnapshot from '../sources/tmpose-kamishibai.json' with {type: 'json'};

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

const expectedCollections = {
  'user-guides': [
    '01-executive-summary-adult.md',
    '02-executive-summary-kids.md',
    '03-user-guide.md',
    '09-application-materials-guide.md',
  ],
  'dsl-author-guides': ['04-dsl-manual.md', '05-command-reference.md', 'history.md'],
  'developer-guides': [
    '06-developer-guide.md',
    '07-internal-specification.md',
    '08-extension-guide.md',
  ],
};

test('organizes every migrated document into one reader-oriented collection', () => {
  assert.deepEqual(
    Object.fromEntries(
      documentCollections.map(({id, documents}) => [
        id,
        documents.map(({sourceFilename}) => sourceFilename),
      ]),
    ),
    expectedCollections,
  );
  assert.equal(documentationConfig.documents.length, 10);
  assert(!existsSync(path.join(projectRoot, 'docs/general')));

  for (const document of documentationConfig.documents) {
    const sourcePath = path.join(
      projectRoot,
      'docs',
      document.sourceDirectory,
      document.sourceFilename,
    );
    const source = readFileSync(sourcePath, 'utf8');
    assert.match(
      source,
      new RegExp(`^# ${document.title.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}$`, 'mu'),
    );
  }
});

test('pins the merged PR 238 source contract', () => {
  assert.equal(sourceSnapshot.pullRequest, 238);
  assert.equal(sourceSnapshot.commit, '8166edb3a8b7ed360685bdcd6534c000054105bd');
  assert.equal(sourceSnapshot.dslVersion, '3.1');
  assert.equal(sourceSnapshot.extensions.length, 15);
});
