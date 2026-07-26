import { describe, expect, it } from 'vitest'

import { renderChart } from '../src/render/renderer.js'
import type { ChartSpec } from '../src/render/spec.js'

const baseSpec: ChartSpec = {
  container: 'xy',
  width: 600,
  height: 400,
  theme: 'light',
  components: [{
    type: 'Line',
    config: { x: { $field: 'x', as: 'number' }, y: { $field: 'y', as: 'number' } },
  }],
  xAxis: { gridLine: true },
  yAxis: { gridLine: true },
  data: [{ x: 0, y: 10 }, { x: 1, y: 20 }, { x: 2, y: 15 }],
}

describe('svg post-processing', () => {
  it('rewrites ids deterministically and keeps url() refs consistent', async () => {
    const { svg } = await renderChart(baseSpec, { idPrefix: 'pp-' })
    const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map(m => m[1])
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every(id => id.startsWith('pp-'))).toBe(true)
    for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) {
      expect(ids, `url(#${ref}) target exists`).toContain(ref)
    }
  })

  it('synthesizes a title and legend header and grows the height', async () => {
    const { svg } = await renderChart({
      ...baseSpec,
      title: 'My Title',
      legend: [{ name: 'Series A', paletteIndex: 0 }, { name: 'Series B', paletteIndex: 1 }],
    }, { idPrefix: 'pp-' })

    expect(svg).toContain('<title>My Title</title>')
    expect(svg).toContain('>My Title</text>')
    expect(svg).toContain('>Series A</text>')
    expect(svg).toContain('#4D8CFD') // first palette color on the legend swatch
    const height = Number(/height="(\d+)"/.exec(svg)?.[1])
    expect(height).toBeGreaterThan(400)
  })

  it('bakes dark theme values', async () => {
    const { svg } = await renderChart({ ...baseSpec, theme: 'dark' }, { idPrefix: 'pp-' })
    expect(svg).toContain('background-color: rgb(41, 43, 52)') // #292b34, normalized by jsdom
    expect(svg).toContain('#e8e9ef') // dark tick label color
    expect(svg).not.toContain('var(')
  })

  it('applies custom palettes through the colors override', async () => {
    const { svg } = await renderChart({ ...baseSpec, colors: ['#123456'] }, { idPrefix: 'pp-' })
    expect(svg).toContain('#123456')
    expect(svg).not.toContain('#4D8CFD')
  })

  it('keeps emotion classes in keepClasses debug mode', async () => {
    const { svg } = await renderChart(baseSpec, { idPrefix: 'pp-', keepClasses: true })
    expect(svg).toContain('class="')
  })
})
