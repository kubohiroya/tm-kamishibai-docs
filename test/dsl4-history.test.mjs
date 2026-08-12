import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';
import historyManifest from '../sources/dsl4/release-history-4.0.json' with {type: 'json'};
import candidate from '../sources/dsl4/release-smoke-4.0-candidate.json' with {type: 'json'};
import sourceLock from '../sources/dsl4/source-lock.json' with {type: 'json'};

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
const history = read('docs/dsl-author-guides/dsl-4.0-history.md');
const dsl4Index = read('site/4.0/index.html');
const entry = historyManifest.entries[0];

test('publishes a separate DSL 4.0 release history', () => {
  const publication = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'dsl-4.0-history.md',
  );

  assert.equal(publication?.version, '4.0');
  assert.equal(publication?.outputDirectory, '4.0/dsl-author-guides');
  assert.match(dsl4Index, /dsl-author-guides\/dsl-4\.0-history\//u);
  assert.match(
    dsl4Index,
    /vivliostyle\.org\/viewer\/#src=https:\/\/kubohiroya\.github\.io\/tmpose-kamishibai-docs\/4\.0\/dsl-author-guides\/dsl-4\.0-history\/publication\.json/u,
  );
});

test('tracks the 4.0.0 candidate without claiming formal publication', () => {
  assert.equal(historyManifest.series, '4.0');
  assert.equal(entry.version, '4.0.0');
  assert.equal(entry.publicationState, 'candidate-verified-publication-pending');
  assert.equal(entry.formalPublication.gitTag, null);
  assert.equal(entry.formalPublication.githubRelease, null);
  assert.equal(entry.formalPublication.npmVersion, null);
  assert.equal(entry.formalPublication.latestFormalRelease, 'v3.2.3');

  assert.match(history, /candidate検証済み・正式公開待ち/u);
  assert.match(history, /annotated `v4\.0\.0`.*未公開/u);
  assert.doesNotMatch(history, /v4\.0\.0.{0,20}(?:公開済み|正式リリース済み)/u);
});

test('pins source, schema, artifacts, surfaces, flags, and constraints', () => {
  assert.equal(
    entry.source.releasePreparationMergeCommit,
    '23739cc102a8afaaba713b0c92adb4c1c236aaee',
  );
  assert.equal(entry.source.verifiedCandidateCommit, candidate.runtime.candidateCommit);
  assert.equal(entry.source.releaseSourceCommit, candidate.runtime.releaseSource.commit);
  assert.equal(entry.schema.candidateSha256, candidate.runtime.schema.sha256);
  assert.equal(entry.schema.documentationReferenceCommit, sourceLock.commit);
  assert.equal(entry.schema.documentationReferenceSha256, sourceLock.schemaSha256);
  assert.deepEqual(entry.featureFlags, candidate.runtime.featureFlags);
  assert.equal(entry.artifacts.standardSb3.sha256, candidate.runtime.standardArtifact.sha256);
  assert.equal(entry.artifacts.npmTarball.sha256, candidate.runtime.packageTarball.sha256);
  assert.equal(entry.verification.physicalCameraAndPose, 'passed');
  assert(entry.surfaces.length >= 9);
  assert(entry.knownConstraints.length >= 8);

  for (const value of [
    entry.source.releasePreparationMergeCommit,
    entry.source.verifiedCandidateCommit,
    entry.source.releaseSourceCommit,
    entry.schema.candidateSha256,
    entry.artifacts.standardSb3.sha256,
    entry.artifacts.npmTarball.sha256,
  ]) {
    assert.match(history, new RegExp(value, 'u'));
  }
});

test('defines the update contract and keeps migration details out', () => {
  assert.deepEqual(historyManifest.updateContract.requiredChecks, [
    'pnpm verify:full',
    'pnpm release:check',
    'pnpm check',
    'repeat-build-skip',
  ]);
  assert(historyManifest.updateContract.requiredFields.length >= 9);
  assert.match(history, /^## 4\.0\.xを追記する$/mu);
  assert.match(history, /tag、release、npm、Pagesのどれかが欠ける場合/u);
  assert.match(history, /同一入力の再build skip/u);
  assert.doesNotMatch(history, /convert-dsl4|kamishibai=|\.txt|^## .*移行/mu);
});
