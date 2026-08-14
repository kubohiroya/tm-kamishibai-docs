import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const writingStyle = read('WRITING-STYLE.md');
const adultOverview = read('docs/user-guides/executive-summary-adult-4.0.md');
const applicationGuide = read('docs/developer-guides/application-materials-guide-4.0.md');
const authorGuide = read('docs/dsl-author-guides/dsl-4.0-author-guide.md');
const schemaReference = read('docs/dsl-author-guides/dsl-4.0-schema-reference.md');
const developerGuide = read('docs/developer-guides/developer-guide-4.0.md');
const dsl4Index = read('site/4.0/index.html');

test('documents the Japanese prose policy without translating code identifiers', () => {
  assert.match(writingStyle, /本文の説明は日本語を基本/u);
  assert.match(writingStyle, /コード上の名前は翻訳しない/u);
  assert.match(writingStyle, /\*\*include文\*\*:[^\n]*一般向け・作者向け文書/u);
  assert.match(writingStyle, /Source Graph[^\n]*実装資料/u);
  assert.match(writingStyle, /Source Graph/u);
  assert.match(writingStyle, /StoryDocument/u);
  assert.match(writingStyle, /世代（generation）/u);
  assert.match(writingStyle, /候補（candidate）/u);
});

test('uses consistent Japanese terms in the first-read DSL 4.0 surfaces', () => {
  for (const source of [adultOverview, applicationGuide, dsl4Index]) {
    for (const mixedPhrase of [
      /YAML project/u,
      /project directory/u,
      /preview・build/u,
      /camera映像/u,
      /人・AI・program/u,
      /制作cycle/u,
    ]) {
      assert.doesNotMatch(source, mixedPhrase);
    }
  }

  assert.match(adultOverview, /紙芝居を楽しむ流れ/u);
  assert.match(adultOverview, /カメラを使わないことも正式な選択肢/u);
  assert.match(applicationGuide, /プレビュー・ビルド/u);
  assert.match(applicationGuide, /include文/u);
  assert.match(dsl4Index, /初めて知る方、作品を作る方、開発する方/u);
  for (const source of [applicationGuide, authorGuide, schemaReference]) {
    assert.doesNotMatch(source, /Source Graph/u);
  }
  assert.doesNotMatch(
    dsl4Index.match(/<header class="page-intro">[\s\S]*?<\/header>/u)?.[0] ?? '',
    /Source Graph|Schema|CLI/u,
  );
});

test('keeps exact commands and internal identifiers in detailed documents', () => {
  for (const implementationTerm of [
    /project\.source\.json/u,
    /validate-dsl4/u,
    /preview-dsl4/u,
    /build-dsl4/u,
    /StoryDocument/u,
  ]) {
    assert.doesNotMatch(adultOverview, implementationTerm);
  }

  assert.match(applicationGuide, /project\.source\.json/u);
  assert.match(applicationGuide, /validate-dsl4/u);
  assert.match(applicationGuide, /build-dsl4/u);
  assert.match(applicationGuide, /StoryDocument/u);
  assert.match(developerGuide, /preview-dsl4/u);
  assert.match(applicationGuide, /--project-root/u);
  assert.match(applicationGuide, /--source-manifest/u);
});
