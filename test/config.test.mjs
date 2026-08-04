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
    'executive-summary-adult.md',
    'executive-summary-kids.md',
    'user-guide.md',
    'application-materials-guide.md',
  ],
  'dsl-author-guides': ['dsl-manual.md', 'command-reference.md', 'history.md'],
  'developer-guides': [
    'developer-guide.md',
    'internal-specification.md',
    'extension-guide.md',
    'dsl-3.1-diagnostics-design.md',
    'dependency-audit.md',
    'release-smoke.md',
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
  assert.equal(documentationConfig.documents.length, 13);
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

test('pins the merged 3.2.0 source contract', () => {
  assert.equal(sourceSnapshot.pullRequest, 252);
  assert.equal(sourceSnapshot.commit, 'd1624c9ce9464bf696b4bb97851dce9154a09ee6');
  assert.equal(sourceSnapshot.dslVersion, '3.2');
  assert.equal(sourceSnapshot.extensions.length, 16);
});
