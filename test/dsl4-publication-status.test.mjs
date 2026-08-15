import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig, dsl4PublicationStatus} from '../docs/config.mjs';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const statusPolicy = read('DSL4-PUBLICATION-STATUS.md');
const dsl4Index = read('site/4.0/index.html');
const dsl4Documents = documentationConfig.documents
  .filter((document) => document.version === '4.0')
  .map((document) => ({
    collectionId: document.collectionId,
    sourceFilename: document.sourceFilename,
    source: read(`docs/${document.sourceDirectory}/${document.sourceFilename}`),
  }));

test('records the rc.5 implementation and publication state in config', () => {
  assert.deepEqual(dsl4PublicationStatus, {
    verifiedOn: '2026-08-15',
    implementationCommit: 'f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6',
    latestPublishedRelease: 'v3.2.3',
    publishedDsl4Prerelease: 'v4.0.0-rc.5',
    officialDsl4Release: null,
  });
});

test('distinguishes rc.5, stable, sample baseline, and document state', () => {
  for (const term of ['実装基準', '公開プレリリース', '安定版', '公開サンプル基準', '文書状態']) {
    assert.match(statusPolicy, new RegExp(term, 'u'));
  }

  assert.match(statusPolicy, /v4\.0\.0.*未公開/u);
  assert.match(statusPolicy, /v4\.0\.0-rc\.5/u);
  assert.match(statusPolicy, /rc\.3.*サンプル/u);
});

test('shows rc.5 on the 4.0 top and distinguishes rc.3 sample artifacts', () => {
  assert.match(dsl4Index, /4\.0\.0-rc\.5を公開しています/u);
  assert.match(dsl4Index, /kamishibai-4\.0\.0-rc\.5\.sb3/u);
  assert.match(dsl4Index, /tmpose-kamishibai\/v\/4\.0\.0-rc\.5/u);
  assert.match(dsl4Index, /rc\.3.*作成された/u);
  assert.match(dsl4Index, /安定版<code>4\.0\.0<\/code>はまだ未公開/u);
  assert.match(dsl4Index, /最新安定版は\s*<code>v3\.2\.3<\/code>/u);

  assert.equal(dsl4Documents.length, 19);
  for (const {sourceFilename, source} of dsl4Documents) {
    assert.match(source, /4\.0\.0-rc\.5|v4\.0\.0-rc\.5/u, sourceFilename);
  }
});

test('does not claim that stable v4.0.0 is published', () => {
  for (const source of [statusPolicy, dsl4Index, ...dsl4Documents.map(({source}) => source)]) {
    assert.doesNotMatch(source, /v4\.0\.0.{0,20}(?:公開済み|正式リリース済み)/u);
  }
});
