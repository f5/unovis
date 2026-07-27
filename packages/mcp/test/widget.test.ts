/** Executes the real widget bundle in jsdom.
 *
 * The bundle is browser code, so the only honest test is running it: jsdom
 * parses the generated document, executes the inlined IIFE, and we assert a
 * live chart came out. Our env shims are installed through `beforeParse` so
 * they exist before the bundle runs (jsdom has no SVG layout of its own).
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it, beforeAll } from 'vitest'
import { JSDOM, VirtualConsole } from 'jsdom'
import { z } from 'zod'

import { installBBoxPolyfills } from '../src/env/bbox.js'
import { installCanvasHook } from '../src/env/canvas.js'
import { installComputedStyle } from '../src/env/computed-style.js'
import { RafQueue } from '../src/env/raf-queue.js'
import { buildChartDocument, buildEmbedDocument } from '../src/html/document.js'
import { lineRecipe } from '../src/recipes/line.js'
import { donutRecipe } from '../src/recipes/donut.js'
import { barRecipe } from '../src/recipes/bar.js'
import type { ChartSpec } from '../src/render/spec.js'

/* eslint-disable @typescript-eslint/no-empty-function */
class NoopResizeObserver {
  observe (): void {}
  unobserve (): void {}
  disconnect (): void {}
}
/* eslint-enable @typescript-eslint/no-empty-function */

interface LoadedPage {
  window: JSDOM['window'];
  raf: RafQueue;
  errors: string[];
}

const tick = (): Promise<void> => new Promise(resolve => setImmediate(resolve))

/** Load an HTML document, execute its scripts, and drain animation frames.
 * Async because the widget renders on DOMContentLoaded, which jsdom fires
 * after the constructor returns. */
async function loadPage (html: string): Promise<LoadedPage> {
  const raf = new RafQueue()
  const errors: string[] = []
  const virtualConsole = new VirtualConsole()
  virtualConsole.on('jsdomError', (e: Error) => errors.push(String(e.message ?? e)))
  virtualConsole.on('error', (...args: unknown[]) => errors.push(args.map(String).join(' ')))
  virtualConsole.on('warn', (...args: unknown[]) => errors.push(args.map(String).join(' ')))

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: false,
    url: 'http://localhost/',
    virtualConsole,
    beforeParse (window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      w.requestAnimationFrame = raf.request
      w.cancelAnimationFrame = raf.cancel
      w.ResizeObserver = NoopResizeObserver
      installCanvasHook(window)
      installBBoxPolyfills(window)
      installComputedStyle(window)
      // The chart sizes itself from its container, which jsdom never lays out
      Object.defineProperties(window.HTMLElement.prototype, {
        clientWidth: { configurable: true, get: () => 800 },
        clientHeight: { configurable: true, get: () => 400 },
      })
    },
  })

  const page = { window: dom.window, raf, errors }
  // Parsing, DOMContentLoaded and postMessage all resolve asynchronously in
  // jsdom, so settle instead of guessing a fixed number of ticks
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  await settle(page, '.uv-chart svg')
  return page
}

/** Alternate task ticks and frame flushes until `selector` matches */
async function settle (page: LoadedPage, selector: string, rounds = 20): Promise<void> {
  for (let round = 0; round < rounds; round++) {
    await tick()
    page.raf.flushAll()
    if (page.window.document.querySelector(selector)) break
  }
  for (const error of page.raf.errors) {
    if (!page.errors.includes(String(error))) page.errors.push(String(error))
  }
}

/** The chart's own SVG — scoped to .uv-chart so the legend's bullet SVGs
 * (BulletLegend renders one per item) don't match first */
const svgOf = (page: LoadedPage, root = '.uv-chart'): SVGSVGElement | null =>
  page.window.document.querySelector(`${root} svg`) as SVGSVGElement | null

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
