import assert from 'node:assert/strict';
import {readdirSync, readFileSync} from 'node:fs';
import {extname, join, relative, resolve} from 'node:path';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '..');
const textExtensions = new Set(['.html', '.json', '.md']);

function collectTextFiles(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectTextFiles(path);
    }
    return textExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

test('uses context-appropriate terms for digital kamishibai delivery and play', () => {
  const rootMarkdown = readdirSync(repositoryRoot, {withFileTypes: true})
    .filter((entry) => entry.isFile() && extname(entry.name) === '.md')
    .map((entry) => join(repositoryRoot, entry.name));
  const files = [
    ...rootMarkdown,
    ...collectTextFiles(join(repositoryRoot, 'docs')),
    ...collectTextFiles(join(repositoryRoot, 'site')),
    ...collectTextFiles(join(repositoryRoot, 'sources', 'dsl4')),
  ];
  const violations = files.flatMap((path) => {
    const lines = readFileSync(path, 'utf8').split('\n');
    return lines.flatMap((line, index) =>
      /上映|上演/u.test(line)
        ? [`${relative(repositoryRoot, path)}:${index + 1}: ${line.trim()}`]
        : [],
    );
  });

  assert.deepEqual(violations, []);
});
