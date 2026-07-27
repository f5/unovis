/** Every chart type, rendered interactively.
 *
 * The widget only shares the spec layer with the static renderer — components,
 * interactions and sizing all take different paths in the browser — so each
 * recipe is executed through the real bundle in jsdom and checked for content
 * plus a clean console.
 */
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { JSDOM, VirtualConsole } from 'jsdom'
import { z } from 'zod'

import { installBBoxPolyfills } from '../src/env/bbox.js'
import { installCanvasHook } from '../src/env/canvas.js'
import { installComputedStyle } from '../src/env/computed-style.js'
import { RafQueue } from '../src/env/raf-queue.js'
import { buildChartDocument } from '../src/html/document.js'
import { recipes } from '../src/recipes/index.js'
import { resolveMapMarkers } from '../src/render/renderer.js'
import type { ChartSpec } from '../src/render/spec.js'

/* eslint-disable @typescript-eslint/no-empty-function */
class NoopResizeObserver {
  observe (): void {}
  unobserve (): void {}
  disconnect (): void {}
}
/* eslint-enable @typescript-eslint/no-empty-function */

const tick = (): Promise<void> => new Promise(resolve => setImmediate(resolve))

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')
const fixtureFileFor = (recipeName: string): string =>
  join(fixturesDir, `${recipeName.replace(/^generate_/, '').replace(/_(chart|plot|diagram|map)$/, '').replace(/_/g, '-')}.ts`)

interface RenderedWidget {
  svg: SVGSVGElement | null;
  marks: number;
  texts: number;
  consoleMessages: string[];
}

async function renderInBrowserLike (spec: ChartSpec): Promise<RenderedWidget> {
  const raf = new RafQueue()
  const consoleMessages: string[] = []
  const virtualConsole = new VirtualConsole()
  const collect = (...args: unknown[]): void => { consoleMessages.push(args.map(String).join(' ')) }
  virtualConsole.on('error', collect)
  virtualConsole.on('warn', collect)
  virtualConsole.on('jsdomError', (e: Error) => collect(e.message ?? e))

  const dom = new JSDOM(buildChartDocument(spec, { duration: 0 }), {
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
      Object.defineProperties(window.HTMLElement.prototype, {
        clientWidth: { configurable: true, get: () => 800 },
        clientHeight: { configurable: true, get: () => 500 },
      })
    },
  })

  for (let round = 0; round < 30; round++) {
    await tick()
    raf.flushAll()
    if (dom.window.document.querySelector('.uv-chart svg *')) break
  }
  for (const error of raf.errors) consoleMessages.push(String(error))

  const svg = dom.window.document.querySelector('.uv-chart svg') as SVGSVGElement | null
  return {
    svg,
    marks: svg?.querySelectorAll('path[d], rect[width], circle[r], line[x1]').length ?? 0,
    texts: svg?.querySelectorAll('text').length ?? 0,
    consoleMessages,
  }
}

const cases = recipes
  .filter(recipe => existsSync(fixtureFileFor(recipe.name)))
  .map(recipe => [recipe.name, recipe] as const)

describe.each(cases)('%s renders interactively', (name, recipe) => {
  it('draws marks with no console errors', async () => {
    const samples = (await import(fixtureFileFor(name))).default as { input: Record<string, unknown> }[]
    const input = z.object(recipe.inputShape).parse(samples[0].input)
    const spec = recipe.toSpec(input)
    // Map data is resolved server-side; the browser bundle has no map payloads
    const browserSpec: ChartSpec = { ...spec, components: await resolveMapMarkers(spec.components) }

    const rendered = await renderInBrowserLike(browserSpec)

    expect(rendered.svg, 'chart svg exists').toBeTruthy()
    expect(rendered.marks, 'chart drew marks').toBeGreaterThan(0)
    expect(rendered.consoleMessages).toEqual([])
  }, 30000)
})
