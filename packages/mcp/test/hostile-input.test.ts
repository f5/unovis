/** Hostile-spec fuzzing: chart specs arrive from LLMs and from users editing
 * `config` output — every string field is attacker-shaped until proven inert.
 * A hostile spec must never execute script, inject elements, or escape its
 * container in any output type. */
import { describe, expect, it } from 'vitest'

import { renderChart } from '../src/render/renderer.js'
import { buildChartDocument } from '../src/html/document.js'
import { buildInteractions } from '../src/widget/interactions.js'
import type { ChartSpec } from '../src/render/spec.js'

import { loadPage } from './widget-harness.js'

/* eslint-disable no-template-curly-in-string -- template payloads are the point */
const PAYLOADS = [
  '</script><script>window.__pwned=1</script>',
  '"><img src=x onerror="window.__pwned=1">',
  "'; window.__pwned=1; //",
  '</style><script>window.__pwned=1</script>',
  '${window.__pwned=1}',
  '`${7*7}`',
  '<svg onload="window.__pwned=1">',
  '‮gnp.evil', // RTL override
]
/* eslint-enable no-template-curly-in-string */

const hostile = PAYLOADS.join(' ')

const hostileSpec = (): ChartSpec => ({
  container: 'xy',
  width: 400,
  height: 200,
  theme: 'light',
  title: hostile,
  components: [{
    type: 'Line',
    config: { x: { $field: 'x', as: 'number' }, y: { $field: hostile, as: 'number' } },
  }],
  xAxis: { label: hostile },
  yAxis: { label: hostile },
  legend: [{ name: hostile }],
  data: [
    { x: 0, [hostile]: 1 },
    { x: 1, [hostile]: 3 },
  ],
})

describe('hostile specs stay inert', () => {
  it('in standalone SVG output', async () => {
    const { svg } = await renderChart(hostileSpec())
    // Substrings like "onerror=" may appear as escaped *text*; what must not
    // exist is markup: script elements or event-handler attributes
    const { JSDOM } = await import('jsdom')
    const doc = new JSDOM(svg, { contentType: 'image/svg+xml' }).window.document
    expect(doc.querySelectorAll('script, img, foreignObject').length).toBe(0)
    for (const el of doc.querySelectorAll('*')) {
      for (const attr of el.getAttributeNames()) {
        expect(attr.startsWith('on'), `${el.tagName} carries handler attribute ${attr}`).toBe(false)
      }
      expect(el.getAttribute('href') ?? '').not.toMatch(/^\s*javascript:/i)
    }
    // the payload survives only as escaped text
    expect(svg).toContain('&lt;script&gt;')
  })

  it('in interactive documents executed in a browser context', async () => {
    const html = buildChartDocument(hostileSpec(), { duration: 0, documentTitle: hostile })
    const page = await loadPage(html)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((page.window as any).__pwned, 'no injected script executed').toBeUndefined()
    expect(page.window.document.querySelectorAll('img').length).toBe(0)
    expect(page.window.document.querySelector('.uv-chart svg'), 'chart still rendered').toBeTruthy()
    // the title landed as text, not markup
    expect(page.window.document.querySelector('.uv-title')?.textContent).toContain('</script>')
  })

  it('in tooltip and crosshair templates', () => {
    class Capture { config: Record<string, unknown>; constructor (config: Record<string, unknown>) { this.config = config } }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { containerConfig } = buildInteractions({ Tooltip: Capture, Crosshair: Capture } as never, hostileSpec())
    const template = (containerConfig.crosshair as InstanceType<typeof Capture>).config.template as (d: unknown) => string

    const rendered = template({ x: 1, [hostile]: 42 })
    expect(rendered).not.toContain('<script')
    expect(rendered).not.toContain('<img')
    expect(rendered).toContain('&lt;script&gt;')
  })

  it('numeric spec fields cannot inject through the document stylesheet', async () => {
    // Found by this test: width interpolates into the <style> block, so a
    // string width could close it and open a script element
    const spec = { ...hostileSpec(), width: '</style><script>window.__pwned=1</script>' as unknown as number, height: 200 }
    const html = buildChartDocument(spec, { duration: 0 })
    expect(html).not.toContain('<script>window.__pwned=1</script>')

    const page = await loadPage(html)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((page.window as any).__pwned).toBeUndefined()
  })

  it('render failures echo the offending value as text, never as markup', async () => {
    // The error message quotes the spec's component type; rendered through
    // innerHTML that quote would have been live HTML
    const spec = { ...hostileSpec(), components: [{ type: PAYLOADS[1], config: {} }] }
    const page = await loadPage(buildChartDocument(spec, { duration: 0 }))

    const error = page.window.document.querySelector('.uv-error')
    expect(error?.textContent).toContain('Failed to render chart')
    expect(error?.textContent).toContain('<img')
    expect(error?.children.length, 'message rendered as a text node').toBe(0)
    expect(page.window.document.querySelectorAll('img').length).toBe(0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((page.window as any).__pwned).toBeUndefined()
  })

  it('spec-controlled names cannot reach inherited object members', async () => {
    // `MapProjection['constructor']` is Object — callable, and not a projection
    for (const name of ['constructor', 'toString', '__proto__']) {
      const spec: ChartSpec = {
        container: 'single',
        width: 400,
        height: 200,
        theme: 'light',
        components: [{
          type: 'TopoJSONMap',
          config: { topojson: { $unovisMap: 'WorldMapTopoJSON' }, projection: { $mapProjection: name } },
        }],
        data: { areas: [] },
      }
      await expect(renderChart(spec)).rejects.toThrow(`Unknown map projection: ${name}`)
    }
  })

  it('unknown label positions on plot decorations fall back instead of crashing the render', async () => {
    // `labelPosition` indexes a layout map; '__proto__' used to reach
    // Object.prototype and throw "is not a function" mid-render
    for (const position of ['__proto__', 'constructor', 'not-a-position']) {
      const spec: ChartSpec = {
        ...hostileSpec(),
        title: 'decorations',
        components: [
          { type: 'Line', config: { x: { $field: 'x', as: 'number' }, y: { $field: 'y', as: 'number' } } },
          { type: 'Plotband', config: { from: 1, to: 2, labelText: 'band label', labelPosition: position } },
          { type: 'Plotline', config: { value: 2.5, labelText: 'line label', labelPosition: position } },
        ],
        data: [{ x: 0, y: 1 }, { x: 1, y: 3 }],
      }
      const { svg } = await renderChart(spec)
      expect(svg).toContain('band label')
      expect(svg).toContain('line label')
    }
  })
})
