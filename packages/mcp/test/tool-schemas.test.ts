/* Every tool schema has to survive the client's own validation before a single
 * chart can be rendered. The Anthropic API validates `input_schema` against
 * JSON Schema draft 2020-12 and rejects the whole request — every tool, not
 * just the offending one — so a schema-shape regression takes the server
 * completely offline in a way no render test can see.
 *
 * The SDK converts Zod v3 through `zod-to-json-schema`, which targets draft-07.
 * Most of that output is valid 2020-12 too; these are the constructs that
 * aren't, plus a real meta-schema validation to catch the ones we haven't met
 * yet. */
import { describe, expect, it } from 'vitest'
import Ajv2020 from 'ajv/dist/2020.js'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

import { buildServer } from '../src/server.js'

type JsonSchema = Record<string, unknown>

async function listToolSchemas (): Promise<{ name: string; schema: JsonSchema }[]> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const server = buildServer()
  const client = new Client({ name: 'schema-test', version: '0.0.0' })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  const { tools } = await client.listTools()
  return tools.map(t => ({ name: t.name, schema: t.inputSchema as JsonSchema }))
}

/** Walk every subschema, reporting draft-07-only constructs by JSON pointer */
function draft07Only (schema: unknown, path = ''): string[] {
  if (!schema || typeof schema !== 'object') return []
  if (Array.isArray(schema)) return schema.flatMap((s, i) => draft07Only(s, `${path}/${i}`))

  const node = schema as JsonSchema
  const issues: string[] = []
  // 2020-12 split the tuple form out into `prefixItems`; `items` must be a schema
  if (Array.isArray(node.items)) issues.push(`${path}/items is an array (draft-07 tuple form) — use z.array(x).length(n), not z.tuple([...])`)
  if ('additionalItems' in node) issues.push(`${path}/additionalItems was removed in 2020-12`)
  if ('dependencies' in node) issues.push(`${path}/dependencies was split into dependentSchemas/dependentRequired`)
  if (typeof node.exclusiveMinimum === 'boolean' || typeof node.exclusiveMaximum === 'boolean') {
    issues.push(`${path}/exclusiveMinimum|Maximum is a boolean (draft-04 form)`)
  }
  return issues.concat(Object.entries(node).flatMap(([key, value]) => draft07Only(value, `${path}/${key}`)))
}

describe('tool input schemas', () => {
  it('use no draft-07-only constructs', async () => {
    const tools = await listToolSchemas()
    expect(tools.length).toBeGreaterThan(0)

    const offenders = tools
      .map(({ name, schema }) => ({ name, issues: draft07Only(schema) }))
      .filter(t => t.issues.length > 0)

    expect(offenders.map(o => `${o.name}: ${o.issues.join('; ')}`)).toEqual([])
  })

  it('validate against the draft 2020-12 meta-schema', async () => {
    const tools = await listToolSchemas()
    // strict:false — the meta-schema check is the point, not ajv's extra rules;
    // `$schema` is stripped because the SDK stamps the draft-07 URI on output
    // that is otherwise 2020-12 compatible, and ajv would refuse to compile it.
    const ajv = new Ajv2020({ strict: false, validateFormats: false })

    const failures = tools.flatMap(({ name, schema }) => {
      const { $schema, ...rest } = schema
      try {
        ajv.compile(rest)
        return []
      } catch (error) {
        return [`${name}: ${(error as Error).message}`]
      }
    })

    expect(failures).toEqual([])
  })

  it('inline every subschema instead of cross-referencing sibling properties', async () => {
    // zod-to-json-schema emits `$ref: #/properties/x/...` when one zod instance
    // is reused in a schema. Clients that flatten refs drop the type entirely:
    // `y` arrived as a bare description, so an array argument was serialised as
    // a JSON string and the call failed with "field [...] not found in data".
    const tools = await listToolSchemas()
    const refs = tools.flatMap(({ name, schema }) => {
      const found: string[] = []
      const walk = (node: unknown, path: string): void => {
        if (!node || typeof node !== 'object') return
        if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}/${i}`))
        const record = node as JsonSchema
        if (typeof record.$ref === 'string') found.push(`${name}: ${path} → ${record.$ref}`)
        Object.entries(record).forEach(([key, value]) => walk(value, `${path}/${key}`))
      }
      walk(schema, '')
      return found
    })

    expect(refs).toEqual([])
  })

  it('describes multi-series y as a string or array of strings', async () => {
    const tools = await listToolSchemas()
    const line = tools.find(t => t.name === 'generate_line_chart')
    const y = (line?.schema.properties as Record<string, JsonSchema>).y
    const branches = y.anyOf as JsonSchema[]

    expect(branches).toHaveLength(2)
    expect(branches[0].type).toBe('string')
    expect(branches[1].type).toBe('array')
    expect((branches[1].items as JsonSchema).type).toBe('string')
  })

  it('keeps the 2-item range options usable', async () => {
    const tools = await listToolSchemas()
    const scatter = tools.find(t => t.name === 'generate_scatter_plot')
    const sizeRange = (scatter?.schema.properties as Record<string, JsonSchema>).sizeRange

    expect(sizeRange.type).toBe('array')
    expect(sizeRange.items).not.toBeInstanceOf(Array)
    expect(sizeRange.minItems).toBe(2)
    expect(sizeRange.maxItems).toBe(2)
    expect(sizeRange.default).toEqual([8, 40])
  })
})
