import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import Ajv2020 from 'ajv/dist/2020.js';
import {parse} from 'yaml';

import sourceSnapshot from '../sources/tmpose-kamishibai.json' with {type: 'json'};

const extensionGuide = readFileSync(
  new URL('../docs/developer-guides/extension-guide.md', import.meta.url),
  'utf8',
);
const applicationGuide = readFileSync(
  new URL('../docs/user-guides/application-materials-guide.md', import.meta.url),
  'utf8',
);
const commandReference = readFileSync(
  new URL('../docs/dsl-author-guides/command-reference.md', import.meta.url),
  'utf8',
);
const dslManual = readFileSync(
  new URL('../docs/dsl-author-guides/dsl-manual.md', import.meta.url),
  'utf8',
);
const dsl4AuthorGuide = readFileSync(
  new URL('../docs/dsl-author-guides/dsl-4.0-author-guide.md', import.meta.url),
  'utf8',
);
const dsl4SchemaReference = readFileSync(
  new URL('../docs/dsl-author-guides/dsl-4.0-schema-reference.md', import.meta.url),
  'utf8',
);
const dsl4Schema = JSON.parse(
  readFileSync(new URL('../sources/dsl4/dsl-4.schema.json', import.meta.url), 'utf8'),
);
const internalSpecification = readFileSync(
  new URL('../docs/developer-guides/internal-specification.md', import.meta.url),
  'utf8',
);
const theme = readFileSync(new URL('../docs/general-theme.css', import.meta.url), 'utf8');

test('keeps the DSL 4.0 preview guide separate from the production 3.2 manual', () => {
  assert.match(dslManual, /対象アプリ: tmpose-kamishibai 3\.2\.x/u);
  assert.match(dsl4AuthorGuide, /DSL 4\.0は開発中/u);
  assert.match(dsl4AuthorGuide, /kamishibai: '4\.0'/u);
  assert.match(dsl4AuthorGuide, /\.kamishibai\.yaml/u);
  assert.match(dsl4AuthorGuide, /一つのファイルへ混在させたり/u);
  assert.match(dsl4AuthorGuide, /K4-SCHEMA-UNKNOWN-KEY/u);
  assert.match(dsl4AuthorGuide, /DSL 3\.2から移行するときの考え方/u);
  assert.match(dsl4AuthorGuide, /紙芝居DSL 4\.0 Schemaリファレンス/u);
  assert.match(dsl4AuthorGuide, /camera previewの表示と操作UI/u);
  assert.match(
    dsl4AuthorGuide,
    /端末固有の物理device IDは台本、StoryDocument、`variables`へ保存しません/u,
  );
  assert.match(dsl4AuthorGuide, /前sceneの値を持ち越しません/u);
  assert.match(dsl4SchemaReference, /先行公開（DSL 4\.0実装は未リリース）/u);
  assert.match(dsl4SchemaReference, /現行の公開アプリtmpose-kamishibai 3\.2\.x/u);
  assert.match(dsl4SchemaReference, /上流`813f369`へまだcommitされていない/u);
  assert.doesNotMatch(dslManual, /kamishibai: '4\.0'/u);
});

test('keeps the DSL 4.0 complete example valid against the pinned candidate Schema', () => {
  const completeExampleSection = dsl4AuthorGuide.slice(dsl4AuthorGuide.indexOf('## 総合サンプル'));
  const source = completeExampleSection.match(/```yaml\n([\s\S]*?)\n```/u)?.[1];
  assert.ok(source, 'The DSL 4.0 complete example must exist.');
  const AjvConstructor = /** @type {any} */ (Ajv2020);
  const validate = new AjvConstructor({allErrors: true, strict: false}).compile(dsl4Schema);
  assert.equal(validate(parse(source)), true, JSON.stringify(validate.errors));
});

test('documents named SVG Text styles for say and think actions', () => {
  for (const guide of [commandReference, dslManual]) {
    assert.match(guide, /action=Hero:say:こんにちは:5\.0:baloonStyle/u);
    assert.match(guide, /action=Hero:think:考え中:5\.0:baloonStyle/u);
    assert.match(guide, /action=ACTOR:say\|think:TEXT:SECONDS:STYLE/u);
    assert.match(guide, /default/u);
  }
  assert.match(internalSpecification, /actionParam3/u);
  assert.match(internalSpecification, /sayWithStyle/u);
  assert.match(internalSpecification, /thinkWithStyle/u);
  assert.match(extensionGuide, /sayWithStyle/u);
  assert.match(extensionGuide, /thinkWithStyle/u);
});

test('keeps the extension guide as an index, bundle explanation, and sixteen two-page entries', () => {
  const sheetIds = [
    ...extensionGuide.matchAll(/^## .+ \{#([^ ]+) \.extension-sheet(?: [^}]+)?\}$/gmu),
  ];
  const leftSheets = extensionGuide.match(/\.extension-sheet-left\}/gu) ?? [];
  const rightSheets = extensionGuide.match(/\.extension-sheet-right\}/gu) ?? [];
  const rightHeadings = [
    ...extensionGuide.matchAll(/^## (.+) \{#[^ ]+ \.extension-sheet \.extension-sheet-right\}$/gmu),
  ].map(([, heading]) => heading);
  assert.equal(sheetIds.length, 33);
  assert.equal(leftSheets.length, 16);
  assert.equal(rightSheets.length, 16);
  assert.equal(rightHeadings.length, 16);
  assert.ok(rightHeadings.every((heading) => heading.includes('で') && !heading.includes(' — ')));
  assert.equal((extensionGuide.match(/<a href="#extension-[^"]+">/gu) ?? []).length, 16);
  assert.equal((extensionGuide.match(/extension-gallery-[^"]+\.svg/gu) ?? []).length, 7);
  const editorCaptures = [
    ...extensionGuide.matchAll(/\.\.\/images\/(extension-editor-[^"]+\.png)/gu),
  ].map(([, filename]) => filename);
  assert.equal(editorCaptures.length, 16);
  assert.equal(new Set(editorCaptures).size, 16);
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
  assert.equal((extensionGuide.match(/class="extension-kamishibai-why"/gu) ?? []).length, 16);
  assert.equal((extensionGuide.match(/機能拡張そのもの 1 \/ 2/gu) ?? []).length, 16);
  assert.equal((extensionGuide.match(/TMPose 紙芝居での利用例 2 \/ 2/gu) ?? []).length, 16);
  assert.match(extensionGuide, /^## TMPose — 学習済みモデルでカメラ映像のポーズを認識する /mu);
  assert.doesNotMatch(extensionGuide, /cameraをpose名へ変える/u);
  assert.match(extensionGuide, /^## Web Link — HTTPS URLを検証し、新しいタブで開く /mu);
  assert.match(
    extensionGuide,
    /^## Web Linkで利用者がボタンやメニューを操作したとき、設定済みのHTTPSページを開く /mu,
  );
  assert.doesNotMatch(extensionGuide, /公式URLだけを開く|title buttonからだけ開く/u);
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
  assert.match(extensionGuide, /<code>tmposebundle<\/code>/u);
  assert.match(extensionGuide, /4 components → 1 ID/u);
  assert.match(extensionGuide, /<strong>16<\/strong>[\s\S]*<strong>13<\/strong>/u);
  assert.match(extensionGuide, /class="extension-dependency-map"/u);
  assert.equal((extensionGuide.match(/class="extension-dependency-row"/gu) ?? []).length, 4);
  const bundleSection = extensionGuide.slice(
    extensionGuide.indexOf('## 4拡張を1つのIDへまとめる'),
    extensionGuide.indexOf('## Consoles —'),
  );
  for (const extensionId of [
    'kubohiroyaassetmanager',
    'text',
    'kubohiroyakamishibairuntime',
    'kubohiroyasvgtext',
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
    extensionGuide.indexOf('{#extension-animated-text-example '),
    extensionGuide.indexOf('{#extension-translate '),
  );
  assert.match(animatedTextExample, /接続済みscriptにAnimated Text blockはありません/u);
  assert.match(animatedTextExample, /text_setFont/u);
  assert.match(animatedTextExample, /text_setText/u);
  assert.match(animatedTextExample, /Asset ManagerからAnimated Text opcodeを取得する処理/u);
  assert.doesNotMatch(extensionGuide, /さぁ行こう/u);
  assert.doesNotMatch(extensionGuide, /ポーズをとろう！/u);
  assert.match(
    extensionGuide,
    /^## SVG Text — 名前付きスタイルで相対サイズの吹き出しとSVG文字を描画する /mu,
  );
  assert.match(extensionGuide, /@kubohiroya\/turbowarp-svg-text\/v\/0\.1\.0/u);
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
  assert.match(applicationGuide, /kamishibai=3\.2/u);
  assert.doesNotMatch(
    applicationGuide,
    /<code>[^<]*\\n[^<]*<\/code>/gu,
    'DSL examples must use actual line breaks instead of escaped newline text.',
  );
  assert.match(applicationGuide, /b3f4b9aa3ed3ede363700be815fe522f6a47df0b/u);
  assert.match(theme, /@page application-guide\s*\{[\s\S]*size:\s*A4;/u);
});
