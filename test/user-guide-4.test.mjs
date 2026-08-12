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
    'Version 4.0.0 (2026/08/11)',
    'Loading',
    'タイトル画面右上の「×」',
    'Space',
    'ArrowRight',
    'ArrowDown',
    'カメラを拒否した',
    'ポーズが成立しない',
    '画像や音声が見つからない',
    'YAMLの診断',
    '終了と再実行',
    'カメラ使用中の表示が消えた',
  ]) {
    assert.match(guide, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
  }

  assert.match(guide, /実カメラ・実ポーズ[\s\S]*確認済み/u);
  assert.match(guide, /issuecomment-5255177777/u);
});

test('pins the live public surfaces and integrity values', () => {
  assert.equal(surfaces.formatVersion, 1);
  assert.equal(surfaces.releaseState.formalGitHubReleasePublished, false);
  assert.equal(surfaces.samples.pagesDeploymentRun, 31559545314);
  assert.equal(surfaces.physicalVerification.camera, 'passed');
  assert.equal(surfaces.physicalVerification.pose, 'passed');
  assert.equal(surfaces.visuals.formalUiCapturesIncluded, false);

  for (const sample of [surfaces.samples.urashima, surfaces.samples.myUrashima]) {
    assert.match(guide, new RegExp(sample.webUrl.replaceAll('.', '\\.'), 'u'));
    for (const artifact of [sample.sb3, sample.web]) {
      assert.match(guide, new RegExp(artifact.sha256, 'u'));
    }
  }
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
