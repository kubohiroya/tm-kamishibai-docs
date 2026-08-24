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
const previousEntry = historyManifest.entries[1];

test('publishes a separate DSL 4.0 release history', () => {
  const publication = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'dsl-4.0-history.md',
  );

  assert.equal(publication?.version, '4.0');
  assert.equal(publication?.outputDirectory, '4.0/dsl-author-guides');
  assert.match(dsl4Index, /dsl-author-guides\/dsl-4\.0-history\//u);
});

test('records rc.8 as a published prerelease without claiming stable 4.0.0', () => {
  assert.equal(historyManifest.series, '4.0');
  assert.equal(entry.version, '4.0.0-rc.8');
  assert.equal(entry.publicationState, 'published-prerelease');
  assert.equal(entry.publication.gitTag, 'v4.0.0-rc.8');
  assert.equal(entry.publication.tagCommit, '29c0deadcb98badf94a0244c479ca896dc71f842');
  assert.equal(entry.publication.npmVersion, '4.0.0-rc.8');
  assert.equal(entry.publication.npmDistTag, 'next');
  assert.equal(entry.publication.recommendedStableRelease, 'v3.2.3');
  assert.equal(entry.publication.officialDsl4Release, null);

  assert.match(history, /状態: \*\*公開プレリリース\*\*/u);
  assert.match(history, /正式版`v4\.0\.0`は未公開/u);
});

test('pins rc.8 source, schema, artifacts, surfaces, flags, and verification', () => {
  assert.equal(entry.source.releasePreparationMergeCommit, candidate.runtime.candidateCommit);
  assert.equal(entry.source.freezeMergeCommit, candidate.runtime.freezeCommit);
  assert.equal(entry.source.sourceIdentity, candidate.runtime.releaseSource.sourceIdentity);
  assert.equal(entry.schema.releaseSha256, candidate.runtime.schema.sha256);
  assert.equal(entry.schema.documentationReferenceCommit, entry.publication.tagCommit);
  assert.equal(
    entry.schema.documentationReferenceSha256,
    '46ff159c29e13704d707dae8e0d2ad3a146b6aa8a68a968614e6ef56d112f135',
  );
  assert.equal(entry.schema.documentationReferenceSha256, sourceLock.schemaSha256);
  assert.deepEqual(entry.featureFlags, candidate.runtime.featureFlags);
  assert.equal(entry.artifacts.standardSb3.sha256, candidate.runtime.standardArtifact.sha256);
  assert.equal(entry.artifacts.standardSb3.size, candidate.runtime.standardArtifact.size);
  assert.equal(entry.artifacts.npmTarball.sha256, candidate.runtime.packageTarball.sha256);
  assert.equal(
    entry.verification.physicalCameraAndPose,
    'previous-camera-context-measurement; recognition-and-overlay-browser-verified',
  );
  assert(entry.surfaces.includes('turbowarp-core-action-blocks'));
  assert(entry.surfaces.includes('pose-preview-overlay'));
  assert(entry.surfaces.includes('named-bubble-close-policies'));

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

test('records the rc.8 dependency pins and immutable rollback while preserving rc.7 history', () => {
  assert.equal(entry.dependencies['@kubohiroya/turbowarp-bubble'], '0.10.0');
  assert.equal(entry.dependencies['@kubohiroya/turbowarp-tmpose'], '1.12.0');
  assert.equal(entry.rollback.fixVersion, 'publish-4.0.0-rc.9');
  assert.equal(previousEntry.version, '4.0.0-rc.7');
  assert.equal(previousEntry.dependencies['@kubohiroya/turbowarp-bubble'], '0.7.0');
  assert.equal(previousEntry.dependencies['@kubohiroya/turbowarp-tmpose'], '1.12.0');
  assert.match(history, /23 core action/u);
  assert.match(history, /rc\.6以前のversion付きSB3/u);
  assert.match(history, /4\.0\.0-rc\.9/u);
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
