import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {renderReferenceDocument} from './dsl4-reference.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const schemaPath = path.join(projectRoot, 'sources/dsl4/dsl-4.schema.json');
const annotationsPath = path.join(projectRoot, 'sources/dsl4/annotations.ja.json');
const lockPath = path.join(projectRoot, 'sources/dsl4/source-lock.json');
const outputPath = path.join(projectRoot, 'docs/dsl-author-guides/dsl-4.0-schema-reference.md');

export async function generateDsl4Reference({check = false} = {}) {
  const [schemaSource, annotationsSource, lockSource] = await Promise.all([
    readFile(schemaPath),
    readFile(annotationsPath, 'utf8'),
    readFile(lockPath, 'utf8'),
  ]);
  const schema = JSON.parse(schemaSource.toString('utf8'));
  const annotations = JSON.parse(annotationsSource);
  const lock = JSON.parse(lockSource);
  const actualSchemaSha256 = createHash('sha256').update(schemaSource).digest('hex');
  if (actualSchemaSha256 !== lock.schemaSha256) {
    throw new Error(
      `Pinned DSL 4.0 Schema hash differs: expected ${lock.schemaSha256}, got ${actualSchemaSha256}.`,
    );
  }
  const generated = renderReferenceDocument({schema, annotations, lock});
  if (check) {
    const current = await readFile(outputPath, 'utf8');
    if (current !== generated) {
      throw new Error(
        'DSL 4.0 Schema reference is stale. Run `pnpm docs:dsl4:generate` and commit the result.',
      );
    }
    console.log('DSL 4.0 Schema reference is current.');
    return generated;
  }
  await writeFile(outputPath, generated);
  console.log(`Generated ${path.relative(projectRoot, outputPath)}.`);
  return generated;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argumentsAfterScript = process.argv.slice(2);
  const unknownArguments = argumentsAfterScript.filter((argument) => argument !== '--check');
  if (unknownArguments.length > 0) {
    throw new Error(`Unknown argument(s): ${unknownArguments.join(', ')}`);
  }
  await generateDsl4Reference({check: argumentsAfterScript.includes('--check')});
}
