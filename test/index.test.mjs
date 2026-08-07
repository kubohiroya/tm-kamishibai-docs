import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {documentationConfig, documentCollections} from '../docs/config.mjs';

const index = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');

test('publishes each document in its reader-oriented directory', () => {
  assert.doesNotMatch(index, /tmpose-kamishibai\/docs\//u);
  assert.doesNotMatch(index, /href="general\//u);

  for (const collection of documentCollections) {
    assert.match(index, new RegExp(`<h2[^>]*>${collection.title}</h2>`, 'u'));
  }
  for (const document of documentationConfig.documents) {
    const basename = document.sourceFilename.replace(/\.md$/u, '');
    assert.match(index, new RegExp(`href="${document.outputDirectory}/${basename}/"`, 'u'));
    assert.doesNotMatch(
      index,
      new RegExp(`href="${document.outputDirectory}/${basename}\\.pdf"`, 'u'),
    );
    assert.match(
      index,
      new RegExp(
        `tmpose-kamishibai-docs/${document.outputDirectory}/${basename}/publication\\.json`,
        'u',
      ),
    );
  }
});

test('offers PDFs only for workshop publications', () => {
  const actionGroups = [...index.matchAll(/<div class="actions">([\s\S]*?)<\/div>/gu)];
  assert.equal(actionGroups.length, documentationConfig.documents.length + 2);
  for (const [, actions] of actionGroups.slice(0, documentationConfig.documents.length)) {
    assert.deepEqual(
      [...actions.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/gu)].map(([, label]) =>
        label.replace(/\s+/gu, ' ').trim(),
      ),
      ['HTML', 'Vivliostyle Viewer'],
    );
  }
  for (const [, actions] of actionGroups.slice(documentationConfig.documents.length)) {
    assert.deepEqual(
      [...actions.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/gu)].map(([, label]) =>
        label.replace(/\s+/gu, ' ').trim(),
      ),
      ['HTML', 'Vivliostyle Viewer', 'PDF'],
    );
  }
});

test('places the application and toolchain guide first in the developer collection', () => {
  const generalSection = index.slice(
    index.indexOf('<section aria-labelledby="general-documents">'),
    index.indexOf('<section aria-labelledby="dsl-32-documents">'),
  );
  const developerSection = index.slice(
    index.indexOf('<section aria-labelledby="developer-documents">'),
  );
  assert.doesNotMatch(generalSection, /アプリ・教材・ツールチェインガイド/u);
  assert.ok(
    developerSection.indexOf('TMPose紙芝居 3.2') <
      developerSection.indexOf('ソフトウェアメンテナンスガイド'),
  );
  assert.ok(
    developerSection.indexOf('TMPose紙芝居 4.0') <
      developerSection.indexOf('ソフトウェアメンテナンスガイド'),
  );
});

test('separates the officially supported DSL 3.2 and 4.0 pages', () => {
  const dsl32Section = index.slice(
    index.indexOf('<section aria-labelledby="dsl-32-documents">'),
    index.indexOf('<section aria-labelledby="dsl-40-documents">'),
  );
  const dsl40Section = index.slice(
    index.indexOf('<section aria-labelledby="dsl-40-documents">'),
    index.indexOf('<section aria-labelledby="developer-documents">'),
  );
  assert.doesNotMatch(dsl32Section, /DSL 4\.0/u);
  assert.doesNotMatch(dsl40Section, /DSL 3\.[12]/u);
});

test('offers two detailed version banners instead of ordinary document cards', () => {
  const chooser = index.slice(
    index.indexOf('<section class="dsl-version-chooser"'),
    index.indexOf('<section aria-labelledby="dsl-32-documents">'),
  );
  assert.ok(chooser.length > 0);
  assert.equal((chooser.match(/class="dsl-version-banner dsl-version-banner--/gu) ?? []).length, 2);
  assert.doesNotMatch(chooser, /<article\b/u);
  assert.match(chooser, /aria-labelledby="dsl-version-32-title"/u);
  assert.match(chooser, /aria-labelledby="dsl-version-40-title"/u);
  assert.match(chooser, /kamishibai=3\.2/u);
  assert.match(chooser, /<code>\.txt<\/code>/u);
  assert.match(chooser, /kamishibai: '4\.0'/u);
  assert.match(chooser, /<code>\.k4\.yml<\/code>/u);
  assert.match(chooser, /Source Graph/u);
  assert.match(chooser, /既存作品を継続/u);
  assert.match(chooser, /新規制作を開始/u);
  assert.match(chooser, /href="#dsl-32-documents"/u);
  assert.match(chooser, /href="#dsl-40-documents"/u);
  assert.match(index, /\.dsl-version-banner__link:focus-visible/u);
  assert.match(index, /@media \(max-width: 700px\)[\s\S]*\.dsl-version-banner/u);
});
