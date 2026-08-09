import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const authorGuide = read('docs/dsl-author-guides/dsl-4.0-author-guide.md');
const tutorialReadme = read('docs/tutorials/README.md');
const createTutorial = read('docs/tutorials/create.md');

test('separates the tutorial learning path from the author guide reference role', () => {
  assert.match(authorGuide, /## チュートリアルと本書の使い分け/u);
  assert.match(authorGuide, /最初の作品を\s*完成させるための短い実習/u);
  assert.match(authorGuide, /本書を最初から最後まで通読する必要はありません/u);
  assert.match(authorGuide, /Schemaリファレンスで確認/u);
  assert.match(authorGuide, /大人向け概要 → 本書の記法 → 最小台本/u);
  assert.match(authorGuide, /Projectのfileを配置する → Web Preview → 診断と安全停止/u);
  assert.match(authorGuide, /補足.*Source Graph、全action、詳細な制約/u);
});

test('defines tutorial scope, canonical sample ownership, and release stages', () => {
  assert.match(tutorialReadme, /## 台本作成ガイドとの役割分担/u);
  assert.match(tutorialReadme, /最初の作品を完成させるための最短経路/u);
  assert.match(tutorialReadme, /`tmpose-kamishibai-samples`を正本/u);
  assert.match(tutorialReadme, /完全なsample YAMLや\s*配布物を複製して保守しません/u);
  assert.match(tutorialReadme, /固定commit、\s*starter version、artifact URL、integrity、license/u);
  assert.match(tutorialReadme, /capture gateが未完了/u);
});

test('keeps the create tutorial minimal and separate from 3.x migration', () => {
  assert.match(createTutorial, /## このチュートリアルと作者ガイドの違い/u);
  assert.match(createTutorial, /成果物は変更したYAMLから検証済みの自己完結SB3を再生/u);
  assert.match(createTutorial, /全action、Source Graph、分岐、custom action/u);
  assert.match(createTutorial, /DSL 3\.1／3\.2のTXT／SB3操作や変換は扱いません/u);
  assert.match(createTutorial, /正式starter、sample、UI、commandが固定される前/u);
});
