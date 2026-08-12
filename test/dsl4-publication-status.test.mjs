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

test('records the verified implementation and release state in config', () => {
  assert.deepEqual(dsl4PublicationStatus, {
    verifiedOn: '2026-08-13',
    implementationCommit: '9fdea59854ff0a28a00a45fe8e1d7cd5bb0c9014',
    latestPublishedRelease: 'v3.2.3',
    publishedDsl4Prerelease: 'v4.0.0-rc.2',
    officialDsl4Release: null,
  });
});

test('distinguishes implementation, release, public surfaces, and document state', () => {
  for (const term of ['実装基準', 'リリース候補', '正式リリース', '公開画面', '文書状態']) {
    assert.match(statusPolicy, new RegExp(term, 'u'));
  }

  assert.match(statusPolicy, /v4\.0\.0.*正式リリースは未公開/u);
  assert.match(statusPolicy, /#41/u);
  assert.match(statusPolicy, /#42/u);
  assert.match(statusPolicy, /#47/u);
});

test('shows the same release boundary on the 4.0 top and every 4.0 document', () => {
  assert.match(dsl4Index, /4\.0\.0-rc\.2を公開しています/u);
  assert.match(dsl4Index, /kamishibai-4\.0\.0-rc\.2\.sb3/u);
  assert.match(dsl4Index, /tmpose-kamishibai\/v\/4\.0\.0-rc\.2/u);
  assert.match(dsl4Index, /安定版<code>4\.0\.0<\/code>はまだ未公開/u);
  assert.match(dsl4Index, /最新安定版は\s*<code>v3\.2\.3<\/code>/u);
  assert.match(dsl4Index, /tutorials\//u);

  assert.equal(dsl4Documents.length, 16);
  for (const {collectionId, sourceFilename, source} of dsl4Documents) {
    if (collectionId === 'tutorials') {
      assert.match(source, /4\.0\.0-rc\.2/u);
      assert.match(source, /公開プレリリース/u);
      continue;
    }
    if (sourceFilename.startsWith('executive-summary-') || sourceFilename === 'user-guide-4.0.md') {
      assert.match(source, /公開前|公開準備中/u);
      assert.doesNotMatch(source, /[a-f0-9]{40}/u);
    } else {
      assert.match(source, /固定.{0,12}実装|実装基準/u);
      assert.match(source, /2026年8月8日時点/u);
      assert.match(source, /正式リリース/u);
    }
    assert.match(source, /保証しません|確認してください|保守作業を含みます|公開元|公開準備中/u);
  }
});

test('does not describe the DSL 4.0 release as already published', () => {
  for (const source of [statusPolicy, dsl4Index, ...dsl4Documents.map(({source}) => source)]) {
    assert.doesNotMatch(source, /v4\.0\.0.{0,20}(?:公開済み|正式リリース済み)/u);
  }
});
