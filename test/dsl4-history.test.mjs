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
});

test('records rc.5 as a published prerelease without claiming stable 4.0.0', () => {
  assert.equal(historyManifest.series, '4.0');
  assert.equal(entry.version, '4.0.0-rc.5');
  assert.equal(entry.publicationState, 'published-prerelease');
  assert.equal(entry.publication.gitTag, 'v4.0.0-rc.5');
  assert.equal(entry.publication.tagCommit, sourceLock.commit);
  assert.equal(entry.publication.npmVersion, '4.0.0-rc.5');
  assert.equal(entry.publication.npmDistTag, 'next');
  assert.equal(entry.publication.recommendedStableRelease, 'v3.2.3');
  assert.equal(entry.publication.officialDsl4Release, null);

  assert.match(history, /状態: \*\*公開プレリリース\*\*/u);
  assert.match(history, /正式版`v4\.0\.0`は未公開/u);
});

test('pins rc.5 source, schema, artifacts, surfaces, flags, and verification', () => {
  assert.equal(entry.source.releasePreparationMergeCommit, candidate.runtime.candidateCommit);
  assert.equal(entry.source.freezeMergeCommit, candidate.runtime.freezeCommit);
  assert.equal(entry.source.sourceIdentity, candidate.runtime.releaseSource.sourceIdentity);
  assert.equal(entry.schema.releaseSha256, candidate.runtime.schema.sha256);
  assert.equal(entry.schema.documentationReferenceCommit, sourceLock.commit);
  assert.equal(entry.schema.documentationReferenceSha256, sourceLock.schemaSha256);
  assert.deepEqual(entry.featureFlags, candidate.runtime.featureFlags);
  assert.equal(entry.artifacts.standardSb3.sha256, candidate.runtime.standardArtifact.sha256);
  assert.equal(entry.artifacts.standardSb3.size, candidate.runtime.standardArtifact.size);
  assert.equal(entry.artifacts.npmTarball.sha256, candidate.runtime.packageTarball.sha256);
  assert.equal(entry.verification.physicalCameraAndPose, 'rc.5-retest-pending');
  assert(entry.surfaces.includes('turbowarp-core-action-blocks'));
  assert(entry.knownConstraints.includes('published-tutorial-and-sample-artifacts-remain-rc.3'));

  for (const value of [
    entry.source.releasePreparationMergeCommit,
    entry.source.freezeMergeCommit,
    entry.source.sourceIdentity,
    entry.schema.releaseSha256,
    entry.artifacts.standardSb3.sha256,
    entry.artifacts.npmTarball.sha256,
  ]) {
    assert.match(history, new RegExp(value, 'u'));
  }
});

test('records the rc.5 dependency pins and immutable rollback', () => {
  assert.equal(entry.dependencies['@kubohiroya/turbowarp-bubble'], '0.7.0');
  assert.equal(entry.dependencies['@kubohiroya/turbowarp-tmpose'], '1.10.0');
  assert.equal(entry.rollback.fixVersion, 'publish-4.0.0-rc.6');
  assert.match(history, /23 core action/u);
  assert.match(history, /rc\.5のbyte列を上書きせず/u);
  assert.match(history, /4\.0\.0-rc\.6/u);
});

test('defines the update contract and keeps migration details out', () => {
  assert.deepEqual(historyManifest.updateContract.requiredChecks, [
    'pnpm verify:full',
    'pnpm release:check',
    'pnpm check',
    'repeat-build-skip',
  ]);
  assert(historyManifest.updateContract.requiredFields.length >= 9);
  assert.match(history, /^## 次のversionを追記する$/mu);
  assert.doesNotMatch(history, /convert-dsl4|kamishibai=|\.txt|^## .*移行/mu);
});
