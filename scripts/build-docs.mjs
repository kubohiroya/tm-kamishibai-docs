import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {copyFile, cp, mkdir, readFile, readdir, rename, rm, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {
  documentationConfig,
  resolveLearnedThroughGrade,
  staffDocumentConfig,
  workshopDocumentConfig,
} from '../docs/config.mjs';
import sourceSnapshot from '../sources/tmpose-kamishibai.json' with {type: 'json'};

const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const docsRoot = path.join(projectRoot, 'docs');
const distRoot = path.join(projectRoot, 'dist');
const pdfRoot = path.join(projectRoot, 'output/pdf');
const vivliostyleBin = path.join(
  path.dirname(require.resolve('@vivliostyle/cli/package.json')),
  'dist/cli.js',
);
const rubyganaBin = path.join(
  path.dirname(require.resolve('rubygana/package.json')),
  'bin/rubygana.js',
);
const rubyganaPackage = require('rubygana/package.json');
const rubyganaGradeData = require('rubygana/lib/学年別漢字.js').metadata;

/** @returns {Promise<void>} */
function runNode(script, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd: projectRoot,
      stdio: 'inherit',
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${path.basename(script)} exited with ${signal ?? code}.`));
    });
  });
}

/** @returns {Promise<void>} */
function runRubygana(input, output, grade) {
  return new Promise((resolve, reject) => {
    const rubyArguments = workshopDocumentConfig.rubyOverrides.flatMap((override) => [
      '--ruby',
      override,
    ]);
    const child = spawn(
      process.execPath,
      [rubyganaBin, '--html', '--grade', String(grade), '--use-rp', ...rubyArguments, input],
      {
        cwd: projectRoot,
        stdio: ['ignore', 'pipe', 'inherit'],
      },
    );
    const chunks = [];

    child.stdout.on('data', (chunk) => chunks.push(chunk));
    child.stdout.on('error', reject);
    child.on('error', reject);
    child.on('exit', async (code, signal) => {
      if (code !== 0) {
        reject(new Error(`rubygana exited with ${signal ?? code}.`));
        return;
      }

      try {
        await writeFile(output, Buffer.concat(chunks));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function applyRubygana(htmlFile, grade) {
  const rubyOutput = `${htmlFile}.rubygana`;
  await runRubygana(htmlFile, rubyOutput, grade);
  await rename(rubyOutput, htmlFile);
}

function browserArguments() {
  if (process.env.VIVLIOSTYLE_CHROME_PATH) {
    return ['--executable-browser', process.env.VIVLIOSTYLE_CHROME_PATH];
  }

  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (process.platform === 'darwin' && existsSync(macChrome)) {
    return ['--executable-browser', macChrome];
  }

  return [];
}

async function buildWebPublication(configPath, outputDirectory, environment = process.env) {
  await rm(outputDirectory, {recursive: true, force: true});
  await runNode(
    vivliostyleBin,
    ['build', '--config', configPath, '--output', outputDirectory, '--format', 'webpub'],
    {
      cwd: path.dirname(configPath),
      env: environment,
    },
  );
}

async function buildPdf(inputPath, outputPath) {
  await mkdir(path.dirname(outputPath), {recursive: true});
  await runNode(
    vivliostyleBin,
    [
      'build',
      path.basename(inputPath),
      '--size',
      'A4',
      '--output',
      outputPath,
      ...browserArguments(),
    ],
    {cwd: path.dirname(inputPath)},
  );
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

function normalizeWorkshopImagePaths(source) {
  return source
    .replace(/(<img\b[^>]*\bsrc=")\.\.\/\.\.\/images\//giu, '$1images/')
    .replace(/(<img\b[^>]*\bsrc=")\.\//giu, `$1${workshopDocumentConfig.sourceDirectory}/`);
}

const documentsBySourcePath = new Map(
  documentationConfig.documents.map((document) => [
    path.resolve(docsRoot, document.sourceDirectory, document.sourceFilename),
    document,
  ]),
);

function rewriteMarkdownLinks(source, document, htmlPath) {
  const documentSourcePath = path.join(docsRoot, document.sourceDirectory, document.sourceFilename);

  return source.replace(/href="([^"#?]+\.md)(#[^"]*)?"/giu, (match, markdownHref, hash = '') => {
    if (/^[a-z][a-z0-9+.-]*:/iu.test(markdownHref)) return match;
    const targetSourcePath = path.resolve(path.dirname(documentSourcePath), markdownHref);
    const targetDocument = documentsBySourcePath.get(targetSourcePath);
    if (targetDocument !== undefined) {
      const targetDirectory = path.join(
        distRoot,
        targetDocument.outputDirectory,
        targetDocument.sourceFilename.replace(/\.md$/u, ''),
      );
      const relativeTarget = path
        .relative(path.dirname(htmlPath), targetDirectory)
        .split(path.sep)
        .join('/');
      return `href="${relativeTarget}/${hash}"`;
    }

    const repositoryPath = path.relative(projectRoot, targetSourcePath).split(path.sep).join('/');
    return `href="https://github.com/kubohiroya/tmpose-kamishibai-docs/blob/main/${repositoryPath}${hash}"`;
  });
}

async function prepareDocumentHtml(htmlPath, document, grade) {
  const source = await readFile(htmlPath, 'utf8');
  const withImages = source.replace(/(<img\b[^>]*\bsrc=")(?:\.\.\/)+images\//giu, '$1images/');
  const withLinks = rewriteMarkdownLinks(withImages, document, htmlPath);
  const withGrade =
    document.addFurigana === true
      ? withLinks.replace(/<html(\s|>)/iu, `<html data-rubygana-grade="${grade}"$1`)
      : withLinks;
  await writeFile(htmlPath, withGrade);
  if (document.addFurigana === true) await applyRubygana(htmlPath, grade);
}

async function prepareWorkshopHtml(htmlPath, grade) {
  const source = await readFile(htmlPath, 'utf8');
  const isTableOfContents = /<nav\b[^>]*\bid="toc"[^>]*>/iu.test(source);
  const section =
    path.basename(htmlPath) === workshopDocumentConfig.coverHtmlFilename
      ? 'cover'
      : isTableOfContents
        ? 'toc'
        : 'body';
  const note = `<p class="furigana-build-note">このドキュメントは、小学${grade}年生までに学ぶ漢字を学習済みとして想定して、それ以後に学ぶ漢字についての、ふりがなを付けています。</p>`;
  const withoutGeneratedTitle = isTableOfContents
    ? source.replace(/(<body\b[^>]*>)\s*<h1\b[^>]*>[\s\S]*?<\/h1>/iu, '$1')
    : source;
  const withTocLabels = withoutGeneratedTitle.replace(
    /<nav\b[^>]*\bid="toc"[^>]*>[\s\S]*?<\/nav>/iu,
    (tableOfContents) =>
      tableOfContents.replace(
        /(<a\b[^>]*>)([\s\S]*?)(<\/a>)/giu,
        '$1<span class="toc-label">$2</span>$3',
      ),
  );
  const withImages = normalizeWorkshopImagePaths(withTocLabels);
  const withGrade = withImages.replace(/<html(\s|>)/iu, `<html data-rubygana-grade="${grade}"$1`);
  const withSection = withGrade.replace(
    /<body(\s|>)/iu,
    `<body data-publication-section="${section}"$1`,
  );
  const withNote =
    section === 'cover'
      ? withSection.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/iu, `$1\n${note}`)
      : withSection;
  await writeFile(htmlPath, withNote);
}

function buildInfo(details = {}) {
  return {
    htmlAndPdfGenerator: 'Vivliostyle CLI 11.1.0',
    source: sourceSnapshot,
    ...details,
  };
}

async function writeBuildInfo(directory, details) {
  await writeFile(path.join(directory, 'build-info.json'), `${JSON.stringify(details, null, 2)}\n`);
}

async function buildDocuments(grade) {
  const configPath = path.join(projectRoot, 'docs/vivliostyle.general.config.mjs');

  for (const document of documentationConfig.documents) {
    const basename = document.sourceFilename.replace(/\.md$/u, '');
    const pdfFilename = document.sourceFilename.replace(/\.md$/u, '.pdf');
    const publicationDirectory = path.join(distRoot, document.outputDirectory, basename);
    await buildWebPublication(configPath, publicationDirectory, {
      ...process.env,
      DOCUMENT_SOURCE: document.sourceFilename,
    });

    const articlePath = path.join(
      publicationDirectory,
      documentationConfig.standaloneArticleHtmlFilename,
    );
    await prepareDocumentHtml(articlePath, document, grade);
    const pdfInput =
      document.pdfIncludesGeneratedToc === false
        ? articlePath
        : path.join(publicationDirectory, 'publication.json');
    const pdfPath = path.join(pdfRoot, document.outputDirectory, pdfFilename);
    await buildPdf(pdfInput, pdfPath);
    await mkdir(path.join(distRoot, document.outputDirectory), {
      recursive: true,
    });
    await copyFile(pdfPath, path.join(distRoot, document.outputDirectory, pdfFilename));
    await writeBuildInfo(
      publicationDirectory,
      buildInfo({
        publicationKind: 'standalone-document',
        sourceDirectory: document.sourceDirectory,
        sourceFilename: document.sourceFilename,
        rubyApplied: document.addFurigana === true,
        ...(document.addFurigana === true ? {learnedThroughGrade: grade} : {}),
      }),
    );
  }
}

async function buildWorkshop(grade) {
  const configPath = path.join(projectRoot, 'docs/vivliostyle.workshop.config.mjs');
  const tempDirectory = path.join(projectRoot, 'tmp/vivliostyle/workshop');
  const outputDirectory = path.join(distRoot, workshopDocumentConfig.outputDirectory);
  await buildWebPublication(configPath, tempDirectory);
  for (const htmlPath of await findHtmlFiles(tempDirectory)) {
    await prepareWorkshopHtml(htmlPath, grade);
    await applyRubygana(htmlPath, grade);
  }
  await cp(tempDirectory, outputDirectory, {recursive: true});
  const pdfPath = path.join(
    pdfRoot,
    workshopDocumentConfig.outputDirectory,
    workshopDocumentConfig.pdfFilename,
  );
  await buildPdf(path.join(outputDirectory, 'publication.json'), pdfPath);
  await copyFile(pdfPath, path.join(outputDirectory, workshopDocumentConfig.pdfFilename));
  await writeBuildInfo(
    outputDirectory,
    buildInfo({
      publicationKind: 'workshop-documentation',
      rubyApplied: true,
      learnedThroughGrade: grade,
      rubyGenerator: `${rubyganaPackage.name} ${rubyganaPackage.version}`,
      kanjiDataset: rubyganaGradeData,
    }),
  );
}

async function buildStaff() {
  const configPath = path.join(projectRoot, 'docs/vivliostyle.staff.config.mjs');
  const tempDirectory = path.join(projectRoot, 'tmp/vivliostyle/staff');
  const outputDirectory = path.join(distRoot, staffDocumentConfig.outputDirectory);
  await buildWebPublication(configPath, tempDirectory);
  await cp(tempDirectory, outputDirectory, {recursive: true});
  const htmlPath = path.join(outputDirectory, staffDocumentConfig.htmlFilename);
  await writeFile(htmlPath, normalizeWorkshopImagePaths(await readFile(htmlPath, 'utf8')));
  const pdfPath = path.join(
    pdfRoot,
    staffDocumentConfig.outputDirectory,
    staffDocumentConfig.pdfFilename,
  );
  await buildPdf(htmlPath, pdfPath);
  await copyFile(pdfPath, path.join(outputDirectory, staffDocumentConfig.pdfFilename));
  await writeBuildInfo(
    outputDirectory,
    buildInfo({
      publicationKind: 'workshop-staff-documentation',
      rubyApplied: false,
    }),
  );
}

export async function buildDocs() {
  const grade = resolveLearnedThroughGrade();
  await Promise.all([
    rm(distRoot, {recursive: true, force: true}),
    rm(pdfRoot, {recursive: true, force: true}),
  ]);
  await mkdir(distRoot, {recursive: true});
  await writeFile(path.join(distRoot, '.nojekyll'), '');
  await copyFile(path.join(projectRoot, 'site/index.html'), path.join(distRoot, 'index.html'));
  await buildDocuments(grade);
  await buildWorkshop(grade);
  await buildStaff();
  await writeBuildInfo(
    distRoot,
    buildInfo({
      publicationKind: 'documentation-site',
      documentCount: documentationConfig.documents.length + 2,
    }),
  );
  console.log(`Built ${documentationConfig.documents.length + 2} publications in dist/.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildDocs();
}
