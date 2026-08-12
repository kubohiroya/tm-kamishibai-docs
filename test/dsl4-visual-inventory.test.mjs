import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const inventory = read('DSL4-VISUAL-INVENTORY.md');
const kidsOverview = read('docs/user-guides/executive-summary-kids-4.0.md');

const dsl4Publications = [
  'executive-summary-adult-4.0',
  'executive-summary-kids-4.0',
  'dsl-4.0-author-guide',
  'dsl-4.0-schema-reference',
  'dsl-3.2-to-4.0-conversion-guide',
  'application-materials-guide-4.0',
  'developer-guide-4.0',
  'internal-specification-4.0',
  'extension-guide-4.0',
  'dsl-4.0-diagnostics-design',
  'release-smoke-4.0',
];

test('records a visual decision for every DSL 4.0 publication', () => {
  assert.match(inventory, /対象: `docs\/config\.mjs`で4\.0として公開する11 publication/u);

  for (const publication of dsl4Publications) {
    assert.match(inventory, new RegExp(publication.replaceAll('.', '\\.')));
  }

  assert.match(inventory, /既存図で十分/u);
  assert.match(inventory, /文章・表で十分/u);
  assert.match(inventory, /P1判定の結果/u);
  assert.match(inventory, /P2・P3の扱い/u);
});

test('adds the release-independent P1 safety-stop flow to the kids overview', () => {
  const figure = kidsOverview.match(
    /<figure class="concept-flow"><figcaption>困ったときに安全に止める順番<\/figcaption>[\s\S]*?<\/figure>/u,
  )?.[0];

  assert.ok(figure);
  assert.equal((figure.match(/<span>/gu) ?? []).length, 5);
  assert.equal((figure.match(/<b aria-hidden="true">→<\/b>/gu) ?? []).length, 4);
  assert.match(figure, /カメラ、マイク、個人情報を求められたとき/u);
});

test('keeps formal UI captures in their existing release-gated issues', () => {
  assert.match(inventory, /#34、#41、#47のcapture台帳/u);
  assert.match(inventory, /未確定UI画像を置かない/u);
  assert.match(inventory, /正式UIが必要な項目は本台帳で代替図を作らず/u);
});
