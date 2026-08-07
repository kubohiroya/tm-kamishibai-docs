import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig} from '../docs/config.mjs';

const rootIndex = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const dsl32Index = readFileSync(new URL('../site/3.2/index.html', import.meta.url), 'utf8');
const dsl40Index = readFileSync(new URL('../site/4.0/index.html', import.meta.url), 'utf8');
const workshopIndex = readFileSync(
  new URL('../site/workshops/index.html', import.meta.url),
  'utf8',
);
const documentIndexCss = readFileSync(
  new URL('../site/document-index.css', import.meta.url),
  'utf8',
);

test('keeps version selection and camera privacy guidance on the site root', () => {
  assert.match(rootIndex, /<h1>紙芝居DSLの版を選ぶ<\/h1>/u);
  assert.equal((rootIndex.match(/class="version-banner version-banner--/gu) ?? []).length, 2);
  assert.doesNotMatch(rootIndex, /common-content|3\.2／4\.0 共通コンテンツ/u);
  assert.doesNotMatch(rootIndex, /href="workshops\/"/u);
  assert.doesNotMatch(rootIndex, /class="actions"/u);
  assert.doesNotMatch(rootIndex, /publication\.json/u);
  assert.match(rootIndex, /href="3\.2\/">DSL 3\.2のドキュメントへ/u);
  assert.match(rootIndex, /href="4\.0\/">DSL 4\.0のドキュメントへ/u);
  assert.ok(rootIndex.indexOf('version-banner--40') < rootIndex.indexOf('version-banner--32'));

  for (const document of documentationConfig.documents) {
    const basename = document.sourceFilename.replace(/\.md$/u, '');
    assert.doesNotMatch(rootIndex, new RegExp(`${basename}/`, 'u'));
  }
});

test('explains camera privacy immediately after the version banners', () => {
  const bannersStart = rootIndex.indexOf('<div class="version-banners"');
  const privacyStart = rootIndex.indexOf('<aside class="camera-privacy"');
  const mainEnd = rootIndex.indexOf('</main>');
  const privacy = rootIndex.slice(privacyStart, mainEnd);

  assert.ok(bannersStart >= 0);
  assert.ok(privacyStart > bannersStart);
  assert.ok(mainEnd > privacyStart);
  assert.match(privacy, /このアプリにおけるカメラ利用について/u);
  assert.match(privacy, /紙芝居を作成するとき/u);
  assert.match(privacy, /紙芝居を鑑賞するとき/u);
  assert.match(privacy, /ファイルにはサンプル画像が含まれます/u);
  assert.match(privacy, /元のサンプル画像そのものは含まれません/u);
  assert.match(privacy, /カメラの画像を外部へアップロードしません/u);
  assert.match(privacy, /学習済みモデルを紙芝居自体に含めて配布でき/u);
  assert.match(privacy, /モデル取得のための通信は行いません/u);
  assert.match(privacy, /記録・保存する機能はありません/u);
  assert.match(documentIndexCss, /\.camera-privacy__grid/u);
  assert.match(
    documentIndexCss,
    /@media \(max-width: 700px\)[\s\S]*\.camera-privacy__grid\s*\{\s*grid-template-columns: 1fr/u,
  );
});

test('styles camera privacy guidance independently from DSL version banners', () => {
  const version40Styles = documentIndexCss.match(/\.version-banner--40\s*\{([^}]*)\}/u)?.[1];
  const privacyStyles = documentIndexCss.match(/\.camera-privacy\s*\{([^}]*)\}/u)?.[1];
  const version40Accent = version40Styles?.match(/--version-accent:\s*(#[0-9a-f]{6})/u)?.[1];
  const version40Tint = version40Styles?.match(/--version-tint:\s*(#[0-9a-f]{6})/u)?.[1];
  const privacyAccent = privacyStyles?.match(/--privacy-accent:\s*(#[0-9a-f]{6})/u)?.[1];
  const privacyTint = privacyStyles?.match(/--privacy-tint:\s*(#[0-9a-f]{6})/u)?.[1];

  assert.ok(version40Accent);
  assert.ok(version40Tint);
  assert.ok(privacyAccent);
  assert.ok(privacyTint);
  assert.notEqual(privacyAccent, version40Accent);
  assert.notEqual(privacyTint, version40Tint);
  assert.match(privacyStyles, /background:[^;]*var\(--privacy-tint\)/u);
});

test('publishes each document only from its version-specific top page', () => {
  for (const document of documentationConfig.documents) {
    const basename = document.sourceFilename.replace(/\.md$/u, '');
    const versionIndex = document.version === '3.2' ? dsl32Index : dsl40Index;
    const otherVersionIndex = document.version === '3.2' ? dsl40Index : dsl32Index;
    const localDirectory = `${document.legacyOutputDirectory}/${basename}`;

    assert.match(versionIndex, new RegExp(`href="${localDirectory}/"`, 'u'));
    assert.match(
      versionIndex,
      new RegExp(
        `tmpose-kamishibai-docs/${document.outputDirectory}/${basename}/publication\\.json`,
        'u',
      ),
    );
    assert.doesNotMatch(otherVersionIndex, new RegExp(`href="${localDirectory}/"`, 'u'));
    assert.doesNotMatch(versionIndex, new RegExp(`href="${localDirectory}\\.pdf"`, 'u'));
  }
});

test('keeps publication actions on their dedicated version and workshop pages', () => {
  const dsl32Actions = [...dsl32Index.matchAll(/<div class="actions">([\s\S]*?)<\/div>/gu)];
  const dsl40Actions = [...dsl40Index.matchAll(/<div class="actions">([\s\S]*?)<\/div>/gu)];
  const workshopActions = [...workshopIndex.matchAll(/<div class="actions">([\s\S]*?)<\/div>/gu)];
  const dsl32Documents = documentationConfig.documents.filter(({version}) => version === '3.2');
  const dsl40Documents = documentationConfig.documents.filter(({version}) => version === '4.0');

  assert.equal(dsl32Actions.length, dsl32Documents.length);
  assert.equal(dsl40Actions.length, dsl40Documents.length);
  assert.equal(workshopActions.length, 2);
  for (const [, actions] of dsl32Actions) {
    assert.deepEqual(linkLabels(actions), ['HTML', 'Vivliostyle Viewer']);
  }
  for (const [, actions] of workshopActions) {
    assert.deepEqual(linkLabels(actions), ['HTML', 'Vivliostyle Viewer', 'PDF']);
  }
  for (const [, actions] of dsl40Actions) {
    assert.deepEqual(linkLabels(actions), ['HTML', 'Vivliostyle Viewer']);
  }
});

test('keeps the two version tops independent', () => {
  const dsl40Content = dsl40Index.replace(/<nav class="version-switch"[\s\S]*?<\/nav>/u, '');

  assert.match(dsl32Index, /<h1>紙芝居DSL 3\.2 ドキュメント<\/h1>/u);
  assert.match(dsl40Index, /<h1>紙芝居DSL 4\.0 ドキュメント<\/h1>/u);
  assert.doesNotMatch(dsl32Index, /kamishibai: '4\.0'|Source Graph/u);
  assert.doesNotMatch(dsl40Content, /kamishibai=3\.[12]|DSL 3\.[12]/u);
  assert.match(dsl32Index, /href="\.\.\/4\.0\/">DSL 4\.0へ切り替える/u);
  assert.match(dsl40Index, /href="\.\.\/3\.2\/">DSL 3\.2へ切り替える/u);
});

test('explains how to choose between the versions on the root page', () => {
  assert.match(rootIndex, /既存作品を継続/u);
  assert.match(rootIndex, /新規制作を開始/u);
  assert.match(rootIndex, /kamishibai=3\.2/u);
  assert.match(rootIndex, /<code>\.txt<\/code>/u);
  assert.match(rootIndex, /kamishibai: '4\.0'/u);
  assert.match(rootIndex, /<code>\.k4\.yml<\/code>/u);
  assert.match(rootIndex, /Source Graph/u);
  assert.match(documentIndexCss, /\.version-banner__primary:focus-visible/u);
  assert.match(rootIndex, /aria-labelledby="version-32-title"/u);
  assert.match(rootIndex, /aria-labelledby="version-40-title"/u);
});

test('lists workshop material chronologically with explicit DSL families', () => {
  const dsl40Position = workshopIndex.indexOf('id="workshops-40"');
  const dsl32Position = workshopIndex.indexOf('id="workshops-32"');

  assert.ok(dsl40Position >= 0);
  assert.ok(dsl32Position > dsl40Position);
  assert.match(workshopIndex, /<h2 id="workshops-40">DSL 4\.0系<\/h2>/u);
  assert.match(workshopIndex, /現在公開中の資料はありません/u);
  assert.match(workshopIndex, /<h2 id="workshops-32">DSL 3\.2系<\/h2>/u);
  assert.match(workshopIndex, /<time datetime="2026-08-01">2026年8月1日<\/time>/u);
  assert.match(workshopIndex, /href="2026-08-01\/"/u);
  assert.match(workshopIndex, /href="2026-08-01\/staff\/"/u);
  assert.match(workshopIndex, /href="https:\/\/www\.chibanippo\.co\.jp\/articles\/1648690"/u);
  assert.match(workshopIndex, /千葉日報オンライン（有料）/u);
  assert.match(workshopIndex, /ＡＩプログラミング体験会　千葉商大で親子学ぶ　市川/u);
  assert.match(workshopIndex, /<time datetime="2026-08-02">2026年8月2日<\/time>公開/u);
  const normalizedWorkshopIndex = workshopIndex.replace(/\s+/gu, ' ');
  const cucEventPosition = normalizedWorkshopIndex.indexOf(
    '[実施済み] 親子AIプログラミング体験会(千葉商科大学イベント)',
  );
  const participantMaterialPosition =
    normalizedWorkshopIndex.indexOf('「親子AIプログラミング体験会」参加者向け資料');
  assert.ok(cucEventPosition >= 0);
  assert.ok(participantMaterialPosition > cucEventPosition);
  assert.match(
    workshopIndex,
    /href="https:\/\/www\.cuc\.ac\.jp\/event\/2026\/ai_programming0801\.html"/u,
  );
  assert.match(workshopIndex, /小学生以上を対象とした「親子AIプログラミング体験会」/u);
  assert.match(workshopIndex, /AI技術を応用した紙芝居アプリ/u);
  assert.doesNotMatch(dsl32Index, /体験会資料|workshops\/2026-08-01/u);
  assert.doesNotMatch(dsl40Index, /体験会資料|workshops\/2026-08-01/u);
});

test('provides the workshop menu in every static AppBar', () => {
  for (const index of [rootIndex, dsl32Index, dsl40Index, workshopIndex]) {
    assert.match(
      index,
      /href="https:\/\/kubohiroya\.github\.io\/tmpose-kamishibai-docs\/workshops\/"/u,
    );
    assert.match(index, /<main id="main-content"[^>]*tabindex="-1"/u);
  }
  assert.match(
    workshopIndex,
    /href="https:\/\/kubohiroya\.github\.io\/tmpose-kamishibai-docs\/workshops\/"\s+aria-current="page"/u,
  );
});

function linkLabels(actions) {
  return [...actions.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/gu)].map(([, label]) =>
    label.replace(/\s+/gu, ' ').trim(),
  );
}
