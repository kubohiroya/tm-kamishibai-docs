import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';

import {renderReferenceDocument, validateReferenceInputs} from '../scripts/dsl4-reference.mjs';

const schemaSource = readFileSync(new URL('../sources/dsl4/dsl-4.schema.json', import.meta.url));
const schema = JSON.parse(schemaSource.toString('utf8'));
const annotations = JSON.parse(
  readFileSync(new URL('../sources/dsl4/annotations.ja.json', import.meta.url), 'utf8'),
);
const lock = JSON.parse(
  readFileSync(new URL('../sources/dsl4/source-lock.json', import.meta.url), 'utf8'),
);
const generated = readFileSync(
  new URL('../docs/dsl-author-guides/dsl-4.0-schema-reference.md', import.meta.url),
  'utf8',
);

test('pins the upstream DSL 4.0 Schema with its source and SHA-256', () => {
  const actualHash = createHash('sha256').update(schemaSource).digest('hex');
  assert.equal(actualHash, lock.schemaSha256);
  assert.equal(lock.repository, 'kubohiroya/tmpose-kamishibai');
  assert.equal(lock.commit, 'fcdd54c45dee5782f5112af1e45ba35bc823882c');
  assert.equal(lock.snapshotLicense, 'MPL-2.0');
  assert.equal(
    lock.schemaUrl,
    `https://github.com/${lock.repository}/blob/${lock.commit}/${lock.schemaPath}`,
  );
});

test('covers every top-level field and every Schema action with validated annotations', () => {
  assert.deepEqual(validateReferenceInputs({schema, annotations}), {
    actionCount: 17,
    annotationCount: 59,
    topLevelFieldCount: 11,
  });
});

test('generates the checked-in reference byte-for-byte deterministically', () => {
  const first = renderReferenceDocument({schema, annotations, lock});
  const second = renderReferenceDocument({schema, annotations, lock});
  assert.equal(first, second);
  assert.equal(generated, first);
  assert.match(generated, new RegExp(lock.commit, 'u'));
  assert.match(generated, new RegExp(lock.schemaSha256, 'u'));
});

test('rejects missing, extra, and ambiguously ordered annotations', () => {
  const missing = structuredClone(annotations);
  missing.sections.find(({id}) => id === 'top-level').entries.pop();
  assert.throws(
    () => validateReferenceInputs({schema, annotations: missing}),
    /Top-level field annotations differ/u,
  );

  const extra = structuredClone(annotations);
  extra.sections
    .find(({id}) => id === 'shared-types')
    .entries.push({
      pointer: '#/$defs/styleId',
      order: 100,
      title: 'extra',
      summary: 'extra',
      example: 'caption',
    });
  assert.throws(
    () => validateReferenceInputs({schema, annotations: extra}),
    /shared-types section annotations differ/u,
  );

  const duplicateOrder = structuredClone(annotations);
  duplicateOrder.sections[0].entries[1].order = duplicateOrder.sections[0].entries[0].order;
  assert.throws(
    () => validateReferenceInputs({schema, annotations: duplicateOrder}),
    /Duplicate order/u,
  );
});
