/** Renders every fixture of every registered recipe and checks structural
 * invariants + pixel-based visual snapshots (see test/image-snapshot.ts —
 * rendered pixels within a tolerance, not bytes, so harmless upstream
 * attribute changes don't churn and visual changes fail with a reviewable
 * diff image). Text metrics come from the pinned Inter, so rasters are
 * comparable across machines. */
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { recipes } from '../src/recipes/index.js'
import { renderChart } from '../src/render/renderer.js'

import { matchImageSnapshot } from './image-snapshot.js'

interface Sample { name: string; input: Record<string, unknown>; vitestSkip?: boolean; noSnapshot?: boolean }

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')

const fixtureFileFor = (recipeName: string): string =>
  join(fixturesDir, `${recipeName.replace(/^generate_/, '').replace(/_(chart|plot|diagram|map)$/, '').replace(/_/g, '-')}.ts`)

describe.each(recipes.map(r => [r.name, r] as const))('%s', (name, recipe) => {
  const fixtureFile = fixtureFileFor(name)

  it('has a fixture file', () => {
    expect(existsSync(fixtureFile), `expected ${fixtureFile}`).toBe(true)
  })

  it('renders every fixture to a standalone SVG', async () => {
    const samples: Sample[] = (await import(fixtureFile)).default
    expect(samples.length).toBeGreaterThan(0)

    for (const sample of samples) {
      if (sample.vitestSkip) continue // loader-limited fixture — covered by the samples harness
      const input = z.object(recipe.inputShape).parse(sample.input)
      const spec = recipe.toSpec(input)
      const result = await renderChart(spec, { idPrefix: 'snap-' })

      expect(result.svg.startsWith('<svg'), `${sample.name}: starts with <svg`).toBe(true)
      expect(result.svg, `${sample.name}: no unresolved vars`).not.toContain('var(')
      expect(result.svg, `${sample.name}: no NaN geometry`).not.toContain('NaN')
      expect(result.svg, `${sample.name}: no base URL refs`).not.toContain('localhost')
      expect(result.svg, `${sample.name}: no emotion classes`).not.toContain('class=')
      expect(result.warnings, `${sample.name}: no render warnings`).toEqual([])

      // Force-directed layouts call Math.random() (d3-force's jiggle), so their
      // geometry can't be snapshotted — the structural assertions above still apply
      if (!sample.noSnapshot) {
        const match = await matchImageSnapshot(result.svg, `${name.replace(/^generate_/, '')}-${sample.name}`)
        expect(match.ok, match.message).toBe(true)
      }
    }
  })

  it('produces a serializable spec (config output mode)', async () => {
    const samples: Sample[] = (await import(fixtureFile)).default
    const input = z.object(recipe.inputShape).parse(samples[0].input)
    const spec = recipe.toSpec(input)
    const roundTripped = JSON.parse(JSON.stringify(spec))
    expect(roundTripped).toEqual(spec)
  })
})
