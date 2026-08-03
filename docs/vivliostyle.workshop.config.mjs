import {defineConfig} from '@vivliostyle/cli';

import {workshopDocumentConfig} from './config.mjs';

function flattenDocumentTableOfContents() {
  return (documentProps) => ({
    type: 'element',
    tagName: 'ol',
    properties: {},
    children: documentProps.flatMap(({children}) =>
      [children]
        .flat(Infinity)
        .flatMap((child) =>
          child?.type === 'element' && child.tagName === 'ol' ? child.children : child,
        ),
    ),
  });
}

export default defineConfig({
  title: workshopDocumentConfig.title,
  author: workshopDocumentConfig.author,
  language: 'ja',
  size: 'A4',
  viewerParam: 'bookMode=true',
  entry: [
    {
      rel: 'cover',
      path: `${workshopDocumentConfig.sourceDirectory}/${workshopDocumentConfig.coverFilename}`,
      output: workshopDocumentConfig.coverHtmlFilename,
      imageSrc: 'images/image01.png',
      theme: ['theme.css', 'document-theme.css'],
    },
    {
      rel: 'contents',
    },
    {
      path: `${workshopDocumentConfig.sourceDirectory}/${workshopDocumentConfig.sourceFilename}`,
      output: workshopDocumentConfig.sourceFilename.replace(/\.md$/u, '.html'),
    },
  ],
  theme: ['theme.css', 'document-theme.css'],
  workspaceDir: '../tmp/docs-workshop-vivliostyle',
  copyAsset: {
    excludes: [
      'dist/**',
      'tmp/**',
      'user-guides/**',
      'dsl-author-guides/**',
      'developer-guides/**',
    ],
  },
  toc: {
    title: '目次',
    htmlPath: workshopDocumentConfig.tocHtmlFilename,
    sectionDepth: workshopDocumentConfig.tocSectionDepth,
    // @ts-expect-error Vivliostyle's HAST callback type is narrower than its accepted runtime shape.
    transformDocumentList: flattenDocumentTableOfContents,
  },
});
