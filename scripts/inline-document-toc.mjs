import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

function addClassToTag(tag, className) {
  const classAttribute = tag.match(/\bclass=(["'])(.*?)\1/iu);
  if (!classAttribute) return tag.replace(/<body\b/iu, `<body class="${className}"`);

  const classes = classAttribute[2].split(/\s+/u);
  if (classes.includes(className)) return tag;
  return tag.replace(
    classAttribute[0],
    `class=${classAttribute[1]}${classAttribute[2]} ${className}${classAttribute[1]}`,
  );
}

function extractTocList(tocHtml) {
  const navigation = tocHtml.match(/<nav\b(?=[^>]*\bid=(["'])toc\1)[^>]*>([\s\S]*?)<\/nav>/iu);
  if (!navigation) throw new Error('Generated table of contents does not contain nav#toc.');

  const withoutHeading = navigation[2].replace(/\s*<h2\b[^>]*>[\s\S]*?<\/h2>\s*/iu, '');
  const singleDocumentRoot = withoutHeading.match(
    /^\s*<ol>\s*<li\b(?=[^>]*\bdata-section-level=(["'])1\1)[^>]*>\s*<a\b[^>]*>[\s\S]*?<\/a>\s*(<ol>[\s\S]*<\/ol>)\s*<\/li>\s*<\/ol>\s*$/iu,
  );
  const list = singleDocumentRoot?.[2] ?? withoutHeading;
  return list.replace(/href=(["'])document\.html#/giu, 'href=$1#');
}

function renderInlineToc(tocHtml) {
  return `<nav id="toc" class="document-toc" role="doc-toc" aria-label="目次" data-document-toc>
  <details class="document-toc__panel" open>
    <summary class="document-toc__summary">目次</summary>
    <div class="document-toc__viewport">
      ${extractTocList(tocHtml)}
    </div>
  </details>
</nav>`;
}

export function createInlineDocumentHtml(articleHtml, tocHtml, {scriptHref}) {
  if (!scriptHref) throw new Error('scriptHref is required for inline document navigation.');

  const body = articleHtml.match(/(<body\b[^>]*>)([\s\S]*?)<\/body>/iu);
  if (!body) throw new Error('Generated article does not contain a body element.');
  if (/\bid=(["'])main-content\1/iu.test(articleHtml)) {
    throw new Error('Generated article already contains #main-content.');
  }

  const bodyTag = addClassToTag(body[1], 'has-inline-toc');
  const content = body[2].trim();
  let output = articleHtml.replace(
    body[0],
    `${bodyTag}\n${renderInlineToc(tocHtml)}\n<main id="main-content" class="document-content" tabindex="-1">\n${content}\n</main>\n</body>`,
  );
  output = output.replace(
    /<\/head>/iu,
    `<script type="module" src="${scriptHref}"></script></head>`,
  );
  return output;
}

export function updateStandalonePublicationManifest(source, {indexFilename, articleFilename}) {
  const publication = JSON.parse(source);
  const readingOrder = publication.readingOrder ?? [];
  if (!readingOrder.some((entry) => entry.url === articleFilename)) {
    throw new Error(`${articleFilename} is missing from the publication reading order.`);
  }

  publication.readingOrder = readingOrder.filter((entry) => entry.url !== indexFilename);
  const resources = publication.resources ?? [];
  if (
    !resources.some((entry) => (typeof entry === 'string' ? entry : entry.url) === indexFilename)
  ) {
    publication.resources = [indexFilename, ...resources];
  }
  return `${JSON.stringify(publication, null, 2)}\n`;
}

export async function installInlineDocumentToc({
  publicationDirectory,
  siteRootDirectory,
  indexFilename,
  articleFilename,
  manifestFilename = 'publication.json',
  scriptFilename = 'document-toc.js',
}) {
  const indexPath = path.join(publicationDirectory, indexFilename);
  const articlePath = path.join(publicationDirectory, articleFilename);
  const manifestPath = path.join(publicationDirectory, manifestFilename);
  const [tocHtml, articleHtml, manifest] = await Promise.all([
    readFile(indexPath, 'utf8'),
    readFile(articlePath, 'utf8'),
    readFile(manifestPath, 'utf8'),
  ]);
  const scriptHref = path
    .relative(publicationDirectory, path.join(siteRootDirectory, scriptFilename))
    .split(path.sep)
    .join('/');

  await Promise.all([
    writeFile(indexPath, createInlineDocumentHtml(articleHtml, tocHtml, {scriptHref})),
    writeFile(
      manifestPath,
      updateStandalonePublicationManifest(manifest, {indexFilename, articleFilename}),
    ),
  ]);
}
