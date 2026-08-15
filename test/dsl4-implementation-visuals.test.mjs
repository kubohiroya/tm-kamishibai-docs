import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import test from 'node:test';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url));
const readText = (relativePath) => read(relativePath).toString('utf8');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const record = readText('DSL4-IMPLEMENTATION-VISUALS.md');
const adultOverview = readText('docs/user-guides/executive-summary-adult-4.0.md');
const implementationWalkthrough = readText(
  'docs/developer-guides/dsl4-implementation-walkthrough.md',
);
const internalSpecification = readText('docs/developer-guides/internal-specification-4.0.md');

const captures = [
  {
    path: 'docs/images/dsl4-rc5-preview-running.png',
    width: 1280,
    height: 720,
    sha256: '0dcdaa7868ab8ade918acf1f3cae1114edb563bffe47d68e050b5fe975805a91',
  },
  {
    path: 'docs/images/dsl4-rc5-runtime-title.png',
    width: 480,
    height: 220,
    sha256: 'c5e7b05d9c74b1106c7caf7941aa01db4f219087806dc09f0663d4ba975ca661',
  },
  {
    path: 'docs/images/dsl4-rc5-preview-diagnostic.png',
    width: 1280,
    height: 720,
    sha256: '0635c284d021995ce2a906758dbca389a581abcb9bd7c447bea90b95ddfc21bb',
  },
];

const diagrams = [
  ['dsl4-architecture.svg', 'a2ca23bba32558b2c21823980465ce6f4b79307571b731679f5e571d76c63ec4'],
  [
    'dsl4-source-build-sequence.svg',
    'f068ad123ac046ca81fbc70375e6d39b17ad8e5a43e4290b4751fad32189137e',
  ],
  [
    'dsl4-runtime-state-transition.svg',
    'a3b8c8e6d721148abedf1efa5921f96d633d190a89d4d9341be247154d49cbc5',
  ],
  ['dsl4-runtime-sequence.svg', 'ffca3dcaf77ea464fb6dfd935bd62cefd3ec436abfd2312091b26ae783490195'],
  [
    'dsl4-live-reload-state-transition.svg',
    '5791b077856e6fe882e3920d411e28d443c513da4e728e1ce2658bfabb142a8c',
  ],
  [
    'dsl4-live-reload-sequence.svg',
    'fa287d98d46880c43a18768aa02e22c8aa4f76c2dc554b09a8fff950cc544c99',
  ],
  [
    'dsl4-asset-reload-sequence.svg',
    '65c1abdb6f637f761c7d3ba4ce49bdf16e4e3df84bca51693dcd93f7e08649e1',
  ],
];

test('pins every rc5 implementation screenshot to valid PNG bytes', () => {
  for (const capture of captures) {
    const bytes = read(capture.path);
    assert.deepEqual([...bytes.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.equal(bytes.readUInt32BE(16), capture.width);
    assert.equal(bytes.readUInt32BE(20), capture.height);
    assert.equal(sha256(bytes), capture.sha256);
    assert.match(record, new RegExp(capture.path.replaceAll('.', '\\.')));
    assert.match(record, new RegExp(capture.sha256));
    assert.match(
      implementationWalkthrough,
      new RegExp(capture.path.split('/').at(-1).replaceAll('.', '\\.')),
    );
  }
});

test('pins accessible implementation-analysis SVGs and publishes every diagram', () => {
  for (const [filename, expectedSha256] of diagrams) {
    const path = `docs/images/${filename}`;
    const source = readText(path);
    assert.equal(sha256(read(path)), expectedSha256);
    assert.match(source, /^<svg[^>]+role="img"[^>]+aria-labelledby="title desc"/u);
    assert.match(source, /<title id="title">[^<]+<\/title>/u);
    assert.match(source, /<desc id="desc">[^<]+<\/desc>/u);
    assert.match(record, new RegExp(path.replaceAll('.', '\\.')));
    assert.match(record, new RegExp(expectedSha256));
    assert.match(internalSpecification, new RegExp(`\.\./images/${filename}`, 'u'));
  }
});

test('labels the evidence as published rc5 rather than stable v4.0.0', () => {
  assert.match(record, /公開プレリリース`v4\.0\.0-rc\.5`/u);
  assert.match(record, /f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6/u);
  assert.match(record, /\| samples repository\s+\| 使用せず/u);
  assert.match(implementationWalkthrough, /公開プレリリース`4\.0\.0-rc\.5`/u);
  assert.match(implementationWalkthrough, /tmpose-kamishibai-samples`は取得・build・変更しません/u);
  assert.doesNotMatch(record, /8ea06bfd|dc9f6626/u);
});

test('keeps rc5 evidence in developer material and removes superseded screenshots', () => {
  assert.doesNotMatch(adultOverview, /dsl4-rc5-[^"\s]+\.png/u);
  assert.equal(
    (implementationWalkthrough.match(/dsl4-rc5-[^\s)]+\.png/gu) ?? []).length,
    captures.length,
  );
  for (const filename of [
    'dsl4-implementation-title.jpg',
    'dsl4-implementation-pose-feedback.jpg',
  ]) {
    assert.doesNotMatch(record, new RegExp(filename, 'u'));
    assert.equal(existsSync(new URL(`../docs/images/${filename}`, import.meta.url)), false);
  }
});

test('links diagrams to the rc5 implementation boundaries and tests', () => {
  for (const implementationName of [
    'createDsl4SourceGraph',
    'createDsl4SourceFrontend.parse',
    'createStoryDocument',
    'createDsl4RuntimeController.dispatch',
    'createDsl4TurboWarpRuntimeEnvironment',
    'live-reload-session.js',
    'asset-reload-transaction.js',
  ]) {
    assert.match(internalSpecification, new RegExp(implementationName.replaceAll('.', '\\.'), 'u'));
  }
  assert.match(internalSpecification, /図と実装の追跡表/u);
});

test('keeps runtime execution state distinct from live reload coordination state', () => {
  const runtimeStateDiagram = readText('docs/images/dsl4-runtime-state-transition.svg');
  const reloadStateDiagram = readText('docs/images/dsl4-live-reload-state-transition.svg');

  assert.match(runtimeStateDiagram, /1個のRuntimeController/u);
  assert.match(runtimeStateDiagram, /現在の1 generationをどう再生/u);
  assert.match(reloadStateDiagram, /1個のLiveReloadSession/u);
  assert.match(reloadStateDiagram, /current runtimeとcandidateの更新をどう調停/u);
  assert.match(internalSpecification, /二つの状態機械は階層が異なり、同じ時点に\*\*併存\*\*/u);
  assert.match(internalSpecification, /`current\.runtime\.status`/u);
  assert.match(internalSpecification, /`running`\s*\| `invalid`/u);
  assert.match(internalSpecification, /`finished`\s*\| `active`/u);
  assert.match(internalSpecification, /`stopped`\s*\| `failed`/u);
  assert.match(implementationWalkthrough, /同じ状態を言い換えた図ではありません/u);
});
