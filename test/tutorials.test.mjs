import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {documentationConfig} from '../docs/config.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const tutorialRoot = path.join(projectRoot, 'docs/tutorials');
const navigationContract = JSON.parse(
  readFileSync(path.join(tutorialRoot, 'navigation-contract.json'), 'utf8'),
);
const screenshotManifest = JSON.parse(
  readFileSync(path.join(tutorialRoot, 'screenshots.json'), 'utf8'),
);
const tutorialSources = Object.fromEntries(
  ['README.md', 'play.md', 'create.md'].map((filename) => [
    filename,
    readFileSync(path.join(tutorialRoot, filename), 'utf8'),
  ]),
);

function screenshotMarkers(source) {
  return [...source.matchAll(/<!-- screenshot:([PC]-\d{2}) -->/gu)].map((match) => match[1]);
}

test('keeps the active navigation contract separate from tutorial drafts', () => {
  assert.equal(navigationContract.status, 'active');
  assert.equal(screenshotManifest.status, 'blocked-until-dsl4-release');
  assert(
    documentationConfig.documents.every((document) => document.sourceDirectory !== 'tutorials'),
  );

  const publicIndex = readFileSync(path.join(projectRoot, 'site/index.html'), 'utf8');
  assert.match(publicIndex, /ワークショップ<\/a/iu);
  assert.doesNotMatch(publicIndex, /チュートリアル<\/a/iu);
});

test('defines the active five-item AppBar and current-section rules', () => {
  assert.equal(navigationContract.formatVersion, 1);
  assert.deepEqual(
    navigationContract.items.map(({id, label}) => [id, label]),
    [
      ['home', 'トップ'],
      ['documents', 'ドキュメント'],
      ['workshops', 'ワークショップ'],
      ['samples', '作品'],
      ['downloads', 'ダウンロード'],
    ],
  );
  assert.equal(navigationContract.contractVersion, '1.0.0');
  assert.deepEqual(Object.keys(navigationContract.siteSettings).sort(), [
    'tmpose-kamishibai',
    'tmpose-kamishibai-docs',
    'tmpose-kamishibai-samples',
  ]);

  const itemIds = new Set(navigationContract.items.map(({id}) => id));
  for (const rule of navigationContract.currentSectionRules) assert(itemIds.has(rule.current));
  const workshopRuleIndex = navigationContract.currentSectionRules.findIndex(
    ({site, current}) => site === 'tmpose-kamishibai-docs' && current === 'workshops',
  );
  const documentRuleIndex = navigationContract.currentSectionRules.findIndex(
    ({site, current}) => site === 'tmpose-kamishibai-docs' && current === 'documents',
  );
  assert(workshopRuleIndex >= 0 && workshopRuleIndex < documentRuleIndex);

  assert.deepEqual(navigationContract.changeLocations.map(({repository}) => repository).sort(), [
    'kubohiroya/tmpose-kamishibai',
    'kubohiroya/tmpose-kamishibai-docs',
    'kubohiroya/tmpose-kamishibai-samples',
  ]);
  for (const location of navigationContract.changeLocations) assert(location.paths.length > 0);
});

test('maps every planned screenshot to a draft marker and a release gate', () => {
  assert.equal(screenshotManifest.formatVersion, 1);
  assert.equal(screenshotManifest.targetDslVersion, '4.0');

  const expectedIds = [
    ...Array.from({length: 8}, (_, index) => `P-${String(index + 1).padStart(2, '0')}`),
    ...Array.from({length: 13}, (_, index) => `C-${String(index + 1).padStart(2, '0')}`),
  ];
  const captureIds = screenshotManifest.captures.map(({id}) => id);
  assert.deepEqual(captureIds.sort(), expectedIds.sort());
  assert.equal(new Set(captureIds).size, captureIds.length);

  const markers = [
    ...screenshotMarkers(tutorialSources['play.md']),
    ...screenshotMarkers(tutorialSources['create.md']),
  ];
  assert.deepEqual(markers.sort(), expectedIds.sort());
  assert.equal(new Set(markers).size, markers.length);

  const createCaptureSteps = Object.fromEntries(
    screenshotManifest.captures
      .filter(({tutorial}) => tutorial === 'create')
      .map(({id, step}) => [id, step]),
  );
  assert.deepEqual(createCaptureSteps, {
    'C-01': 2,
    'C-02': 3,
    'C-03': 3,
    'C-04': 3,
    'C-05': 4,
    'C-06': 4,
    'C-07': 5,
    'C-08': 5,
    'C-09': 5,
    'C-10': 6,
    'C-11': 7,
    'C-12': 9,
    'C-13': 1,
  });

  const gateIds = new Set(screenshotManifest.gates.map(({id}) => id));
  assert(screenshotManifest.gates.every(({ready}) => ready === false));
  for (const capture of screenshotManifest.captures) {
    assert(['play', 'create'].includes(capture.tutorial));
    assert(capture.gates.length > 0);
    assert(capture.gates.every((gate) => gateIds.has(gate)));
    assert(capture.captionDraft.length > 0);
    assert(capture.altDraft.length > 0);
    if (capture.reuseOf === undefined) {
      assert(
        capture.filename.startsWith(
          `docs/images/tutorials/dsl4/${capture.tutorial}/tutorial-${capture.tutorial}-`,
        ),
      );
      assert(capture.filename.endsWith('.png'));
    } else {
      assert(captureIds.includes(capture.reuseOf));
      assert.equal(capture.status, 'reuse');
    }
  }

  const optionalCaptures = screenshotManifest.captures.filter(({required}) => !required);
  assert(optionalCaptures.every(({conditional}) => conditional.length > 0));
});

test('keeps the source drafts reviewable before screenshots exist', () => {
  assert.match(tutorialSources['README.md'], /DSL 4\.0リリース前draft/u);
  assert.match(tutorialSources['README.md'], /\/tutorials\/play\//u);
  assert.match(tutorialSources['README.md'], /\/tutorials\/create\//u);
  assert.match(tutorialSources['play.md'], /## 完了チェック/u);
  assert.match(tutorialSources['create.md'], /Scratch\s*ブロックを追加しません/u);
  assert.match(tutorialSources['create.md'], /```yaml[\s\S]*kamishibai: '4\.0'/u);
  assert.match(tutorialSources['create.md'], /project root directoryを選択/u);
  assert.match(tutorialSources['create.md'], /file: new-beach\.svg/u);
  assert.doesNotMatch(tutorialSources['create.md'], /├── assets\/[\s\S]*└── pose-models\//u);
});
