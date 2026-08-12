import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import {parse} from 'yaml';

import {documentationConfig} from '../docs/config.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const tutorialRoot = path.join(projectRoot, 'docs/tutorials');
const navigationContract = JSON.parse(
  readFileSync(path.join(tutorialRoot, 'navigation-contract.json'), 'utf8'),
);
const screenshotManifest = JSON.parse(
  readFileSync(path.join(tutorialRoot, 'screenshots.json'), 'utf8'),
);
const packageManifest = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const dsl4Schema = JSON.parse(
  readFileSync(path.join(projectRoot, 'sources/dsl4/dsl-4.schema.json'), 'utf8'),
);
const tutorialSources = Object.fromEntries(
  ['README.md', 'index.md', 'play.md', 'create.md'].map((filename) => [
    filename,
    readFileSync(path.join(tutorialRoot, filename), 'utf8'),
  ]),
);
const implementationWalkthrough = readFileSync(
  path.join(projectRoot, 'docs/developer-guides/dsl4-implementation-walkthrough.md'),
  'utf8',
);

function screenshotMarkers(source) {
  return [...source.matchAll(/<!-- screenshot:([PC]-\d{2}) -->/gu)].map((match) => match[1]);
}

function yamlBlocksBetween(source, startHeading, endHeading) {
  const start = source.indexOf(startHeading);
  const end = source.indexOf(endHeading, start + startHeading.length);
  assert(start >= 0 && end > start);
  return [...source.slice(start, end).matchAll(/```yaml\n([\s\S]*?)\n```/gu)].map(
    (match) => match[1],
  );
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
  assert.equal(screenshotManifest.formatVersion, 2);
  assert.equal(screenshotManifest.targetDslVersion, '4.0');
  assert.equal(
    screenshotManifest.implementationBaseline.commit,
    '8ea06bfd100b106f559cb25a280fab5570e42919',
  );
  assert.equal(
    screenshotManifest.sampleBaseline.commit,
    'dc9f6626de9ef85ca71312402fd139082922b867',
  );
  assert.equal(screenshotManifest.sampleBaseline.formalCaptureReuse, false);
  assert.equal(
    screenshotManifest.sampleBaseline.walkthrough,
    '../developer-guides/dsl4-implementation-walkthrough.md',
  );
  assert.deepEqual(screenshotManifest.capturePolicy.viewport, {width: 1280, height: 720});
  assert.equal(screenshotManifest.capturePolicy.deviceScaleFactor, 1);
  assert.equal(screenshotManifest.capturePolicy.locale, 'ja-JP');
  assert.equal(screenshotManifest.capturePolicy.reducedMotion, true);
  assert.equal(screenshotManifest.capturePolicy.sourcePathsVisible, false);

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
  assert.deepEqual(
    Object.fromEntries(
      screenshotManifest.gates.map(({id, progressStatus}) => [id, progressStatus]),
    ),
    {
      'dsl4-release': 'blocked',
      'tutorial-sample': 'partial',
      'app-shell': 'partial',
      'preview-flow': 'implemented',
      'pose-feedback': 'implemented',
      'camera-controls': 'implemented',
      'cli-contract': 'partial',
      'capture-environment': 'partial',
    },
  );
  for (const gate of screenshotManifest.gates) {
    assert(['blocked', 'partial', 'implemented'].includes(gate.progressStatus));
    assert(gate.remaining.length > 0);
    if (gate.progressStatus !== 'blocked') assert(gate.evidence.length > 0);
  }
  assert(
    screenshotManifest.gates
      .find(({id}) => id === 'preview-flow')
      .dependencies.includes('https://github.com/kubohiroya/tmpose-kamishibai/issues/394'),
  );

  for (const capture of screenshotManifest.captures) {
    assert(['play', 'create'].includes(capture.tutorial));
    assert(capture.gates.length > 0);
    assert(capture.gates.every((gate) => gateIds.has(gate)));
    assert.equal(capture.status, 'blocked');
    const imageEntries = capture.frames ?? [capture];
    for (const imageEntry of imageEntries) {
      assert(imageEntry.captionDraft.length > 0);
      assert(imageEntry.altDraft.length > 0);
      assert(
        imageEntry.filename.startsWith(
          `docs/images/tutorials/dsl4/${capture.tutorial}/tutorial-${capture.tutorial}-`,
        ),
      );
      assert(imageEntry.filename.endsWith('.png'));
    }
  }

  const fixtureFrames = screenshotManifest.captures.flatMap((capture) =>
    capture.frames
      ? capture.frames.map(({sourceFixtureFrame}) => sourceFixtureFrame)
      : [capture.sourceFixtureFrame].filter(Boolean),
  );
  assert.deepEqual(fixtureFrames.sort(), [
    'camera-control-collision',
    'diagnostic-last-known-good',
    'dialog-position-selector',
    'dialog-scope-selector',
    'reloaded-action',
    'watching-top-right',
  ]);

  const reloadDialogCapture = screenshotManifest.captures.find(({id}) => id === 'C-05');
  assert.equal(reloadDialogCapture.frames.length, 2);
  assert.match(reloadDialogCapture.description, /2段階/u);

  const previewControlCapture = screenshotManifest.captures.find(({id}) => id === 'C-10');
  assert.equal(previewControlCapture.reuseOf, undefined);
  assert.equal(previewControlCapture.sourceFixtureFrame, 'camera-control-collision');
  assert(previewControlCapture.gates.includes('camera-controls'));
  assert.match(previewControlCapture.description, /重ならない/u);

  const optionalCaptures = screenshotManifest.captures.filter(({required}) => !required);
  assert(optionalCaptures.every(({conditional}) => conditional.length > 0));
});

test('keeps the source drafts reviewable before screenshots exist', () => {
  assert.match(tutorialSources['README.md'], /DSL 4\.0リリース前draft/u);
  assert.match(tutorialSources['README.md'], /\/tutorials\/play\//u);
  assert.match(tutorialSources['README.md'], /\/tutorials\/create\//u);
  assert.match(tutorialSources['play.md'], /## 完了チェック/u);
  assert.match(tutorialSources['create.md'], /Scratchのブロックは追加しません/u);
  assert.match(tutorialSources['create.md'], /```yaml[\s\S]*kamishibai: '4\.0'/u);
  assert.match(tutorialSources['create.md'], /tutorial-story`フォルダーそのものを選びます/u);
  assert.match(tutorialSources['create.md'], /addition-kit\/new-beach\.svg/u);
  assert.match(tutorialSources['create.md'], /addition-kit\/add-pose-scene\.yml\.txt/u);
  assert.match(tutorialSources['create.md'], /file: beach\.svg/u);
  assert.match(tutorialSources['create.md'], /file: turtle\.svg/u);
  assert.match(tutorialSources['create.md'], /file: new-beach\.svg/u);
  assert.match(
    tutorialSources['create.md'],
    /更新状態ボタン[\s\S]*「先頭から」[\s\S]*「今回だけ更新」/u,
  );
  assert.match(tutorialSources['create.md'], /poseModel: RescuePose/u);
  assert.match(tutorialSources['create.md'], /BeachTypo`を`Beach`へ戻して保存/u);
  assert.doesNotMatch(
    tutorialSources['create.md'],
    /candidate|session token|transactional|Story Path|severity|外周8方向/iu,
  );
  assert.doesNotMatch(tutorialSources['create.md'], /├── assets\/[\s\S]*└── pose-models\//u);
});

test('routes general users and script authors before implementation details', () => {
  assert.match(tutorialSources['index.md'], /\[紙芝居で遊ぶ\]\(play\.md\)/u);
  assert.match(tutorialSources['index.md'], /\[紙芝居を作る\]\(create\.md\)/u);
  assert.match(tutorialSources['index.md'], /10〜15分/u);
  assert.match(tutorialSources['index.md'], /60〜90分/u);
  assert.match(tutorialSources['index.md'], /最初にすること/u);
  assert.match(tutorialSources['index.md'], /迷ったら/u);
  assert.doesNotMatch(
    tutorialSources['index.md'],
    /repository|commit|SHA-256|CLI|Source Graph|candidate|port/iu,
  );

  assert.match(tutorialSources['play.md'], /\[紙芝居チュートリアル\]\(index\.md\)/u);
  assert.match(tutorialSources['play.md'], /## 最初にやること/u);
  assert.match(tutorialSources['play.md'], /台本やコマンドを入力する必要はありません/u);

  assert.match(tutorialSources['create.md'], /\[紙芝居チュートリアル\]\(index\.md\)/u);
  assert.match(tutorialSources['create.md'], /## 最初のゴール/u);
  assert.match(tutorialSources['create.md'], /ここではまだ編集せず、Step 1から順番に進めます/u);
  assert.match(tutorialSources['create.md'], /text: 助けて！/u);
  assert.match(tutorialSources['create.md'], /text: こんにちは！/u);
  assert.match(tutorialSources['create.md'], /Scratchのブロックは追加しません/u);

  const previewStep =
    tutorialSources['create.md'].indexOf('## 3. ブラウザーの確認画面で作品を開く');
  const editStep = tutorialSources['create.md'].indexOf('## 4. セリフを変更する');
  const changedDialogue = tutorialSources['create.md'].indexOf('text: こんにちは！');
  assert(previewStep >= 0 && previewStep < editStep && editStep < changedDialogue);
});

test('keeps the starter and every tutorial addition valid against the pinned DSL 4.0 Schema', () => {
  const createSource = tutorialSources['create.md'];
  const [starterBlock] = yamlBlocksBetween(
    createSource,
    '## 4. セリフを変更する',
    '## 5. 背景、登場人物、場面を追加する',
  );
  const starter = parse(starterBlock);
  const AjvConstructor = /** @type {any} */ (Ajv2020);
  const validate = new AjvConstructor({allErrors: true, strict: false}).compile(dsl4Schema);
  assert.equal(validate(starter), true, JSON.stringify(validate.errors));

  const [newAssets, newActor, newScene] = yamlBlocksBetween(
    createSource,
    '## 5. 背景、登場人物、場面を追加する',
    '## 6. ポーズ場面を追加する',
  ).map((block) => parse(block));
  Object.assign(starter, newAssets, newActor, newScene);

  const [poseAssets, poseScene] = yamlBlocksBetween(
    createSource,
    '## 6. ポーズ場面を追加する',
    '## 7. 診断を読んで修正する',
  ).map((block) => parse(block));
  Object.assign(starter, poseAssets, poseScene);
  assert.equal(validate(starter), true, JSON.stringify(validate.errors));
});

test('separates reader-facing screenshot text from capture-only implementation details', () => {
  const createCaptures = screenshotManifest.captures.filter(({tutorial}) => tutorial === 'create');
  const readerText = createCaptures
    .flatMap((capture) => capture.frames ?? [capture])
    .flatMap(({captionDraft, altDraft}) => [captionDraft, altDraft])
    .join('\n');
  assert.doesNotMatch(
    readerText,
    /candidate|kind|scene|action|reload status button|camera control|8方向/iu,
  );

  for (const id of ['C-05', 'C-08', 'C-10']) {
    const capture = createCaptures.find((candidate) => candidate.id === id);
    const notes = (capture.frames ?? [capture]).flatMap(({captureNotes = []}) => captureNotes);
    assert(notes.length > 0, `${id} must keep its implementation details in captureNotes`);
  }
});

test('keeps the reproducible implementation walkthrough in the developer guide', () => {
  assert.match(
    tutorialSources['README.md'],
    /\.\.\/developer-guides\/dsl4-implementation-walkthrough\.md/u,
  );
  assert.match(implementationWalkthrough, /開発者向け追試手順/u);
  assert.match(implementationWalkthrough, /8ea06bfd100b106f559cb25a280fab5570e42919/u);
  assert.match(implementationWalkthrough, /dc9f6626de9ef85ca71312402fd139082922b867/u);
  assert.match(implementationWalkthrough, /validate-dsl4/u);
  assert.match(implementationWalkthrough, /urashima\.k4\.yml: valid/u);
  assert.match(
    implementationWalkthrough,
    /9ff92d07fb6851ddb07cc6f13d20fc9023b2c90605d2533fec89cb9fdbb1faa2/u,
  );
  assert.match(
    implementationWalkthrough,
    /a198352ed1785261fe41ba1b0333914664ca33434da1a9bf3ba9dc56ba81de1a/u,
  );
  assert.match(
    implementationWalkthrough,
    /6a458145f63df77a80258c5ec2956f0608a1b7e2cedd290db0267e1328dc5ae1/u,
  );
  for (const filename of [
    'dsl4-implementation-title.jpg',
    'dsl4-implementation-pose-feedback.jpg',
  ]) {
    assert.match(implementationWalkthrough, new RegExp(`\\.\\./images/${filename}`, 'u'));
  }
  assert.doesNotMatch(implementationWalkthrough, /<!-- screenshot:[PC]-\d{2} -->/u);
  assert.doesNotMatch(implementationWalkthrough, /正式公開プレイヤーの操作説明です/u);
  assert.match(packageManifest.scripts.format, /dsl4-implementation-walkthrough/u);
});
