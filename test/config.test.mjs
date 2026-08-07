import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {documentationConfig, documentCollections} from '../docs/config.mjs';
import sourceSnapshot from '../sources/tmpose-kamishibai.json' with {type: 'json'};

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

const expectedCollections = {
  'user-guides': ['executive-summary-adult.md', 'executive-summary-kids.md', 'user-guide.md'],
  'dsl-3.2-guides': ['dsl-manual.md', 'command-reference.md', 'history.md'],
  'dsl-4.0-guides': ['dsl-4.0-author-guide.md', 'dsl-4.0-schema-reference.md'],
  'developer-guides': [
    'application-materials-guide.md',
    'application-materials-guide-4.0.md',
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
  assert.equal(documentationConfig.documents.length, 16);
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

test('keeps the developer guide source classification without breaking its public URL', () => {
  const document = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'application-materials-guide.md',
  );
  assert.equal(document?.collectionId, 'developer-guides');
  assert.equal(document?.sourceDirectory, 'developer-guides');
  assert.equal(document?.outputDirectory, 'user-guides');
});

test('publishes DSL 3.2 and 4.0 as parallel dedicated collections', () => {
  const dsl32 = documentCollections.find(({id}) => id === 'dsl-3.2-guides');
  const dsl40 = documentCollections.find(({id}) => id === 'dsl-4.0-guides');
  assert.ok(dsl32?.documents.every(({title}) => !title.includes('4.0')));
  assert.ok(dsl40?.documents.every(({title}) => title.includes('4.0')));
  assert.equal(dsl32?.documents[0].title, '紙芝居DSL 3.2 ファイル作成マニュアル');
  assert.equal(dsl40?.documents[0].title, '紙芝居DSL 4.0 台本作成ガイド');
});
