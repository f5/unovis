/** Shared jsdom harness for tests that execute the real widget bundle.
 *
 * The bundle is browser code, so the only honest test is running it: jsdom
 * parses the generated document, executes the inlined IIFE, and the tests
 * assert on the live result. Env shims install through `beforeParse` so they
 * exist before the bundle runs (jsdom has no SVG layout of its own).
 */
import { JSDOM, VirtualConsole } from 'jsdom'

import { installBBoxPolyfills } from '../src/env/bbox.js'
import { installCanvasHook } from '../src/env/canvas.js'
import { installComputedStyle } from '../src/env/computed-style.js'
import { RafQueue } from '../src/env/raf-queue.js'

/* eslint-disable @typescript-eslint/no-empty-function */
class NoopResizeObserver {
  observe (): void {}
  unobserve (): void {}
  disconnect (): void {}
}
/* eslint-enable @typescript-eslint/no-empty-function */

export interface LoadedPage {
  window: JSDOM['window'];
  raf: RafQueue;
  errors: string[];
}

const tick = (): Promise<void> => new Promise(resolve => setImmediate(resolve))

/** Load an HTML document, execute its scripts, and drain animation frames.
 * Async because the widget renders on DOMContentLoaded, which jsdom fires
 * after the constructor returns. */
export async function loadPage (html: string): Promise<LoadedPage> {
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
export async function settle (page: LoadedPage, selector: string, rounds = 60): Promise<void> {
  for (let round = 0; round < rounds; round++) {
    await tick()
    page.raf.flushAll()
    if (page.window.document.querySelector(selector)) break
    // Parsing a ~665kB bundle and delivering postMessage both take real time
    if (round > 10) await new Promise(resolve => setTimeout(resolve, 5))
  }
  for (const error of page.raf.errors) {
    if (!page.errors.includes(String(error))) page.errors.push(String(error))
  }
}

/** The chart's own SVG — scoped to .uv-chart so the legend's bullet SVGs
 * (BulletLegend renders one per item) don't match first */
export const svgOf = (page: LoadedPage, root = '.uv-chart'): SVGSVGElement | null =>
  page.window.document.querySelector(`${root} svg`) as SVGSVGElement | null
