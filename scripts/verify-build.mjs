import {access, readFile, readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {documentationConfig, staffDocumentConfig, workshopDocumentConfig} from '../docs/config.mjs';
import sourceSnapshot from '../sources/tmpose-kamishibai.json' with {type: 'json'};

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const distRoot = path.join(projectRoot, 'dist');
const pdfRoot = path.join(projectRoot, 'output/pdf');
const require = createRequire(import.meta.url);
const vivliostyleRequire = createRequire(require.resolve('@vivliostyle/cli/package.json'));
const {PDFDocument} = vivliostyleRequire('pdf-lib');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function pdfPageCount(pdfPath) {
  const document = await PDFDocument.load(await readFile(pdfPath));
  return document.getPageCount();
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(entryPath);
      return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

async function verifyLocalImages(htmlPath, html) {
  const imageSources = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/giu)].map(
    ([, source]) => source,
  );
  for (const source of imageSources) {
    if (/^(?:data:|https?:)/iu.test(source)) continue;
    await access(path.resolve(path.dirname(htmlPath), decodeURIComponent(source)));
  }
  return imageSources.length;
}

async function verifyDocument(document) {
  const basename = document.sourceFilename.replace(/\.md$/u, '');
  const pdfFilename = document.sourceFilename.replace(/\.md$/u, '.pdf');
  const publicationDirectory = path.join(distRoot, document.outputDirectory, basename);
  const articlePath = path.join(
    publicationDirectory,
    documentationConfig.standaloneArticleHtmlFilename,
  );
  const manifestPath = path.join(publicationDirectory, 'publication.json');
  const publishedPdfPath = path.join(distRoot, document.outputDirectory, pdfFilename);
  const outputPdfPath = path.join(pdfRoot, document.outputDirectory, pdfFilename);
  const [article, publishedPdf, outputPdf] = await Promise.all([
    readFile(articlePath, 'utf8'),
    readFile(publishedPdfPath),
    readFile(outputPdfPath),
    access(manifestPath),
  ]);

  assert(publishedPdf.equals(outputPdf), `${pdfFilename} differs between dist and output/pdf.`);
  assert(
    !/href="(?!https?:)[^"]+\.md(?:#[^"]*)?"/iu.test(article),
    `${basename} has a local .md link.`,
  );
  assert(article.includes(document.title), `${basename} does not contain its configured title.`);
  await verifyLocalImages(articlePath, article);

  const pageCount = await pdfPageCount(outputPdfPath);
  if (document.expectedPdfPageCount !== undefined) {
    assert(
      pageCount === document.expectedPdfPageCount,
      `${pdfFilename} has ${pageCount} pages; expected ${document.expectedPdfPageCount}.`,
    );
  } else {
    assert(pageCount > 0, `${pdfFilename} has no pages.`);
  }

  return pageCount;
}

async function verifyIndex() {
  const index = await readFile(path.join(distRoot, 'index.html'), 'utf8');
  assert(
    !index.includes('/tmpose-kamishibai/docs/'),
    'The index still links to the old Pages path.',
  );
  assert(!index.includes('general/'), 'The index still uses the old general directory.');

  for (const document of documentationConfig.documents) {
    const basename = document.sourceFilename.replace(/\.md$/u, '');
    assert(
      index.includes(`href="${document.outputDirectory}/${basename}/"`),
      `${basename} HTML link is missing.`,
    );
    assert(
      index.includes(`href="${document.outputDirectory}/${basename}.pdf"`),
      `${basename} PDF link is missing.`,
    );
    assert(
      index.includes(
        `tmpose-kamishibai-docs/${document.outputDirectory}/${basename}/publication.json`,
      ),
      `${basename} Viewer link is missing.`,
    );
  }
}

async function verifyWorkshop() {
  const workshopDirectory = path.join(distRoot, workshopDocumentConfig.outputDirectory);
  const workshopPdf = path.join(workshopDirectory, workshopDocumentConfig.pdfFilename);
  const staffDirectory = path.join(distRoot, staffDocumentConfig.outputDirectory);
  const staffPdf = path.join(staffDirectory, staffDocumentConfig.pdfFilename);
  await Promise.all([
    access(path.join(workshopDirectory, workshopDocumentConfig.coverHtmlFilename)),
    access(path.join(workshopDirectory, workshopDocumentConfig.tocHtmlFilename)),
    access(path.join(workshopDirectory, 'publication.json')),
    access(path.join(staffDirectory, staffDocumentConfig.htmlFilename)),
  ]);
  assert((await pdfPageCount(workshopPdf)) > 0, 'The workshop PDF has no pages.');
  assert((await pdfPageCount(staffPdf)) > 0, 'The staff PDF has no pages.');
}

export async function verifyBuild() {
  await verifyIndex();
  const pageCounts = new Map();
  for (const document of documentationConfig.documents) {
    pageCounts.set(document.sourceFilename, await verifyDocument(document));
  }
  await verifyWorkshop();

  const buildInfo = JSON.parse(await readFile(path.join(distRoot, 'build-info.json'), 'utf8'));
  assert(
    buildInfo.source.commit === sourceSnapshot.commit,
    'Build metadata source commit differs.',
  );
  assert(
    buildInfo.documentCount === documentationConfig.documents.length + 2,
    'Build document count differs.',
  );
  const htmlFiles = await findHtmlFiles(distRoot);
  assert(htmlFiles.length > 0, 'The generated site has no HTML files.');
  console.log(
    `Verified ${documentationConfig.documents.length + 2} publications, ${htmlFiles.length} HTML files, ` +
      `${pageCounts.get('08-extension-guide.md')} extension-guide pages, and ` +
      `${pageCounts.get('09-application-materials-guide.md')} application-guide pages.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await verifyBuild();
}
