/** Three lines of defense around the published ChartSpec contract:
 *  1. the committed JSON Schema matches the zod source (no silent drift),
 *  2. every spec the recipes produce actually validates against it,
 *  3. the frozen v1 baseline stays additively compatible — properties may be
 *     added, never removed, retyped, or newly required. Breaking the baseline
 *     means bumping SPEC_VERSION and freezing a new one, deliberately. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import Ajv from 'ajv'

import { chartSpecSchema } from '../src/render/spec-schema.js'
import { SPEC_VERSION } from '../src/render/spec.js'
import { recipes } from '../src/recipes/index.js'
import { renderChart } from '../src/render/renderer.js'

const schemaDir = join(__dirname, '..', 'schema')
const committed = JSON.parse(readFileSync(join(schemaDir, `chart-spec.v${SPEC_VERSION}.json`), 'utf8'))
const baseline = JSON.parse(readFileSync(join(schemaDir, `chart-spec.v${SPEC_VERSION}.baseline.json`), 'utf8'))

/** Fixture input per recipe (the browser smoke lane keeps an equivalent set;
 * these are intentionally minimal) */
/* eslint-disable @typescript-eslint/naming-convention -- keys are tool names */
const INPUTS: Record<string, Record<string, unknown>> = {
  generate_line_chart: { data: [{ t: '2026-08-01', a: 3 }, { t: '2026-08-05', a: 6 }], x: 't', xIsTime: true, y: 'a' },
  generate_area_chart: { data: [{ t: 1, a: 3, b: 5 }, { t: 2, a: 6, b: 2 }], x: 't', y: ['a', 'b'] },
  generate_bar_chart: { data: [{ c: 'A', v: 3 }, { c: 'B', v: 6 }], x: 'c', y: 'v' },
  generate_scatter_plot: { data: [{ x: 1, y: 2 }, { x: 2, y: 5 }], x: 'x', y: 'y' },
  generate_donut_chart: { data: [{ k: 'A', v: 4 }, { k: 'B', v: 6 }], value: 'v', label: 'k' },
  generate_timeline_chart: { data: [{ row: 'T1', start: 0, end: 5 }], row: 'row', start: 'start', end: 'end' },
  generate_boxplot: { data: [{ g: 'A', v: 1 }, { g: 'A', v: 3 }, { g: 'B', v: 2 }], groupBy: 'g', value: 'v' },
  generate_sankey_diagram: { nodes: [{ id: 'a' }, { id: 'b' }], links: [{ source: 'a', target: 'b', value: 3 }] },
  generate_heatmap: { data: [{ r: 'x', c: 'p', v: 1 }], row: 'r', column: 'c', value: 'v' },
  generate_treemap: { data: [{ g: 'A', k: 'a1', v: 5 }], layers: ['g', 'k'], value: 'v' },
  generate_chord_diagram: { links: [{ source: 'a', target: 'b', value: 3 }] },
  generate_nested_donut_chart: { data: [{ l1: 'A', l2: 'a1', v: 4 }], layers: ['l1', 'l2'] },
  generate_radial_bar_chart: { data: [{ k: 'A', v: 4 }], value: 'v', label: 'k' },
  generate_network_graph: { nodes: [{ id: 'a' }, { id: 'b' }], links: [{ source: 'a', target: 'b' }] },
  generate_choropleth_map: { data: [{ id: 'US', value: 5 }] },
}
/* eslint-enable @typescript-eslint/naming-convention */

describe('chart spec schema', () => {
  it('committed schema matches the zod source — run pnpm docs:schema after changing it', () => {
    const regenerated = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: `https://unovis.dev/schema/chart-spec.v${SPEC_VERSION}.json`,
      title: 'Unovis ChartSpec',
      description: `The @unovis/mcp chart spec contract, version ${SPEC_VERSION}. While the major is 0, breaking changes bump the minor; from 1.0 on, additions are non-breaking and only the major breaks.`,
      ...zodToJsonSchema(chartSpecSchema, { target: 'jsonSchema7' }),
    }
    expect(JSON.parse(JSON.stringify(regenerated))).toEqual(committed)
  })

  it('every recipe-produced spec validates', () => {
    const ajv = new Ajv({ strict: false })
    const validate = ajv.compile(committed)
    for (const recipe of recipes) {
      const input = INPUTS[recipe.name]
      expect(input, `fixture input for ${recipe.name}`).toBeDefined()
      const spec = recipe.toSpec(z.object(recipe.inputShape).parse(input) as never)
      const valid = validate(spec)
      expect(validate.errors, `${recipe.name} spec validates`).toBeNull()
      expect(valid).toBe(true)
    }
  })

  it('a validated spec is renderable and an invalid one is refused by validation', async () => {
    const ajv = new Ajv({ strict: false })
    const validate = ajv.compile(committed)

    const good = { container: 'xy', width: 400, height: 200, theme: 'light', components: [{ type: 'Line', config: { x: { $field: 'x', as: 'number' }, y: { $field: 'y', as: 'number' } } }], data: [{ x: 0, y: 1 }, { x: 1, y: 2 }] }
    expect(validate(good)).toBe(true)
    const { svg } = await renderChart(good as never)
    expect(svg.startsWith('<svg')).toBe(true)

    expect(validate({ ...good, container: 'polar' })).toBe(false)
    expect(validate({ ...good, components: [{ type: 'Marquee', config: {} }] })).toBe(false)
    expect(validate({ ...good, extraTopLevel: 1 })).toBe(false)
  })

  it('stays additively compatible with the frozen baseline', () => {
    const problems: string[] = []

    const walk = (base: unknown, current: unknown, path: string): void => {
      if (typeof base !== 'object' || base === null) {
        if (JSON.stringify(base) !== JSON.stringify(current)) problems.push(`${path}: ${JSON.stringify(base)} → ${JSON.stringify(current)}`)
        return
      }
      if (current === null || typeof current !== 'object') {
        problems.push(`${path}: no longer an object`)
        return
      }
      const b = base as Record<string, unknown>
      const c = current as Record<string, unknown>

      for (const [key, value] of Object.entries(b)) {
        if (key === 'properties') {
          const bp = value as Record<string, unknown>
          const cp = (c.properties ?? {}) as Record<string, unknown>
          for (const prop of Object.keys(bp)) {
            if (!(prop in cp)) problems.push(`${path}.properties.${prop}: removed`)
            else walk(bp[prop], cp[prop], `${path}.properties.${prop}`)
          }
        } else if (key === 'required') {
          // consumers validating specs break when NEW requirements appear
          const added = ((c.required ?? []) as string[]).filter(r => !(value as string[]).includes(r))
          if (added.length) problems.push(`${path}.required gained ${added.join(', ')}`)
        } else if (key === 'enum') {
          const missing = (value as unknown[]).filter(v => !((c.enum ?? []) as unknown[]).some(x => JSON.stringify(x) === JSON.stringify(v)))
          if (missing.length) problems.push(`${path}.enum lost ${missing.map(m => JSON.stringify(m)).join(', ')}`)
        } else if (key === 'description' || key === '$id' || key === 'markdownDescription') {
          // prose may improve freely
        } else if (key === 'anyOf' || key === 'oneOf') {
          const cv = (c[key] ?? []) as unknown[]
          const bv = value as unknown[]
          if (cv.length < bv.length) problems.push(`${path}.${key}: branches removed`)
          else bv.forEach((branch, i) => walk(branch, cv[i], `${path}.${key}[${i}]`))
        } else {
          walk(value, c[key], `${path}.${key}`)
        }
      }
    }

    walk(baseline, committed, '$')
    expect(problems).toEqual([])
  })
})
