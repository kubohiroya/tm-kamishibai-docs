import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url));
const readText = (relativePath) => read(relativePath).toString('utf8');

const record = readText('DSL4-IMPLEMENTATION-VISUALS.md');
const adultOverview = readText('docs/user-guides/executive-summary-adult-4.0.md');
const internalSpecification = readText('docs/developer-guides/internal-specification-4.0.md');
const theme = readText('docs/general-theme.css');

const captures = [
  {
    path: 'docs/images/dsl4-implementation-title.jpg',
    sha256: '23c93cd48642e28f626a3d509538cb6653cc7022ad6a6e990d382da524e674a2',
  },
  {
    path: 'docs/images/dsl4-implementation-scene.jpg',
    sha256: '563fb1e5aa0438a0f615e2078474b21f44e900b075b7697220b23444c20aba65',
  },
  {
    path: 'docs/images/dsl4-implementation-pose-feedback.jpg',
    sha256: '25418684648f1876dff8c612695c295bcc2219dd6626f2dee6e98f5bc6286fbe',
  },
];

test('pins every implementation screenshot to its captured JPEG bytes', () => {
  for (const capture of captures) {
    const bytes = read(capture.path);
    assert.deepEqual([...bytes.subarray(0, 3)], [0xff, 0xd8, 0xff]);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), capture.sha256);
    assert.match(record, new RegExp(capture.path.replaceAll('.', '\\.')));
    assert.match(record, new RegExp(capture.sha256));
  }
});

test('labels the captures as implementation evidence instead of a formal release', () => {
  assert.match(record, /正式公開されたプレイヤーの操作証跡ではありません/u);
  assert.match(record, /8ea06bfd100b106f559cb25a280fab5570e42919/u);
  assert.match(record, /dc9f6626de9ef85ca71312402fd139082922b867/u);
  assert.match(adultOverview, /正式公開プレイヤーの操作説明ではありません/u);
  assert.match(adultOverview, /GitHub Releasesでの正式公開を示しません/u);
});

test('publishes captions, alt text, responsive gallery, and the implementation call map', () => {
  for (const capture of captures) {
    assert.match(adultOverview, new RegExp(capture.path.split('/').at(-1).replaceAll('.', '\\.')));
  }
  assert.equal((adultOverview.match(/dsl4-implementation-[^"]+\.jpg/gu) ?? []).length, 3);
  assert.ok((adultOverview.match(/<figcaption>/gu) ?? []).length >= 3);
  assert.match(theme, /\.dsl4-snapshot-gallery\s*\{[\s\S]*?grid-template-columns: repeat\(2/u);
  assert.match(
    theme,
    /@media screen and \(max-width: 640px\)[\s\S]*?\.dsl4-snapshot-gallery[\s\S]*?grid-template-columns: 1fr/u,
  );
  assert.match(internalSpecification, /固定実装をsourceから実画面まで追う主要呼出し経路/u);
  assert.match(internalSpecification, /createDsl4RuntimeController\.dispatch/u);
  assert.equal((internalSpecification.match(/<section><strong>[^<]+<\/strong>/gu) ?? []).length, 3);
});
