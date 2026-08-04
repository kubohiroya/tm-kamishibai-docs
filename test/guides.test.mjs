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
  const editorCaptures = [
    ...extensionGuide.matchAll(/\.\.\/images\/(extension-editor-[^"]+\.png)/gu),
  ].map(([, filename]) => filename);
  assert.equal(editorCaptures.length, 15);
  assert.equal(new Set(editorCaptures).size, 15);
  const editorCaptureDimensions = editorCaptures.map((filename) => {
    const png = readFileSync(new URL(`../docs/images/${filename}`, import.meta.url));
    return [png.readUInt32BE(16), png.readUInt32BE(20)];
  });
  assert.ok(editorCaptureDimensions.every(([width, height]) => width <= 1400 && height <= 600));
  assert.ok(editorCaptureDimensions.every(([width, height]) => width * height >= 50_000));
  assert.ok(editorCaptureDimensions.filter(([width]) => width >= 800).length >= 7);
  assert.ok(
    new Set(editorCaptureDimensions.map(([width, height]) => `${width}x${height}`)).size >= 10,
  );
  assert.doesNotMatch(extensionGuide, /class="tw-/u);
  assert.equal((extensionGuide.match(/class="extension-kamishibai-why"/gu) ?? []).length, 15);
  assert.equal((extensionGuide.match(/機能拡張そのもの 1 \/ 2/gu) ?? []).length, 15);
  assert.equal((extensionGuide.match(/TMPose 紙芝居での利用例 2 \/ 2/gu) ?? []).length, 15);
  assert.match(theme, /content: "TMPose 紙芝居での利用例";/u);
  assert.doesNotMatch(`${extensionGuide}\n${theme}`, /TMPose紙芝居での利用/u);
  assert.match(
    extensionGuide,
    /このアプリの体験会を実施する場合を想定すると、参加者が書いたTXT台本をその場ですぐ試してもらいたい一方、どのような技量・経験を持った参加者が集まるかがわからず時間的制約もある状況では、台本ごとにWebへ公開したりアプリを作り直したりはできません。/u,
  );
  const galleryFigures = [
    ...extensionGuide.matchAll(/<figure class="extension-gallery-banner">([\s\S]*?)<\/figure>/gu),
  ];
  assert.equal(galleryFigures.length, 7);
  for (const [, galleryFigure] of galleryFigures) {
    assert.doesNotMatch(galleryFigure, /<figcaption>/u);
  }
  assert.match(theme, /h2\.extension-sheet-left:first-child::before/u);
  assert.match(theme, /h2\.extension-sheet-right:first-child::before/u);
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
  const animatedTextExample = extensionGuide.slice(
    extensionGuide.indexOf('## Animated Text — Asset Managerから間接利用する'),
    extensionGuide.indexOf('## Translate —'),
  );
  assert.match(animatedTextExample, /接続済みscriptにAnimated Text blockはありません/u);
  assert.match(animatedTextExample, /text_setFont/u);
  assert.match(animatedTextExample, /text_setText/u);
  assert.match(animatedTextExample, /Asset ManagerからAnimated Text opcodeを取得する処理/u);
  assert.doesNotMatch(extensionGuide, /さぁ行こう/u);
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
