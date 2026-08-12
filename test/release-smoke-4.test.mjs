import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';
import candidate from '../sources/dsl4/release-smoke-4.0-candidate.json' with {type: 'json'};

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const guide = read('docs/developer-guides/release-smoke-4.0.md');
const dsl4Index = read('site/4.0/index.html');

test('publishes the DSL 4.0 smoke guide as an independent publication', () => {
  const publication = documentationConfig.documents.find(
    ({sourceFilename}) => sourceFilename === 'release-smoke-4.0.md',
  );

  assert.equal(publication?.version, '4.0');
  assert.equal(publication?.outputDirectory, '4.0/developer-guides');
  assert.match(dsl4Index, /developer-guides\/release-smoke-4\.0\//u);
  assert.match(
    dsl4Index,
    /vivliostyle\.org\/viewer\/#src=https:\/\/kubohiroya\.github\.io\/tmpose-kamishibai-docs\/4\.0\/developer-guides\/release-smoke-4\.0\/publication\.json/u,
  );
});

test('pins the candidate and all distributable artifacts by checksum', () => {
  assert.equal(candidate.status, 'verified-release-candidate');
  assert.match(candidate.runtime.candidateCommit, /^[0-9a-f]{40}$/u);
  assert.match(candidate.runtime.schema.sha256, /^[0-9a-f]{64}$/u);
  assert.match(candidate.runtime.standardArtifact.sha256, /^[0-9a-f]{64}$/u);
  assert.match(candidate.runtime.packageTarball.sha256, /^[0-9a-f]{64}$/u);
  assert.equal(candidate.runtime.packageTarball.publicationState, 'npm-publish-dry-run');
  assert.equal(candidate.samples.pullRequest, 91);

  for (const artifact of [
    candidate.samples.urashima.sb3,
    candidate.samples.urashima.web,
    candidate.samples.myUrashima.sb3,
    candidate.samples.myUrashima.web,
  ]) {
    assert(artifact.size > 0);
    assert.match(artifact.sha256, /^[0-9a-f]{64}$/u);
  }
});

test('records feature flags, physical evidence, automatic verification, and privacy', () => {
  assert.equal(candidate.runtime.featureFlags.defaultState, 'all-off');
  assert.deepEqual(candidate.runtime.featureFlags.standardProductionEnabled, [
    'dsl4Runtime',
    'dsl4AppShell',
    'dsl4PoseFeedbackModes',
    'dsl4SpeechAdvanceTypewriter',
  ]);
  assert.equal(candidate.evidence.physicalCameraAndPose.status, 'pass');
  assert.match(candidate.evidence.physicalCameraAndPose.record, /issuecomment-5255177777$/u);
  assert.equal(
    candidate.evidence.currentCandidateApplicability.sampleRuntimeIsCandidateAncestor,
    true,
  );
  assert.equal(candidate.evidence.currentCandidateApplicability.cameraPoseCorePathsChanged, false);
  assert.equal(candidate.evidence.upstreamVerification.status, 'pass');
  assert.equal(candidate.evidence.sampleVerification.status, 'pass');
  assert.equal(candidate.evidence.documentationVerification.status, 'pass');
  assert.equal(candidate.evidence.documentationVerification.tests, 94);
  assert.equal(
    candidate.evidence.documentationVerification.browserVisual.horizontalOverflow,
    false,
  );
  assert.equal(candidate.evidence.documentationVerification.browserVisual.brokenImages, 0);
  assert.equal(candidate.environment.cameraFrameStorage, false);
  assert.equal(candidate.environment.cameraDeviceLabel, 'not-retained');
});

test('defines all manual surfaces, release stops, rerun conditions, and rollback', () => {
  for (const heading of [
    'Browser Preview',
    'CLI Preview',
    'Production SB3とWeb版',
    '実カメラ・実ポーズの証跡',
    '診断と安全停止',
    'Release-stop条件',
    '証跡を保存する',
    '再実行条件',
    'Rollback',
  ]) {
    assert.match(guide, new RegExp(`^## ${heading.replaceAll('.', '\\.')}`, 'mu'));
  }

  assert.match(guide, /camera frame、人物画像、音声、device ID/u);
  assert.match(guide, /正式リリースを意味しません/u);
  assert.match(guide, /実カメラ、実ポーズ認識/u);
  assert.match(guide, /candidateを破棄し、`3\.2\.3`を推奨downloadとして維持/u);
  assert(candidate.releaseStops.length >= 8);
  assert.equal(candidate.rollback.recommendedVersion, '3.2.3');
});

test('does not carry obsolete DSL 3.x diagnostics or flag names into the DSL 4.0 procedure', () => {
  assert.doesNotMatch(guide, /unsupported-version/u);
  assert.doesNotMatch(guide, /featureDetailedScriptErrors/u);
});
