import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig, documentCollections} from '../docs/config.mjs';

const index = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');

test('publishes each document in its reader-oriented directory', () => {
  assert.doesNotMatch(index, /tmpose-kamishibai\/docs\//u);
  assert.doesNotMatch(index, /href="general\//u);

  for (const collection of documentCollections) {
    assert.match(index, new RegExp(`<h2[^>]*>${collection.title}</h2>`, 'u'));
  }
  for (const document of documentationConfig.documents) {
    const basename = document.sourceFilename.replace(/\.md$/u, '');
    assert.match(index, new RegExp(`href="${document.outputDirectory}/${basename}/"`, 'u'));
    assert.doesNotMatch(
      index,
      new RegExp(`href="${document.outputDirectory}/${basename}\\.pdf"`, 'u'),
    );
    assert.match(
      index,
      new RegExp(
        `tmpose-kamishibai-docs/${document.outputDirectory}/${basename}/publication\\.json`,
        'u',
      ),
    );
  }
});

test('offers PDFs only for workshop publications', () => {
  const actionGroups = [...index.matchAll(/<div class="actions">([\s\S]*?)<\/div>/gu)];
  assert.equal(actionGroups.length, documentationConfig.documents.length + 2);
  for (const [, actions] of actionGroups.slice(0, documentationConfig.documents.length)) {
    assert.deepEqual(
      [...actions.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/gu)].map(([, label]) =>
        label.replace(/\s+/gu, ' ').trim(),
      ),
      ['HTML', 'Vivliostyle Viewer'],
    );
  }
  for (const [, actions] of actionGroups.slice(documentationConfig.documents.length)) {
    assert.deepEqual(
      [...actions.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/gu)].map(([, label]) =>
        label.replace(/\s+/gu, ' ').trim(),
      ),
      ['HTML', 'Vivliostyle Viewer', 'PDF'],
    );
  }
});
