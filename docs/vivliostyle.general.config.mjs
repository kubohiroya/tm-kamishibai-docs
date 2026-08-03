import {defineConfig} from '@vivliostyle/cli';

import {documentationConfig, findDocument} from './config.mjs';

export function createDocumentVivliostyleConfig(sourceFilename) {
  const selectedDocument = findDocument(sourceFilename);
  if (selectedDocument === undefined) {
    throw new Error(`Unknown document: ${sourceFilename}`);
  }

  return defineConfig({
    title: selectedDocument.title,
    author: documentationConfig.author,
    language: 'ja',
    size: 'A4',
    viewerParam: 'bookMode=true',
    entry: [
      {
        path: `${selectedDocument.sourceDirectory}/${selectedDocument.sourceFilename}`,
        output: documentationConfig.standaloneArticleHtmlFilename,
      },
    ],
    theme: ['theme.css', 'general-theme.css'],
    workspaceDir:
      `../tmp/vivliostyle/${selectedDocument.collectionId}/` +
      selectedDocument.sourceFilename.replace(/\.md$/u, ''),
    copyAsset: {
      excludes: [
        'dist/**',
        'tmp/**',
        'user-guides/**',
        'dsl-author-guides/**',
        'developer-guides/**',
        'workshops/**',
      ],
    },
    toc: {
      title: '目次',
      htmlPath: documentationConfig.standaloneTocHtmlFilename,
      sectionDepth: documentationConfig.tocSectionDepth,
    },
  });
}

const sourceFilename = process.env.DOCUMENT_SOURCE;
if (sourceFilename === undefined) {
  throw new Error('DOCUMENT_SOURCE is required.');
}

export default createDocumentVivliostyleConfig(sourceFilename);
