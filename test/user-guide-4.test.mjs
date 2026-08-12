import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';
import surfaces from '../sources/dsl4/user-guide-4.0-public-surfaces.json' with {type: 'json'};

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const guide = read('docs/user-guides/user-guide-4.0.md');

test('publishes the DSL 4.0 user guide independently', () => {
  const entry = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'user-guide-4.0.md',
  );

  assert.ok(entry);
  assert.equal(entry.version, '4.0');
  assert.match(entry.title, /4\.0 操作説明書/u);
});

test('covers the public start-to-finish operation path', () => {
  for (const expected of [
    '浦島太郎 Web版',
    'Loading',
    '右上の「×」',
    'Space',
    'ArrowRight',
    'ArrowDown',
    'カメラを拒否した',
    'ポーズが成立しない',
    'エラーが表示された',
    '終える・もう一度見る',
    'カメラ使用中の表示',
  ]) {
    assert.match(guide, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
  }

  assert.match(guide, /カメラを使わない場合や許可したくない場合は、キーや画面の\s*タッチ/u);
  assert.match(guide, /画面の文章だけを記録/u);
});

test('keeps live-surface evidence in the machine-readable manifest', () => {
  assert.equal(surfaces.formatVersion, 1);
  assert.equal(surfaces.releaseState.formalGitHubReleasePublished, false);
  assert.equal(surfaces.samples.pagesDeploymentRun, 31559545314);
  assert.equal(surfaces.physicalVerification.camera, 'passed');
  assert.equal(surfaces.physicalVerification.pose, 'passed');
  assert.equal(surfaces.visuals.formalUiCapturesIncluded, false);

  for (const sample of [surfaces.samples.urashima, surfaces.samples.myUrashima]) {
    assert.match(guide, new RegExp(sample.webUrl.replaceAll('.', '\\.'), 'u'));
  }

  assert.doesNotMatch(guide, /SHA-256|[a-f0-9]{64}/u);
  assert.doesNotMatch(guide, /issuecomment-|feature flag|checksum|surface/iu);
});

test('does not fold earlier-series operation formats into the 4.0 guide', () => {
  for (const legacyTerm of [
    'DSL 3.1',
    'DSL 3.2',
    'kamishibai=',
    '.txt',
    'Generic',
    'Editor',
    'Player',
  ]) {
    assert.doesNotMatch(guide, new RegExp(legacyTerm.replace('.', '\\.'), 'u'));
  }
});
