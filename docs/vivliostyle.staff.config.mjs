import {defineConfig} from '@vivliostyle/cli';
import {fileURLToPath} from 'node:url';

import {staffDocumentConfig} from './config.mjs';
import {createSelectiveImageCopyAsset} from '../scripts/publication-assets.mjs';

const docsRoot = fileURLToPath(new URL('./', import.meta.url));

export default defineConfig({
  title: staffDocumentConfig.title,
  author: staffDocumentConfig.author,
  language: 'ja',
  size: 'A4',
  entry: [
    {
      path: `${staffDocumentConfig.sourceDirectory}/${staffDocumentConfig.sourceFilename}`,
      output: staffDocumentConfig.articleHtmlFilename,
    },
  ],
  theme: ['theme.css', 'staff-theme.css'],
  workspaceDir: '../tmp/docs-staff-vivliostyle',
  copyAsset: {
    ...createSelectiveImageCopyAsset({
      rootDirectory: docsRoot,
      sourcePaths: [
        `${staffDocumentConfig.sourceDirectory}/${staffDocumentConfig.sourceFilename}`,
        'theme.css',
        'staff-theme.css',
      ],
    }),
    excludes: [
      'dist/**',
      'tmp/**',
      'user-guides/**',
      'dsl-author-guides/**',
      'developer-guides/**',
      'workshops/**',
    ],
  },
});
