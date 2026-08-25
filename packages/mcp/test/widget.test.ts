/** Executes the real widget bundle in jsdom.
 *
 * The bundle is browser code, so the only honest test is running it: jsdom
 * parses the generated document, executes the inlined IIFE, and we assert a
 * live chart came out. Our env shims are installed through `beforeParse` so
 * they exist before the bundle runs (jsdom has no SVG layout of its own).
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it, beforeAll } from 'vitest'
import { z } from 'zod'

import pkg from '../package.json'

import { loadPage, settle, svgOf } from './widget-harness.js'
import { buildChartDocument, buildEmbedDocument } from '../src/html/document.js'
import { SPEC_VERSION } from '../src/render/spec.js'
import { lineRecipe } from '../src/recipes/line.js'
import { donutRecipe } from '../src/recipes/donut.js'
import { barRecipe } from '../src/recipes/bar.js'
import type { ChartSpec } from '../src/render/spec.js'


describe('interactive widget bundle', () => {
  let lineSpec: ChartSpec
  let donutSpec: ChartSpec

  beforeAll(async () => {
    const lineFixtures = (await import('./fixtures/line.js')).default
    const donutFixtures = (await import('./fixtures/donut.js')).default
    lineSpec = lineRecipe.toSpec(z.object(lineRecipe.inputShape).parse(lineFixtures[0].input))
    donutSpec = donutRecipe.toSpec(z.object(donutRecipe.inputShape).parse(donutFixtures[0].input))
  })

  it('renders an XY chart with axes, series and a live legend', async () => {
    const page = await loadPage(buildChartDocument(lineSpec, { duration: 0 }))
    expect(page.errors).toEqual([])

    const svg = svgOf(page)
    expect(svg, 'chart svg exists').toBeTruthy()
    expect(svg!.querySelectorAll('path[d^="M"]').length).toBeGreaterThan(0)
    // Axis ticks prove the bbox-driven layout ran in the browser code path
    expect(svg!.querySelectorAll('text').length).toBeGreaterThan(4)

    // BulletLegend is a real HTML component — impossible in static SVG output
    const legend = page.window.document.querySelector('.uv-legend')
    expect(legend?.textContent).toContain('Visits')
    expect(page.window.document.querySelector('.uv-title')?.textContent).toBe(lineSpec.title)
  })

  it('renders a single-container chart', async () => {
    const page = await loadPage(buildChartDocument(donutSpec, { duration: 0 }))
    expect(page.errors).toEqual([])
    expect(svgOf(page)!.querySelectorAll('path[d]').length).toBeGreaterThan(2)
  })

  it('shows a tooltip when a mark is hovered', async () => {
    const barFixtures = (await import('./fixtures/bar.js')).default
    const barSpec = barRecipe.toSpec(z.object(barRecipe.inputShape).parse(barFixtures[0].input))
    const page = await loadPage(buildChartDocument(barSpec, { duration: 0 }))

    // The bar <path> carries the data record; the wrapping <g> does not
    const bar = svgOf(page)!.querySelector('path[class*="bar"]') as SVGElement
    expect(bar, 'a bar mark exists to hover').toBeTruthy()

    for (const type of ['mouseenter', 'mouseover', 'mousemove']) {
      bar.dispatchEvent(new page.window.MouseEvent(type, { bubbles: true, clientX: 100, clientY: 100 }))
    }
    await settle(page, '[class*="tooltip"]')

    const tooltip = page.window.document.querySelector('[class*="tooltip"]')
    expect(tooltip, 'hovering renders a tooltip').toBeTruthy()
    // Our templates emit labelled rows built from the spec's fields
    expect(tooltip?.textContent).toContain('alpha')
  })

  it('configures a crosshair on continuous XY charts', async () => {
    const page = await loadPage(buildChartDocument(lineSpec, { duration: 0 }))
    expect(svgOf(page)!.querySelector('[class*="crosshair"]')).toBeTruthy()
    // Missing y accessors make Crosshair warn and skip its markers
    expect(page.errors.join(' ')).not.toContain('accessors have not been configured')
  })

  it('exposes the render API and applies the dark theme', async () => {
    const page = await loadPage(buildChartDocument({ ...lineSpec, theme: 'dark' }, { duration: 0 }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(typeof (page.window as any).UnovisChart?.render).toBe('function')
    expect(page.window.document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('serves an embed document that renders specs sent over postMessage', async () => {
    const page = await loadPage(buildEmbedDocument())
    expect(page.errors).toEqual([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (page.window as any).UnovisChart
    expect(typeof api.startEmbed).toBe('function')

    // The ready handshake reports versions, so a host with a persisted embed
    // document can assert compatibility instead of rendering blind
    const ready = await new Promise<Record<string, unknown>>((resolve) => {
      page.window.addEventListener('message', (event: MessageEvent) => {
        if (event.data?.type === 'unovis:ready') resolve(event.data as Record<string, unknown>)
      })
      api.startEmbed()
    })
    expect(ready.version).toBe(pkg.version)
    expect(ready.specVersion).toBe(SPEC_VERSION)

    // Drive the protocol directly: the listener is installed by startEmbed()
    page.window.postMessage({ type: 'unovis:render', spec: lineSpec, options: { duration: 0 } }, '*')
    await settle(page, '#uv-embed-root .uv-chart svg')
    const svg = svgOf(page, '#uv-embed-root .uv-chart')
    expect(svg, 'embed rendered the posted spec').toBeTruthy()
  })

  it('inlines everything needed to open offline', () => {
    const html = buildChartDocument(lineSpec, { duration: 0 })
    expect(html).not.toMatch(/<script[^>]+src=/)
    expect(html).not.toMatch(/<link[^>]+href=/)
    expect(html).toContain('id="uv-spec"')
    // The embedded JSON must not be able to close its own script element
    expect(html).not.toContain('</script>"')
  })

  it('ships the widget compressed, with the spec still readable', () => {
    const compressed = buildChartDocument(lineSpec, { duration: 0 })
    const plain = buildChartDocument(lineSpec, { duration: 0, compress: false })

    expect(compressed).toContain('id="uv-bundle-gz"')
    // The spec stays plain text so committed artifacts diff meaningfully
    expect(compressed).toContain('id="uv-spec"')
    expect(compressed.length).toBeLessThan(plain.length / 2)

    // The payload must never be able to terminate its host script element
    const payload = compressed.match(/id="uv-bundle-gz">([^<]*)</)![1]
    expect(payload).toMatch(/^[A-Za-z0-9+/=]+$/)
  })

  it('renders from a plain (uncompressed) document too', async () => {
    const page = await loadPage(buildChartDocument(lineSpec, { duration: 0, compress: false }))
    expect(page.errors).toEqual([])
    expect(svgOf(page), 'plain document rendered').toBeTruthy()
  })
})

describe('widget bundle artifact', () => {
  it('excludes browser-only map and layout dependencies', () => {
    const bundle = readFileSync(new URL('../dist/widget/bundle.js', import.meta.url), 'utf8')
    expect(bundle.length).toBeGreaterThan(100_000)
    for (const excluded of ['maplibre', 'leaflet-src', 'elk.bundled']) {
      expect(bundle, `${excluded} must not be bundled`).not.toContain(excluded)
    }
  })
})
