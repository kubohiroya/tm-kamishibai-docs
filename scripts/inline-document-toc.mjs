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

function extractTocList(tocHtml, fragmentSourceFilenames, unwrapSingleDocumentRoot) {
  const navigation = tocHtml.match(/<nav\b(?=[^>]*\bid=(["'])toc\1)[^>]*>([\s\S]*?)<\/nav>/iu);
  if (!navigation) throw new Error('Generated table of contents does not contain nav#toc.');

  const withoutHeading = navigation[2].replace(/\s*<h2\b[^>]*>[\s\S]*?<\/h2>\s*/iu, '');
  const singleDocumentRoot = unwrapSingleDocumentRoot
    ? withoutHeading.match(
        /^\s*<ol>\s*<li\b(?=[^>]*\bdata-section-level=(["'])1\1)[^>]*>\s*<a\b[^>]*>[\s\S]*?<\/a>\s*(<ol>[\s\S]*<\/ol>)\s*<\/li>\s*<\/ol>\s*$/iu,
      )
    : null;
  const list = singleDocumentRoot?.[2] ?? withoutHeading;
  return fragmentSourceFilenames.reduce(
    (output, filename) =>
      output.replace(
        new RegExp(`href=(["'])${filename.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}#`, 'giu'),
        'href=$1#',
      ),
    list,
  );
}

function renderInlineToc(
  tocHtml,
  {fragmentSourceFilenames, labelsIncludeNumbers, unwrapSingleDocumentRoot},
) {
  const className = labelsIncludeNumbers
    ? 'document-toc document-toc--explicit-labels'
    : 'document-toc document-toc--css-numbered';
  return `<nav id="toc" class="${className}" role="doc-toc" aria-label="目次" data-document-toc>
  <details class="document-toc__panel" open>
    <summary class="document-toc__summary">目次</summary>
    <div class="document-toc__viewport">
      ${extractTocList(tocHtml, fragmentSourceFilenames, unwrapSingleDocumentRoot)}
    </div>
  </details>
</nav>`;
}

function bodyContent(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/iu);
  if (!body) throw new Error('Generated content does not contain a body element.');
  return body[1]
    .replace(
      /\s*<nav\b(?=[^>]*\bclass=(["'])[^"']*\bcover-navigation\b[^"']*\1)[^>]*>[\s\S]*?<\/nav>\s*/giu,
      '\n',
    )
    .trim();
}

function renderHeadingTree(nodes) {
  if (nodes.length === 0) return '<ol></ol>';
  return `<ol>${nodes
    .map(
      ({children, id, label, level}) =>
        `<li data-section-level="${level}"><a href="#${encodeURIComponent(id)}"><span class="toc-label">${label}</span></a>${children.length > 0 ? renderHeadingTree(children) : ''}</li>`,
    )
    .join('')}</ol>`;
}

export function createTocHtmlFromHeadings(articleHtml, {skipFirstHeading = false} = {}) {
  const headings = [
    ...articleHtml.matchAll(/<h([1-6])\b[^>]*\bid=(["'])(.*?)\2[^>]*>([\s\S]*?)<\/h\1>/giu),
  ].map(([, level, , id, label]) => ({children: [], id, label, level: Number(level)}));
  if (skipFirstHeading) headings.shift();
  if (headings.length === 0) throw new Error('Generated article does not contain any headings.');

  const root = {children: [], level: 0};
  const stack = [root];
  for (const heading of headings) {
    while (stack.length > 1 && stack.at(-1).level >= heading.level) stack.pop();
    stack.at(-1).children.push(heading);
    stack.push(heading);
  }

  return `<nav id="toc" role="doc-toc"><h2>目次</h2>${renderHeadingTree(root.children)}</nav>`;
}

export function createInlineDocumentHtml(
  articleHtml,
  tocHtml,
  {
    scriptHref,
    stylesheetHref,
    fragmentSourceFilenames = ['document.html'],
    labelsIncludeNumbers = false,
    unwrapSingleDocumentRoot = true,
  },
) {
  if (!scriptHref) throw new Error('scriptHref is required for inline document navigation.');
  if (!stylesheetHref) {
    throw new Error('stylesheetHref is required for inline document navigation.');
  }

  const documents = Array.isArray(articleHtml) ? articleHtml : [articleHtml];
  if (documents.length === 0) throw new Error('At least one content document is required.');
  const body = documents[0].match(/(<body\b[^>]*>)([\s\S]*?)<\/body>/iu);
  if (!body) throw new Error('Generated article does not contain a body element.');
  if (documents.some((document) => /\bid=(["'])main-content\1/iu.test(document))) {
    throw new Error('Generated article already contains #main-content.');
  }

  const bodyTag = addClassToTag(body[1], 'has-inline-toc');
  const content = documents.map(bodyContent).join('\n');
  let output = documents[0].replace(
    body[0],
    `${bodyTag}\n${renderInlineToc(tocHtml, {fragmentSourceFilenames, labelsIncludeNumbers, unwrapSingleDocumentRoot})}\n<main id="main-content" class="document-content" tabindex="-1">\n${content}\n</main>\n</body>`,
  );
  output = output.replace(
    /<\/head>/iu,
    `<link rel="stylesheet" href="${stylesheetHref}">\n  <script type="module" src="${scriptHref}"></script></head>`,
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
  contentFilenames = [articleFilename],
  tocFilename = indexFilename,
  generateTocFromHeadings = false,
  skipFirstHeading = false,
  labelsIncludeNumbers = false,
  unwrapSingleDocumentRoot = true,
  manifestFilename = 'publication.json',
  scriptFilename = 'document-toc.js',
  stylesheetFilename = 'document-toc.css',
}) {
  const indexPath = path.join(publicationDirectory, indexFilename);
  const contentPaths = contentFilenames.map((filename) =>
    path.join(publicationDirectory, filename),
  );
  const manifestPath = path.join(publicationDirectory, manifestFilename);
  const [articleDocuments, manifest] = await Promise.all([
    Promise.all(contentPaths.map((contentPath) => readFile(contentPath, 'utf8'))),
    readFile(manifestPath, 'utf8'),
  ]);
  const tocHtml = generateTocFromHeadings
    ? createTocHtmlFromHeadings(articleDocuments.at(-1), {skipFirstHeading})
    : await readFile(path.join(publicationDirectory, tocFilename), 'utf8');
  const scriptHref = path
    .relative(publicationDirectory, path.join(siteRootDirectory, scriptFilename))
    .split(path.sep)
    .join('/');
  const stylesheetHref = path
    .relative(publicationDirectory, path.join(siteRootDirectory, stylesheetFilename))
    .split(path.sep)
    .join('/');

  await Promise.all([
    writeFile(
      indexPath,
      createInlineDocumentHtml(articleDocuments, tocHtml, {
        scriptHref,
        stylesheetHref,
        fragmentSourceFilenames: contentFilenames,
        labelsIncludeNumbers,
        unwrapSingleDocumentRoot,
      }),
    ),
    writeFile(
      manifestPath,
      updateStandalonePublicationManifest(manifest, {indexFilename, articleFilename}),
    ),
  ]);
}
