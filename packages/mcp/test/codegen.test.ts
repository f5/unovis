/** Generated code has to be *real* code: the vanilla-TypeScript target is
 * type-checked against the actual @unovis/ts types, which is the only way to
 * be sure the emitted imports, generics and prop names exist. */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { generateCode, FRAMEWORKS } from '../src/codegen/index.js'
import { lineRecipe } from '../src/recipes/line.js'
import { barRecipe } from '../src/recipes/bar.js'
import { choroplethRecipe } from '../src/recipes/choropleth.js'
import type { ChartSpec } from '../src/render/spec.js'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const lineSpec = (): ChartSpec => lineRecipe.toSpec(z.object(lineRecipe.inputShape).parse({
  data: [{ month: 'Jan', sales: 120, cost: 80 }, { month: 'Feb', sales: 150, cost: 95 }],
  x: 'month',
  y: ['sales', 'cost'],
  seriesLabels: ['Sales', 'Cost'],
  title: 'Revenue',
  yAxisLabel: 'k USD',
}))

describe('code generation', () => {
  it('emits a file for every framework', () => {
    const spec = lineSpec()
    for (const framework of FRAMEWORKS) {
      const files = generateCode(spec, framework)
      expect(files.length, framework).toBeGreaterThan(0)
      for (const file of files) {
        expect(file.content.length, `${framework}/${file.name}`).toBeGreaterThan(100)
        // The data must travel with the snippet so it runs as-is
        expect(file.content, `${framework}/${file.name}`).toMatch(/data/)
      }
    }
  })

  it('uses each wrapper\'s real component names', () => {
    const spec = lineSpec()
    expect(generateCode(spec, 'ts')[0].content).toContain("from '@unovis/ts'")
    expect(generateCode(spec, 'react')[0].content).toContain('<VisXYContainer')
    expect(generateCode(spec, 'svelte')[0].content).toContain("from '@unovis/svelte'")
    expect(generateCode(spec, 'vue')[0].content).toContain('<template>')
    expect(generateCode(spec, 'solid')[0].content).toContain("from '@unovis/solid'")

    const [template, component] = generateCode(spec, 'angular')
    expect(template.content).toContain('<vis-xy-container')
    expect(component.content).toContain('export class ChartComponent')
    // Angular templates can't hold arrows, so accessors become typed fields
    expect(component.content).toMatch(/= \(d: DataRecord[^)]*\) =>/)
  })

  it('references map data by import instead of inlining it', () => {
    const spec = choroplethRecipe.toSpec(z.object(choroplethRecipe.inputShape).parse({
      map: 'world',
      data: [{ id: 'US', value: 21 }, { id: 'BR', value: 85 }],
    }))
    const code = generateCode(spec, 'ts')[0].content
    expect(code).toContain("import { WorldMapTopoJSON } from '@unovis/ts/maps'")
    expect(code).toContain('topojson: WorldMapTopoJSON')
    expect(code.length).toBeLessThan(5000) // the topojson itself is megabytes
  })

  it('type-checks the generated TypeScript against @unovis/ts', () => {
    const specs = {
      line: lineSpec(),
      bar: barRecipe.toSpec(z.object(barRecipe.inputShape).parse({
        data: [{ q: 'Q1', a: 4, b: 7 }, { q: 'Q2', a: 6, b: 5 }],
        x: 'q',
        y: ['a', 'b'],
        type: 'stacked',
      })),
    }

    // Compile inside the package so @unovis/ts resolves from node_modules
    const dir = mkdtempSync(join(packageRoot, 'codegen-check-'))
    try {
      const files: string[] = []
      for (const [name, spec] of Object.entries(specs)) {
        const file = join(dir, `${name}.ts`)
        writeFileSync(file, generateCode(spec, 'ts')[0].content)
        files.push(file)
      }
      execFileSync(join(packageRoot, 'node_modules/.bin/tsc'), [
        '--noEmit', '--strict', '--target', 'ES2022', '--module', 'ESNext',
        '--moduleResolution', 'bundler', '--lib', 'ES2022,DOM', '--skipLibCheck',
        ...files,
      ], { cwd: packageRoot, stdio: 'pipe' })
    } catch (e) {
      const output = (e as { stdout?: Buffer; stderr?: Buffer })
      throw new Error(`generated TypeScript does not compile:\n${output.stdout?.toString() ?? ''}${output.stderr?.toString() ?? ''}`)
    } finally {
      execFileSync('rm', ['-rf', dir])
    }
  }, 120000)
})
