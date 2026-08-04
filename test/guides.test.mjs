import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {findDocument} from '../docs/config.mjs';
import sourceSnapshot from '../sources/tmpose-kamishibai.json' with {type: 'json'};

const extensionGuide = readFileSync(
  new URL('../docs/developer-guides/extension-guide.md', import.meta.url),
  'utf8',
);
const applicationGuide = readFileSync(
  new URL('../docs/user-guides/application-materials-guide.md', import.meta.url),
  'utf8',
);
const theme = readFileSync(new URL('../docs/general-theme.css', import.meta.url), 'utf8');

test('keeps the extension guide as an index plus fifteen extension pages', () => {
  const sheetIds = [...extensionGuide.matchAll(/^## .+ \{#([^ ]+) \.extension-sheet\}$/gmu)];
  assert.equal(sheetIds.length, 15);
  assert.equal((extensionGuide.match(/<a href="#extension-[^"]+">/gu) ?? []).length, 15);
  for (const extensionId of sourceSnapshot.extensions) {
    assert.match(extensionGuide, new RegExp(`<code>${extensionId}</code>`, 'u'));
  }
  assert.doesNotMatch(extensionGuide, /ポーズをとろう！/u);
  assert.equal(findDocument('extension-guide.md')?.expectedPdfPageCount, 16);
  assert.match(theme, /@page extension-guide\s*\{[\s\S]*size:\s*A4;/u);
});

test('keeps the application guide in the requested eight-page allocation', () => {
  assert.deepEqual(
    [...applicationGuide.matchAll(/<p class="application-page-label">([1-8]) \/ 8/gmu)].map(
      ([, number]) => Number(number),
    ),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
  assert.match(applicationGuide, /ポーズをとろう！/u);
  assert.match(applicationGuide, /kamishibai=3\.1/u);
  assert.doesNotMatch(
    applicationGuide,
    /<code>[^<]*\\n[^<]*<\/code>/gu,
    'DSL examples must use actual line breaks instead of escaped newline text.',
  );
  assert.match(applicationGuide, /2c82aaf02f605564f79efe8ff3bbd8f1a78d6fe9/u);
  assert.equal(findDocument('application-materials-guide.md')?.expectedPdfPageCount, 8);
  assert.match(theme, /@page application-guide\s*\{[\s\S]*size:\s*A4;/u);
});
