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

test('keeps the extension guide as an index, bundle explanation, and fifteen two-page entries', () => {
  const sheetIds = [
    ...extensionGuide.matchAll(/^## .+ \{#([^ ]+) \.extension-sheet(?: [^}]+)?\}$/gmu),
  ];
  const leftSheets = extensionGuide.match(/\.extension-sheet-left\}/gu) ?? [];
  const rightSheets = extensionGuide.match(/\.extension-sheet-right\}/gu) ?? [];
  assert.equal(sheetIds.length, 31);
  assert.equal(leftSheets.length, 15);
  assert.equal(rightSheets.length, 15);
  assert.equal((extensionGuide.match(/<a href="#extension-[^"]+">/gu) ?? []).length, 15);
  assert.equal((extensionGuide.match(/extension-gallery-[^"]+\.svg/gu) ?? []).length, 7);
  for (const extensionId of sourceSnapshot.extensions) {
    assert.match(extensionGuide, new RegExp(`<code>${extensionId}</code>`, 'u'));
  }
  assert.match(extensionGuide, /\{#extension-bundle \.extension-sheet \.extension-bundle-sheet\}/u);
  assert.match(extensionGuide, /<code>kamishibaibundle<\/code>/u);
  assert.match(extensionGuide, /7 components → 1 ID/u);
  assert.match(extensionGuide, /<strong>15<\/strong>[\s\S]*<strong>9<\/strong>/u);
  assert.match(extensionGuide, /class="extension-dependency-map"/u);
  assert.equal((extensionGuide.match(/class="extension-dependency-row"/gu) ?? []).length, 4);
  const bundleSection = extensionGuide.slice(
    extensionGuide.indexOf('## 7拡張を1つのIDへまとめる'),
    extensionGuide.indexOf('## Consoles —'),
  );
  for (const extensionId of [
    'kubohiroyaassetmanager',
    'tmpose',
    'kubohiroyatextlines',
    'kubohiroyaruntimeexpression',
    'kubohiroyaasyncinput',
    'kubohiroyakamishibairuntime',
    'kubohiroyaweblink',
  ]) {
    assert.match(bundleSection, new RegExp(`<code>${extensionId}</code>`, 'u'));
  }
  assert.ok(
    extensionGuide.indexOf('#extension-consoles') <
      extensionGuide.indexOf('#extension-asset-manager'),
  );
  assert.ok(
    extensionGuide.indexOf('#extension-asset-manager') <
      extensionGuide.indexOf('#extension-kamishibai-runtime'),
  );
  assert.doesNotMatch(extensionGuide, /ポーズをとろう！/u);
  assert.equal(findDocument('extension-guide.md')?.expectedPdfPageCount, 32);
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
