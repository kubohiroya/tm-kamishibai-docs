import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInlineDocumentHtml,
  updateStandalonePublicationManifest,
} from '../scripts/inline-document-toc.mjs';
import {injectSiteAppBar} from '../scripts/site-appbar.mjs';

const article = `<!doctype html><html lang="ja"><head><title>Guide</title></head><body><section class="level1"><h1 id="guide">Guide</h1><section class="level2"><h2 id="start">Start</h2></section></section></body></html>`;
const toc = `<!doctype html><html lang="ja"><head><title>Guide</title></head><body><h1>Guide</h1><nav id="toc" role="doc-toc"><h2>目次</h2><ol><li data-section-level="1"><a href="document.html#guide">Guide</a><ol><li data-section-level="2"><a href="document.html#start">Start</a><ol><li data-section-level="3"><a href="document.html#detail">Detail</a></li></ol></li></ol></li></ol></nav></body></html>`;

test('combines the generated table of contents and article into one HTML document', () => {
  const combined = createInlineDocumentHtml(article, toc, {scriptHref: '../../../document-toc.js'});

  assert.match(combined, /<body class="has-inline-toc">/u);
  assert.match(combined, /<nav id="toc"[^>]*data-document-toc/u);
  assert.match(combined, /<details class="document-toc__panel" open>/u);
  assert.match(combined, /<main id="main-content" class="document-content" tabindex="-1">/u);
  assert.match(combined, /href="#start"/u);
  assert.doesNotMatch(combined, /href="document\.html#/u);
  assert.equal((combined.match(/<h1 id="guide">/gu) ?? []).length, 1);
  assert.doesNotMatch(combined, />Guide<\/a><ol>/u);
  assert.match(combined, /src="\.\.\/\.\.\/\.\.\/document-toc\.js"/u);
});

test('keeps the existing main landmark when the shared AppBar is installed', () => {
  const combined = createInlineDocumentHtml(article, toc, {scriptHref: '../../../document-toc.js'});
  const withAppBar = injectSiteAppBar(combined, '../../../', {
    pathname: '/tmpose-kamishibai-docs/4.0/guides/example/',
  });

  assert.equal((withAppBar.match(/id="main-content"/gu) ?? []).length, 1);
  assert.match(withAppBar, /<a class="skip-link" href="#main-content">/u);
  assert.match(withAppBar, /<body class="has-inline-toc site-document">/u);
});

test('keeps only the article in the Viewer reading order', () => {
  const manifest = updateStandalonePublicationManifest(
    JSON.stringify({
      readingOrder: [
        {url: 'index.html', name: '目次', rel: 'contents'},
        {url: 'document.html', name: 'Guide'},
      ],
      resources: ['theme.css'],
    }),
    {indexFilename: 'index.html', articleFilename: 'document.html'},
  );
  const publication = JSON.parse(manifest);

  assert.deepEqual(publication.readingOrder, [{url: 'document.html', name: 'Guide'}]);
  assert.deepEqual(publication.resources, ['index.html', 'theme.css']);
});
