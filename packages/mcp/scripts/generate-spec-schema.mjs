/* Emits the ChartSpec contract as JSON Schema.
 *
 * Source of truth: src/render/spec-schema.ts (zod). Output:
 * schema/chart-spec.v1.json — committed, shipped in the tarball as
 * `@unovis/mcp/chart-spec.schema.json`, and guarded by
 * test/spec-schema.test.ts (regeneration must be a no-op, recipe output must
 * validate, and the frozen baseline must stay additively compatible).
 *
 * Run: pnpm docs:schema (after pnpm build)
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zodToJsonSchema } from 'zod-to-json-schema'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { chartSpecSchema } = await import(join(root, 'dist', 'render', 'spec-schema.js'))
const { SPEC_VERSION } = await import(join(root, 'dist', 'render', 'spec.js'))

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: `https://unovis.dev/schema/chart-spec.v${SPEC_VERSION}.json`,
  title: 'Unovis ChartSpec',
  description: `The @unovis/mcp chart spec contract, version ${SPEC_VERSION}. While the major is 0, breaking changes bump the minor; from 1.0 on, additions are non-breaking and only the major breaks.`,
  ...zodToJsonSchema(chartSpecSchema, { target: 'jsonSchema7' }),
}

mkdirSync(join(root, 'schema'), { recursive: true })
const outfile = join(root, 'schema', `chart-spec.v${SPEC_VERSION}.json`)
writeFileSync(outfile, JSON.stringify(schema, null, 2) + '\n')
console.error(`✓ ${outfile}`)
